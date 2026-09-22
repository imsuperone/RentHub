// src/modules/attachments/index.ts
// 凭证附件管理：双轨加密存储 (支持 WebDAV 异地直存 + D1 本地加密直存，零门槛开箱即用)

import { Env, WebDavConfig, Attachment } from '../../types';
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

  if (!leaseId && paymentId) {
    const pmt = await env.DB.prepare('SELECT lease_id FROM payments WHERE id = ?').bind(paymentId).first();
    if (pmt && pmt.lease_id) {
      leaseId = pmt.lease_id as string;
    }
  }

  if (!file) {
    return jsonError('请选择要上传的文件', 400);
  }

  // 1. 获取主盐值并派生加密密钥
  const user = await env.DB.prepare('SELECT salt FROM users LIMIT 1').first();
  const salt = user ? (user.salt as string) : 'zufang_default_salt';
  const cryptoKey = await deriveKeyFromSecret(salt, 'zufang_file_encryption');

  // 2. 读取文件字节流
  const buffer = await file.arrayBuffer();
  const attachmentId = 'att_' + generateRandomHex(8);

  const webdavConfig = await getWebDavConfig(env);
  const isWebDavActive = webdavConfig && webdavConfig.is_enabled && webdavConfig.endpoint;

  try {
    if (isWebDavActive) {
      // 方案 A: WebDAV 异地加密存储
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
      }, '凭证已安全保存至云盘');

    } else {
      // 方案 B: 本地 D1 数据库密文直存 (免配置 WebDAV，零门槛开箱即用)
      const { ciphertext, ivBase64 } = await encryptBuffer(buffer, cryptoKey);
      const dataBlobBase64 = bytesToBase64(ciphertext);

      // 注意：webdav_path 传空字符串 '' 以满足部分迁移中的 NOT NULL 约束
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
      }, '凭证照片已安全保存');
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
    return jsonError('附件不存在', 404, 404);
  }

  const user = await env.DB.prepare('SELECT salt FROM users LIMIT 1').first();
  const salt = user ? (user.salt as string) : 'zufang_default_salt';
  const cryptoKey = await deriveKeyFromSecret(salt, 'zufang_file_encryption');

  try {
    let decryptedBuffer: ArrayBuffer;

    if (att.storage_type === 'D1_LOCAL' || (!att.webdav_path && att.data_blob)) {
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
    return jsonError(`无法解密读取凭证: ${err.message || String(err)}`, 500);
  }
}

export async function handleDeleteAttachment(env: Env, attachmentId: string) {
  const att = (await env.DB.prepare('SELECT * FROM attachments WHERE id = ?')
    .bind(attachmentId)
    .first()) as Attachment | null;

  if (!att) {
    return jsonError('附件不存在', 404, 404);
  }

  if (att.storage_type === 'WEBDAV' && att.webdav_path) {
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
  return jsonOk({ id: attachmentId }, '凭证照片已删除（关联账单与房源已完好保留）');
}

export async function handleBindAttachment(env: Env, body: any) {
  const { attachmentId, attachmentIds, paymentId, leaseId } = body;
  const ids: string[] = Array.isArray(attachmentIds) ? attachmentIds : (attachmentId ? [attachmentId] : []);
  if (ids.length === 0) {
    return jsonError('请选择要绑定的凭证', 400);
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
      // 未绑定到任何账单的独立凭证：直接更新关联
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
      // 已绑定到其他账单：支持历史凭证多账单复用绑定，克隆一条引用记录绑定到目标账单
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

  return jsonOk({ count: ids.length }, '凭证已成功关联绑定');
}

export async function handleUnbindAttachment(env: Env, body: any) {
  const { attachmentId, unbindPayment, unbindLease } = body;
  if (!attachmentId) {
    return jsonError('请选择要解绑的凭证', 400);
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

  return jsonOk({ id: attachmentId }, '凭证已解除关联');
}
