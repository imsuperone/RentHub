// src/modules/settings/index.ts
// 系统设置与 WebDAV 存储参数管理

import { Env, WebDavConfig } from '../../types';
import { testWebDavConnection } from '../webdav';
import { jsonOk, jsonError } from '../../utils/response';

export async function handleGetSettings(env: Env) {
  const row = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'webdav_config'").first();
  let webdav: Partial<WebDavConfig> = {
    endpoint: '',
    username: '',
    password: '',
    base_path: '/RentRecords',
    is_enabled: false,
  };

  if (row && row.value) {
    try {
      const parsed = JSON.parse(row.value as string);
      webdav = {
        ...parsed,
        password: parsed.password ? '******' : '', // 脱敏输出
      };
    } catch {
      // ignore
    }
  }

  return jsonOk({ webdav });
}

export async function handleSaveSettings(env: Env, body: any) {
  const { webdav } = body;
  if (!webdav) {
    return jsonError('缺少设置参数', 400);
  }

  // 检查原先的密码
  const existingRow = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'webdav_config'").first();
  let existingPassword = '';
  if (existingRow && existingRow.value) {
    try {
      const parsed = JSON.parse(existingRow.value as string);
      existingPassword = parsed.password || '';
    } catch {
      // ignore
    }
  }

  // 如果传进来的是 '******'，保留原密码
  const finalPassword = webdav.password === '******' ? existingPassword : (webdav.password || '');

  const configToSave: WebDavConfig = {
    endpoint: (webdav.endpoint || '').trim(),
    username: (webdav.username || '').trim(),
    password: finalPassword.trim(),
    base_path: (webdav.base_path || '/RentRecords').trim(),
    is_enabled: !!webdav.is_enabled,
  };

  await env.DB.prepare(
    `INSERT INTO system_settings (key, value, updated_at)
     VALUES ('webdav_config', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  )
    .bind(JSON.stringify(configToSave))
    .run();

  return jsonOk(null, '设置保存成功');
}

export async function handleTestSettings(env: Env, body: any) {
  const { webdav } = body;
  if (!webdav || !webdav.endpoint) {
    return jsonError('请填写 WebDAV 服务地址', 400);
  }

  // 如果密码是脱敏符号，读取数据库原密码
  let testPassword = webdav.password;
  if (testPassword === '******') {
    const existingRow = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'webdav_config'").first();
    if (existingRow && existingRow.value) {
      try {
        const parsed = JSON.parse(existingRow.value as string);
        testPassword = parsed.password;
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
