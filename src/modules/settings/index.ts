// src/modules/settings/index.ts
// 系统设置、多渠道云存储 (WebDAV / S3 对象存储) 与邮件备份管理

import { Env, WebDavConfig, S3Config } from '../../types';
import { testWebDavConnection } from '../webdav';
import { testS3Connection } from '../s3';
import { getNotificationSettings, sendEmailMessage } from '../notifications';
import { jsonOk, jsonError } from '../../utils/response';

function safeParseJson<T>(raw: unknown, defaultValue: T): T {
  if (typeof raw !== 'string' || !raw.trim()) return defaultValue;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as T;
    }
  } catch {}
  return defaultValue;
}

export async function handleGetSettings(env: Env) {
  const rows = await env.DB.prepare(
    "SELECT key, value FROM system_settings WHERE key IN ('webdav_config', 's3_config', 'default_storage')"
  ).all();

  const map = new Map<string, string>();
  for (const r of rows.results as { key: string; value: string }[]) {
    map.set(r.key, r.value);
  }

  let webdav: Partial<WebDavConfig> = {
    endpoint: '',
    username: '',
    password: '',
    base_path: '',
    is_enabled: false,
  };

  let s3: Partial<S3Config> = {
    endpoint: '',
    bucket: '',
    region: '',
    access_key_id: '',
    secret_access_key: '',
    base_path: '',
    is_enabled: false,
  };

  let defaultStorage = map.get('default_storage') || 'D1_LOCAL';

  if (map.has('webdav_config')) {
    const parsed = safeParseJson<Partial<WebDavConfig>>(map.get('webdav_config'), {});
    webdav = {
      ...webdav,
      ...parsed,
      password: parsed.password ? '******' : '', // 脱敏输出
    };
  }

  if (map.has('s3_config')) {
    const parsed = safeParseJson<Partial<S3Config>>(map.get('s3_config'), {});
    s3 = {
      ...s3,
      ...parsed,
      secret_access_key: parsed.secret_access_key ? '******' : '', // 脱敏输出
    };
  }

  return jsonOk({ webdav, s3, default_storage: defaultStorage });
}

export async function handleSaveSettings(env: Env, body: any) {
  const { webdav, s3, default_storage } = body;

  // 1. 保存 WebDAV 设置
  if (webdav) {
    const existingRow = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'webdav_config'").first();
    const existingObj = safeParseJson<any>(existingRow?.value, {});
    const existingPassword = existingObj.password || '';
    const finalPassword = webdav.password === '******' ? existingPassword : (webdav.password || '');

    const webdavToSave: WebDavConfig = {
      endpoint: (webdav.endpoint || '').trim(),
      username: (webdav.username || '').trim(),
      password: finalPassword.trim(),
      base_path: (webdav.base_path || '').trim(),
      is_enabled: !!webdav.is_enabled,
    };

    await env.DB.prepare(
      `INSERT INTO system_settings (key, value, updated_at)
       VALUES ('webdav_config', ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    )
      .bind(JSON.stringify(webdavToSave))
      .run();

    // 二选一保证：若启用了 WebDAV，则自动停用 S3
    if (webdavToSave.is_enabled) {
      const s3Row = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 's3_config'").first();
      const s3Obj = safeParseJson<any>(s3Row?.value, null);
      if (s3Obj) {
        s3Obj.is_enabled = false;
        await env.DB.prepare("UPDATE system_settings SET value = ?, updated_at = datetime('now') WHERE key = 's3_config'")
          .bind(JSON.stringify(s3Obj)).run();
      }
    }
  }

  // 2. 保存 S3 对象存储设置
  if (s3) {
    const existingRow = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 's3_config'").first();
    const existingObj = safeParseJson<any>(existingRow?.value, {});
    const existingSecret = existingObj.secret_access_key || '';
    const finalSecret = s3.secret_access_key === '******' ? existingSecret : (s3.secret_access_key || '');

    const s3ToSave: S3Config = {
      endpoint: (s3.endpoint || '').trim(),
      bucket: (s3.bucket || '').trim(),
      region: (s3.region || '').trim(),
      access_key_id: (s3.access_key_id || '').trim(),
      secret_access_key: finalSecret.trim(),
      base_path: (s3.base_path || '').trim(),
      is_enabled: !!s3.is_enabled,
    };

    await env.DB.prepare(
      `INSERT INTO system_settings (key, value, updated_at)
       VALUES ('s3_config', ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    )
      .bind(JSON.stringify(s3ToSave))
      .run();

    // 二选一保证：若启用了 S3，则自动停用 WebDAV
    if (s3ToSave.is_enabled) {
      const wdRow = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'webdav_config'").first();
      const wdObj = safeParseJson<any>(wdRow?.value, null);
      if (wdObj) {
        wdObj.is_enabled = false;
        await env.DB.prepare("UPDATE system_settings SET value = ?, updated_at = datetime('now') WHERE key = 'webdav_config'")
          .bind(JSON.stringify(wdObj)).run();
      }
    }
  }

  // 3. 保存默认存储渠道 / 云端备份二选一状态同步
  if (default_storage) {
    await env.DB.prepare(
      `INSERT INTO system_settings (key, value, updated_at)
       VALUES ('default_storage', ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    )
      .bind(default_storage)
      .run();

    if (default_storage === 'D1_LOCAL') {
      // 关闭所有云端备份
      const s3Row = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 's3_config'").first();
      const s3Obj = safeParseJson<any>(s3Row?.value, null);
      if (s3Obj) {
        s3Obj.is_enabled = false;
        await env.DB.prepare("UPDATE system_settings SET value = ?, updated_at = datetime('now') WHERE key = 's3_config'")
          .bind(JSON.stringify(s3Obj)).run();
      }
      const wdRow = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'webdav_config'").first();
      const wdObj = safeParseJson<any>(wdRow?.value, null);
      if (wdObj) {
        wdObj.is_enabled = false;
        await env.DB.prepare("UPDATE system_settings SET value = ?, updated_at = datetime('now') WHERE key = 'webdav_config'")
          .bind(JSON.stringify(wdObj)).run();
      }
    }
  }

  return jsonOk(null, '设置已成功保存');
}

export async function handleTestSettings(env: Env, body: any) {
  const { webdav } = body;
  if (!webdav || !webdav.endpoint) {
    return jsonError('请填写 WebDAV 服务地址', 400);
  }

  let testPassword = webdav.password;
  if (testPassword === '******') {
    const existingRow = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'webdav_config'").first();
    if (existingRow && existingRow.value) {
      try {
        testPassword = JSON.parse(existingRow.value as string).password;
      } catch {
        // ignore
      }
    }
  }

  const config: WebDavConfig = {
    endpoint: webdav.endpoint.trim(),
    username: (webdav.username || '').trim(),
    password: (testPassword || '').trim(),
    base_path: (webdav.base_path || '/RentRecords').trim(),
    is_enabled: true,
  };

  const result = await testWebDavConnection(config);
  if (result.success) {
    return jsonOk(null, result.message);
  } else {
    return jsonError(result.message, 400);
  }
}

/**
 * 测试 S3 对象存储连通性
 */
export async function handleTestS3Settings(env: Env, body: any) {
  const { s3 } = body;
  if (!s3 || !s3.endpoint || !s3.bucket) {
    return jsonError('请填写 S3 Endpoint 与存储桶名称', 400);
  }

  let testSecret = s3.secret_access_key;
  if (testSecret === '******') {
    const existingRow = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 's3_config'").first();
    if (existingRow && existingRow.value) {
      try {
        testSecret = JSON.parse(existingRow.value as string).secret_access_key;
      } catch {
        // ignore
      }
    }
  }

  const config: S3Config = {
    endpoint: s3.endpoint.trim(),
    bucket: s3.bucket.trim(),
    region: (s3.region || 'cn-hangzhou').trim(),
    access_key_id: (s3.access_key_id || '').trim(),
    secret_access_key: (testSecret || '').trim(),
    base_path: (s3.base_path || 'RentHubFiles').trim(),
    is_enabled: true,
  };

  const result = await testS3Connection(config);
  if (result.success) {
    return jsonOk(null, result.message);
  } else {
    return jsonError(result.message, 400);
  }
}

/**
 * 一键将数据库全量备份发送到房东邮箱 (轻量实用，零配置云端)
 */
export async function handleSendDatabaseBackupToEmail(env: Env) {
  const settings = await getNotificationSettings(env);
  if (!settings.recipientEmail) {
    return jsonError('请先在「待收提醒与邮箱设置」中填写房东收件邮箱', 400);
  }
  if (!settings.smtpHost || !settings.smtpPort) {
    return jsonError('请先在「待收提醒与邮箱设置」中配置发信 SMTP 服务器', 400);
  }

  // 1. 导出完整数据
  const dumpRes = await handleDumpDatabase(env);
  const dumpData = dumpRes.status === 200 ? (await dumpRes.json() as any).data : null;
  if (!dumpData) {
    return jsonError('生成数据库备份失败', 500);
  }

  const jsonStr = JSON.stringify(dumpData, null, 2);
  const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const subject = `【RentHub备份】全量数据归档 (${nowStr})`;
  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
  <div style="border-bottom: 2px solid #0F5B38; padding-bottom: 12px; margin-bottom: 18px;">
    <h2 style="color: #0F5B38; margin: 0; font-size: 20px;">📦 RentHub · 数据库全量备份</h2>
    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">备份时刻：${nowStr}</p>
  </div>
  <p style="font-size: 14px; color: #333;">房东您好，这是您系统当前的全量数据库备份存档：</p>
  <div style="background-color: #f1f8f4; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; color: #444; line-height: 1.8;">
    <div><strong>🏠 房源租约数量：</strong>${dumpData.leases?.length || 0} 套</div>
    <div><strong>💰 账单记录数量：</strong>${dumpData.payments?.length || 0} 笔</div>
    <div><strong>📁 关联文件数量：</strong>${dumpData.attachments?.length || 0} 份</div>
    <div><strong>⚙️ 系统配置项数：</strong>${dumpData.settings?.length || 0} 项</div>
  </div>
  <p style="font-size: 13px; color: #666;">💡 备份说明：下方为完整的 JSON 备份数据文本，您也可以将其复制保存为 <code>renthub_backup.json</code> 作为冷备。</p>
  <div style="background-color: #f6f8fa; border: 1px solid #ddd; border-radius: 8px; padding: 12px; max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all; color: #24292e;">
${jsonStr.length > 50000 ? jsonStr.slice(0, 50000) + '\n\n... (已截断超长部分，完整数据请在后台导出 JSON)' : jsonStr}
  </div>
  <div style="border-top: 1px dashed #ddd; padding-top: 14px; margin-top: 16px; font-size: 12px; color: #999;">
    • 此邮件由 RentHub 系统自动触发生成，请妥善保管您的备份邮件，避免外泄。
  </div>
</div>`;

  const sendResult = await sendEmailMessage(
    settings,
    settings.recipientEmail,
    subject,
    html
  );

  if (sendResult.success) {
    return jsonOk(null, `✓ 全量数据库备份已成功发送至邮箱 ${settings.recipientEmail}`);
  } else {
    return jsonError(`发送备份邮件失败: ${sendResult.message}`, 500);
  }
}

/**
 * 数据库速览与透视：方便管理员随时直接查看各数据表的实时结构与行数据
 */
export async function handleInspectDatabase(env: Env, table: string) {
  const allowedTables = ['leases', 'payments', 'attachments', 'users', 'system_settings'];
  const targetTable = allowedTables.includes(table) ? table : 'leases';

  let query = `SELECT * FROM ${targetTable} ORDER BY created_at DESC LIMIT 50`;
  if (targetTable === 'users') {
    query = `SELECT id, username, totp_enabled, recovery_codes, created_at FROM users LIMIT 10`;
  } else if (targetTable === 'system_settings') {
    query = `SELECT key, value, updated_at FROM system_settings`;
  } else if (targetTable === 'attachments') {
    query = `SELECT id, lease_id, payment_id, file_name, file_size, mime_type, category, storage_type, webdav_path, enc_iv, created_at FROM attachments ORDER BY created_at DESC LIMIT 50`;
  }

  const results = await env.DB.prepare(query).all();
  return jsonOk({
    table: targetTable,
    count: results.results.length,
    rows: results.results,
  });
}

/**
 * 一键导出整个数据库为 JSON (全量备份与可读透视)
 */
export async function handleDumpDatabase(env: Env) {
  const users = await env.DB.prepare('SELECT id, username, totp_enabled, created_at FROM users').all();
  const leases = await env.DB.prepare('SELECT * FROM leases ORDER BY created_at DESC').all();
  const payments = await env.DB.prepare('SELECT * FROM payments ORDER BY paid_at DESC').all();
  const attachments = await env.DB.prepare('SELECT id, lease_id, payment_id, file_name, file_size, mime_type, category, storage_type, webdav_path, created_at FROM attachments').all();
  const settings = await env.DB.prepare('SELECT key, value, updated_at FROM system_settings').all();

  return jsonOk({
    exportTime: new Date().toISOString(),
    users: users.results,
    leases: leases.results,
    payments: payments.results,
    attachments: attachments.results,
    settings: settings.results,
  });
}
