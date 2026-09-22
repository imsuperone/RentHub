// src/modules/attachments/index.ts
// 文件附件管理：多渠道加密存储 (支持本地 D1 加密直存、WebDAV 云盘、S3 兼容对象存储)

import { Env, WebDavConfig, S3Config, Attachment } from '../../types';
import {
  generateRandomHex,
  deriveKeyFromSecret,
  encryptBuffer,
  decryptBuffer,
  bytesToBase64,
  base64ToBytes,
} from '../../utils/crypto';
import {
  uploadEncryptedFileToWebDav,
  downloadAndDecryptFromWebDav,
  deleteFromWebDav,
} from '../webdav';
import {
  uploadEncryptedFileToS3,
  downloadAndDecryptFromS3,
  deleteFromS3,
} from '../s3';
import { jsonOk, jsonError } from '../../utils/response';

async function getWebDavConfig(env: Env): Promise<WebDavConfig | null> {
  const row = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'webdav_config'").first();
  if (!row || !row.value) return null;
  try {
    return JSON.parse(row.value as string);
  } catch {
    return null;
  }
}

async function getS3Config(env: Env): Promise<S3Config | null> {
  const row = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 's3_config'").first();
  if (!row || !row.value) return null;
  try {
    return JSON.parse(row.value as string);
  } catch {
    return null;
  }
}

async function getDefaultStorage(env: Env): Promise<'D1_LOCAL' | 'WEBDAV' | 'S3'> {
  const row = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'default_storage'").first();
  const val = row?.value as string;
  if (val === 'WEBDAV' || val === 'S3' || val === 'D1_LOCAL') return val;
  return 'D1_LOCAL';
}

export async function handleListAttachments(env: Env, leaseId?: string, paymentId?: string) {
  let query = `SELECT id, lease_id, payment_id, file_name, file_size, mime_type, category, 
                      webdav_path, storage_type, enc_iv, created_at 
               FROM attachments WHERE 1=1`;
  const params: any[] = [];

  if (leaseId) {
    query += ' AND lease_id = ?';
    params.push(leaseId);
  }
  if (paymentId) {
    query += ' AND payment_id = ?';
    params.push(paymentId);
  }
  query += ' ORDER BY created_at DESC';

  const stmt = env.DB.prepare(query);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

  return jsonOk(result.results);
}

export async function handleUploadAttachment(env: Env, formData: FormData) {
  const file = formData.get('file') as File | null;
  let leaseId = ((formData.get('lease_id') as string) || (formData.get('leaseId') as string) || null)?.trim() || null;
  const paymentId = ((formData.get('payment_id') as string) || (formData.get('paymentId') as string) || null)?.trim() || null;
  const category = ((formData.get('category') as string) || 'RECEIPT') as Attachment['category'];
  const requestedStorage = ((formData.get('storage_type') as string) || (formData.get('target_storage') as string) || '')?.trim().toUpperCase();

  if (!leaseId && paymentId) {
    const pmt = await env.DB.prepare('SELECT lease_id FROM payments WHERE id = ?').bind(paymentId).first();
    if (pmt && pmt.lease_id) {
      leaseId = pmt.lease_id as string;
    }
  }

  if (!file) {
    return jsonError('请选择要上传的文件', 400);
  }

  // 1. 获取主盐值并派生 AES-256-GCM 加密密钥
  const user = await env.DB.prepare('SELECT salt FROM users LIMIT 1').first();
  const salt = user ? (user.salt as string) : 'zufang_default_salt';
  const cryptoKey = await deriveKeyFromSecret(salt, 'zufang_file_encryption');

  // 2. 读取文件字节流
  const buffer = await file.arrayBuffer();
  const attachmentId = 'att_' + generateRandomHex(8);

  // 3. 决定存储渠道
  const webdavConfig = await getWebDavConfig(env);
  const s3Config = await getS3Config(env);
  const defaultStorage = await getDefaultStorage(env);

  const isWebDavActive = !!(webdavConfig && webdavConfig.is_enabled && webdavConfig.endpoint);
  const isS3Active = !!(s3Config && s3Config.is_enabled && s3Config.endpoint && s3Config.bucket);

  let chosenStorage: 'D1_LOCAL' | 'WEBDAV' | 'S3' = 'D1_LOCAL';

  if (requestedStorage === 'S3') {
    if (!isS3Active) return jsonError('S3 对象存储未启用或未正确配置，请在「系统设置」中配置', 400);
    chosenStorage = 'S3';
  } else if (requestedStorage === 'WEBDAV') {
    if (!isWebDavActive) return jsonError('WebDAV 云盘未启用或未正确配置，请在「系统设置」中配置', 400);
    chosenStorage = 'WEBDAV';
  } else if (requestedStorage === 'D1_LOCAL') {
    chosenStorage = 'D1_LOCAL';
  } else {
    // 自动模式：按全局默认配置或可用渠道智能决定
    if (defaultStorage === 'S3' && isS3Active) {
      chosenStorage = 'S3';
    } else if (defaultStorage === 'WEBDAV' && isWebDavActive) {
      chosenStorage = 'WEBDAV';
    } else if (isS3Active) {
      chosenStorage = 'S3';
    } else if (isWebDavActive) {
      chosenStorage = 'WEBDAV';
    } else {
      chosenStorage = 'D1_LOCAL';
    }
  }

  try {
    if (chosenStorage === 'S3' && s3Config) {
      // 方案 A: S3 / 阿里云OSS / 腾讯云COS / Cloudflare R2 对象存储
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
      const uniquePrefix = generateRandomHex(6);
      const safeFileName = `${uniquePrefix}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const uploadResult = await uploadEncryptedFileToS3(
        s3Config,
        dateStr,
        safeFileName,
        buffer,
        cryptoKey
      );

      if (!uploadResult.success) {
        return jsonError(uploadResult.error || '文件上传至 S3 对象存储失败', 500);
      }

      await env.DB.prepare(
        `INSERT INTO attachments (
          id, lease_id, payment_id, file_name, file_size,
          mime_type, category, webdav_path, data_blob, storage_type, enc_iv, enc_tag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 'S3', ?, ?)`
      )
        .bind(
          attachmentId,
          leaseId,
          paymentId,
          file.name,
          file.size,
          file.type || 'application/octet-stream',
          category,
          uploadResult.s3Path,
          uploadResult.ivBase64,
          'INCLUDED'
        )
        .run();

      return jsonOk({
        id: attachmentId,
        fileName: file.name,
        storageType: 'S3',
        storagePath: uploadResult.s3Path,
      }, '文件已端到端加密保存至对象存储');

    } else if (chosenStorage === 'WEBDAV' && webdavConfig) {
      // 方案 B: WebDAV 异地加密存储 (坚果云 / AList 挂载的网盘等)
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
      const uniquePrefix = generateRandomHex(6);
      const safeFileName = `${uniquePrefix}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const uploadResult = await uploadEncryptedFileToWebDav(
        webdavConfig,
        dateStr,
        safeFileName,
        buffer,
        cryptoKey
      );

      if (!uploadResult.success) {
        return jsonError(uploadResult.error || '文件上传至 WebDAV 失败', 500);
      }

      await env.DB.prepare(
        `INSERT INTO attachments (
          id, lease_id, payment_id, file_name, file_size,
          mime_type, category, webdav_path, data_blob, storage_type, enc_iv, enc_tag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 'WEBDAV', ?, ?)`
      )
        .bind(
          attachmentId,
          leaseId,
          paymentId,
          file.name,
          file.size,
          file.type || 'application/octet-stream',
          category,
          uploadResult.webdavPath,
          uploadResult.ivBase64,
          'INCLUDED'
        )
        .run();

      return jsonOk({
        id: attachmentId,
        fileName: file.name,
        storageType: 'WEBDAV',
        storagePath: uploadResult.webdavPath,
      }, '文件已端到端加密保存至云盘');

    } else {
      // 方案 C: 本地 D1 数据库密文直存 (零配置开箱即用)
      const { ciphertext, ivBase64 } = await encryptBuffer(buffer, cryptoKey);
      const dataBlobBase64 = bytesToBase64(ciphertext);

      await env.DB.prepare(
        `INSERT INTO attachments (
          id, lease_id, payment_id, file_name, file_size,
          mime_type, category, webdav_path, data_blob, storage_type, enc_iv, enc_tag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, 'D1_LOCAL', ?, ?)`
      )
        .bind(
          attachmentId,
          leaseId,
          paymentId,
          file.name,
          file.size,
          file.type || 'application/octet-stream',
          category,
          dataBlobBase64,
          ivBase64,
          'INCLUDED'
        )
        .run();

      return jsonOk({
        id: attachmentId,
        fileName: file.name,
        storageType: 'D1_LOCAL',
        storagePath: 'D1 数据库',
      }, '文件已端到端加密保存至本地数据库');
    }
  } catch (err: any) {
    console.error('上传附件处理失败:', err);
    return jsonError(`上传失败: ${err.message || String(err)}`, 500);
  }
}

export async function handleGetAttachmentFile(env: Env, attachmentId: string) {
  const att = (await env.DB.prepare('SELECT * FROM attachments WHERE id = ?')
    .bind(attachmentId)
    .first()) as Attachment | null;

  if (!att) {
    return jsonError('文件不存在', 404, 404);
  }

  const user = await env.DB.prepare('SELECT salt FROM users LIMIT 1').first();
  const salt = user ? (user.salt as string) : 'zufang_default_salt';
  const cryptoKey = await deriveKeyFromSecret(salt, 'zufang_file_encryption');

  try {
    let decryptedBuffer: ArrayBuffer;

    if (att.storage_type === 'S3') {
      // 从 S3 对象存储下载并解密
      const s3Config = await getS3Config(env);
      if (!s3Config) throw new Error('S3 对象存储未配置');
      decryptedBuffer = await downloadAndDecryptFromS3(
        s3Config,
        att.webdav_path!,
        att.enc_iv,
        cryptoKey
      );
    } else if (att.storage_type === 'D1_LOCAL' || (!att.webdav_path && att.data_blob)) {
      // 从 D1 本地解密
      const encryptedBytes = base64ToBytes(att.data_blob!);
      decryptedBuffer = await decryptBuffer(encryptedBytes, cryptoKey, att.enc_iv);
    } else {
      // 从 WebDAV 下载并解密
      const webdavConfig = await getWebDavConfig(env);
      if (!webdavConfig) throw new Error('WebDAV 未配置');
      decryptedBuffer = await downloadAndDecryptFromWebDav(
        webdavConfig,
        att.webdav_path!,
        att.enc_iv,
        cryptoKey
      );
    }

    const headers = new Headers();
    headers.set('Content-Type', att.mime_type);
    headers.set('Content-Length', String(decryptedBuffer.byteLength));
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(att.file_name)}"`);
    headers.set('Cache-Control', 'private, max-age=3600');

    return new Response(decryptedBuffer, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return jsonError(`无法解密读取文件: ${err.message || String(err)}`, 500);
  }
}

export async function handleDeleteAttachment(env: Env, attachmentId: string) {
  const att = (await env.DB.prepare('SELECT * FROM attachments WHERE id = ?')
    .bind(attachmentId)
    .first()) as Attachment | null;

  if (!att) {
    return jsonError('文件不存在', 404, 404);
  }

  if (att.storage_type === 'S3' && att.webdav_path) {
    // 检查是否有其他记录复用了同一个 S3 文件，防止误删多处引用的远程原件
    const otherUsing = (await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM attachments WHERE webdav_path = ? AND id != ?'
    ).bind(att.webdav_path, attachmentId).first()) as any;

    if (!otherUsing || Number(otherUsing.cnt) === 0) {
      const s3Config = await getS3Config(env);
      if (s3Config) {
        await deleteFromS3(s3Config, att.webdav_path);
      }
    }
  } else if (att.storage_type === 'WEBDAV' && att.webdav_path) {
    // 检查是否有其他记录复用了同一个 WebDAV 文件，防止误删多处引用的远程原件
    const otherUsing = (await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM attachments WHERE webdav_path = ? AND id != ?'
    ).bind(att.webdav_path, attachmentId).first()) as any;

    if (!otherUsing || Number(otherUsing.cnt) === 0) {
      const webdavConfig = await getWebDavConfig(env);
      if (webdavConfig) {
        await deleteFromWebDav(webdavConfig, att.webdav_path);
      }
    }
  }

  await env.DB.prepare('DELETE FROM attachments WHERE id = ?').bind(attachmentId).run();
  return jsonOk({ id: attachmentId }, '文件已删除（关联账单与房源已完好保留）');
}

export async function handleBindAttachment(env: Env, body: any) {
  const { attachmentId, attachmentIds, paymentId, leaseId } = body;
  const ids: string[] = Array.isArray(attachmentIds) ? attachmentIds : (attachmentId ? [attachmentId] : []);
  if (ids.length === 0) {
    return jsonError('请选择要绑定的文件', 400);
  }

  let targetLeaseId = leaseId || null;
  if (!targetLeaseId && paymentId) {
    const pmt = (await env.DB.prepare('SELECT lease_id FROM payments WHERE id = ?').bind(paymentId).first()) as any;
    if (pmt && pmt.lease_id) {
      targetLeaseId = pmt.lease_id as string;
    }
  }

  for (const id of ids) {
    const existing = (await env.DB.prepare('SELECT * FROM attachments WHERE id = ?').bind(id).first()) as Attachment | null;
    if (!existing) continue;

    if (!existing.payment_id) {
      // 未绑定到任何账单的独立文件：直接更新关联
      await env.DB.prepare('UPDATE attachments SET lease_id = ?, payment_id = ? WHERE id = ?')
        .bind(targetLeaseId || existing.lease_id, paymentId || null, id)
        .run();
    } else if (existing.payment_id === paymentId) {
      // 已绑定到同一账单
      if (targetLeaseId && existing.lease_id !== targetLeaseId) {
        await env.DB.prepare('UPDATE attachments SET lease_id = ? WHERE id = ?')
          .bind(targetLeaseId, id)
          .run();
      }
    } else {
      // 已绑定到其他账单：支持历史文件多账单复用绑定，克隆一条引用记录绑定到目标账单
      const newId = 'att_' + generateRandomHex(8);
      await env.DB.prepare(
        `INSERT INTO attachments (
          id, lease_id, payment_id, file_name, file_size,
          mime_type, category, webdav_path, data_blob, storage_type, enc_iv, enc_tag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          newId,
          targetLeaseId || existing.lease_id,
          paymentId || null,
          existing.file_name,
          existing.file_size,
          existing.mime_type,
          existing.category,
          existing.webdav_path,
          existing.data_blob,
          existing.storage_type,
          existing.enc_iv,
          existing.enc_tag
        )
        .run();
    }
  }

  return jsonOk({ count: ids.length }, '文件已成功关联绑定');
}

export async function handleUnbindAttachment(env: Env, body: any) {
  const { attachmentId, unbindPayment, unbindLease } = body;
  if (!attachmentId) {
    return jsonError('请选择要解绑的文件', 400);
  }

  if (unbindPayment && unbindLease) {
    await env.DB.prepare('UPDATE attachments SET payment_id = NULL, lease_id = NULL WHERE id = ?')
      .bind(attachmentId)
      .run();
  } else if (unbindPayment) {
    await env.DB.prepare('UPDATE attachments SET payment_id = NULL WHERE id = ?')
      .bind(attachmentId)
      .run();
  } else if (unbindLease) {
    await env.DB.prepare('UPDATE attachments SET lease_id = NULL WHERE id = ?')
      .bind(attachmentId)
      .run();
  }

  return jsonOk({ id: attachmentId }, '文件已解除关联');
}
