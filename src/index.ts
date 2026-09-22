// src/index.ts
// 房东管家 (zufangwoker) 主入口与自动化定时任务调度
// 采用 Hono 驱动，极致轻便、快速响应

import { Hono } from 'hono';
import { Env } from './types';
import { jsonError } from './utils/response';
import {
  handleAuthStatus,
  handleInitAdmin,
  handleConfirmInit2FA,
  handleSkipInit2FA,
  handleLoginStep1,
  handleLoginStep2,
  handleChangePassword,
  handleGet2FADetails,
  handlePrepare2FA,
  handleConfirmBind2FA,
  handleDisable2FA,
  handleLogout,
  checkSessionFromCookie,
  handleSendInitVerifyCode,
  handleConfirmInitVerifyCode,
  handleGetRecoveryOptions,
  handleSendRecoveryEmail,
  handleVerifyRecovery,
  handleResetPassword,
} from './modules/auth';
import {
  handleListLeases,
  handleGetLease,
  handleCreateLease,
  handleUpdateLease,
  handleDeleteLease,
} from './modules/leases';
import {
  handleListPayments,
  handleCreatePayment,
  handleUpdatePayment,
  handleSettlePayment,
  handleDeletePayment,
} from './modules/payments';
import {
  handleListAttachments,
  handleUploadAttachment,
  handleGetAttachmentFile,
  handleDeleteAttachment,
  handleBindAttachment,
  handleUnbindAttachment,
} from './modules/attachments';
import {
  handleGetSettings,
  handleSaveSettings,
  handleTestSettings,
  handleTestS3Settings,
  handleSendDatabaseBackupToEmail,
  handleInspectDatabase,
  handleDumpDatabase,
} from './modules/settings';
import {
  handleGetNotificationSettings,
  handleSaveNotificationSettings,
  handleSendTestNotification,
  handleTriggerNotificationCheck,
} from './modules/notifications';
import { handleDashboardSummary } from './modules/dashboard';
import { renderGateHtml } from './views/gate';
import { renderAppHtml } from './views/app';

const app = new Hono<{ Bindings: Env }>();

// ==================== 登录鉴权拦截网关 ====================
// 未登录或认证无效的请求在此拦截，重定向或返回提示
app.use('*', async (c, next) => {
  const path = c.req.path;

  // 1. 公开白名单接口 (仅允许认证、初始化与找回密码相关调用)
  const publicAuthPaths = [
    '/api/auth/status',
    '/api/auth/init',
    '/api/auth/confirm-init-2fa',
    '/api/auth/skip-init-2fa',
    '/api/auth/login-step1',
    '/api/auth/login-step2',
    '/api/auth/logout',
    '/api/auth/send-init-verify',
    '/api/auth/confirm-init-verify',
    '/api/auth/recovery-options',
    '/api/auth/send-recovery-email',
    '/api/auth/verify-recovery',
    '/api/auth/reset-password',
  ];

  if (publicAuthPaths.includes(path)) {
    return next();
  }

  // 2. 检查会话 Cookie
  const cookieHeader = c.req.header('Cookie') || null;
  const session = await checkSessionFromCookie(cookieHeader);

  // 3. 业务 API 拦截：未通过认证坚决拒绝
  if (path.startsWith('/api/')) {
    if (!session || session.stage !== 'FULL') {
      return jsonError('请先登录后再进行操作', 401, 401);
    }
    // 将已验证的用户信息存入上下文
    c.set('userId' as never, session.uid as never);
    return next();
  }

  // 4. 页面请求拦截：
  // 检查会话有效性与数据库用户状态
  if (session && session.stage === 'FULL') {
    try {
      const user = await c.env.DB.prepare('SELECT id, totp_enabled FROM users WHERE id = ?')
        .bind(session.uid)
        .first();
      if (user) {
        return c.html(renderAppHtml(session.usr));
      }
    } catch {
      // 数据库异常则进入门禁
    }
  }

  // 未登录或未初始化 -> 检查系统是否已初始化
  try {
    const initSetting = (await c.env.DB.prepare(
      "SELECT value FROM system_settings WHERE key = 'init_completed' LIMIT 1"
    ).first()) as { value: string } | null;
    const user = await c.env.DB.prepare('SELECT id, totp_enabled FROM users LIMIT 1').first();
    const isInitialized = initSetting?.value === 'true' && !!user;
    return c.html(renderGateHtml(isInitialized));
  } catch {
    return c.html(renderGateHtml(false));
  }
});

// ==================== 认证与找回密码路由 ====================
app.get('/api/auth/status', async (c) => handleAuthStatus(c.env));
app.post('/api/auth/init', async (c) => {
  const body = await c.req.json();
  return handleInitAdmin(c.env, body);
});
app.post('/api/auth/send-init-verify', async (c) => {
  const body = await c.req.json();
  return handleSendInitVerifyCode(c.env, body);
});
app.post('/api/auth/confirm-init-verify', async (c) => {
  const body = await c.req.json();
  return handleConfirmInitVerifyCode(c.env, body);
});
app.get('/api/auth/recovery-options', async (c) => {
  const username = c.req.query('username') || '';
  return handleGetRecoveryOptions(c.env, username);
});
app.post('/api/auth/send-recovery-email', async (c) => {
  const body = await c.req.json();
  return handleSendRecoveryEmail(c.env, body);
});
app.post('/api/auth/verify-recovery', async (c) => {
  const body = await c.req.json();
  return handleVerifyRecovery(c.env, body);
});
app.post('/api/auth/reset-password', async (c) => {
  const body = await c.req.json();
  return handleResetPassword(c.env, body);
});
app.post('/api/auth/confirm-init-2fa', async (c) => {
  const body = await c.req.json();
  return handleConfirmInit2FA(c.env, body);
});
app.post('/api/auth/skip-init-2fa', async (c) => {
  const body = await c.req.json();
  return handleSkipInit2FA(c.env, body);
});
app.post('/api/auth/login-step1', async (c) => {
  const body = await c.req.json();
  return handleLoginStep1(c.env, body);
});
app.post('/api/auth/login-step2', async (c) => {
  const body = await c.req.json();
  return handleLoginStep2(c.env, body);
});
app.post('/api/auth/logout', async () => handleLogout());
app.post('/api/auth/change-password', async (c) => {
  const body = await c.req.json();
  const userId = c.get('userId' as never) as string;
  return handleChangePassword(c.env, userId, body);
});
app.get('/api/auth/2fa-info', async (c) => {
  const userId = c.get('userId' as never) as string;
  return handleGet2FADetails(c.env, userId);
});
app.post('/api/auth/prepare-2fa', async (c) => {
  const userId = c.get('userId' as never) as string;
  return handlePrepare2FA(c.env, userId);
});
app.post('/api/auth/confirm-bind-2fa', async (c) => {
  const body = await c.req.json();
  const userId = c.get('userId' as never) as string;
  return handleConfirmBind2FA(c.env, userId, body);
});
app.post('/api/auth/disable-2fa', async (c) => {
  const body = await c.req.json();
  const userId = c.get('userId' as never) as string;
  return handleDisable2FA(c.env, userId, body);
});

// ==================== 聚合仪表盘路由 (极限节省配额) ====================
app.get('/api/dashboard', async (c) => handleDashboardSummary(c.env));

// ==================== 租约管理路由 ====================
app.get('/api/leases', async (c) => handleListLeases(c.env));
app.get('/api/leases/:id', async (c) => handleGetLease(c.env, c.req.param('id')));
app.post('/api/leases', async (c) => {
  const body = await c.req.json();
  return handleCreateLease(c.env, body);
});
app.put('/api/leases/:id', async (c) => {
  const body = await c.req.json();
  return handleUpdateLease(c.env, c.req.param('id'), body);
});
app.delete('/api/leases/:id', async (c) => handleDeleteLease(c.env, c.req.param('id')));

// ==================== 账单与收支记账路由 ====================
app.get('/api/payments', async (c) => {
  const leaseId = c.req.query('lease_id');
  return handleListPayments(c.env, leaseId);
});
app.post('/api/payments', async (c) => {
  const body = await c.req.json();
  return handleCreatePayment(c.env, body);
});
app.put('/api/payments/:id', async (c) => {
  const body = await c.req.json();
  return handleUpdatePayment(c.env, c.req.param('id'), body);
});
app.post('/api/payments/:id/settle', async (c) => handleSettlePayment(c.env, c.req.param('id')));
app.delete('/api/payments/:id', async (c) => handleDeletePayment(c.env, c.req.param('id')));

// ==================== 待收提醒与邮件设置路由 ====================
app.get('/api/notifications/settings', async (c) => handleGetNotificationSettings(c.env));
app.get('/api/settings/notifications', async (c) => handleGetNotificationSettings(c.env));
app.post('/api/notifications/settings', async (c) => {
  const body = await c.req.json();
  return handleSaveNotificationSettings(c.env, body);
});
app.post('/api/settings/notifications', async (c) => {
  const body = await c.req.json();
  return handleSaveNotificationSettings(c.env, body);
});
app.post('/api/notifications/send-test', async (c) => {
  const body = await c.req.json();
  return handleSendTestNotification(c.env, body);
});
app.post('/api/notifications/trigger-check', async (c) => handleTriggerNotificationCheck(c.env));

// ==================== 合同与单据凭证路由 (支持 WebDAV 云盘) ====================
app.get('/api/attachments', async (c) => {
  const leaseId = c.req.query('lease_id');
  const paymentId = c.req.query('payment_id');
  return handleListAttachments(c.env, leaseId, paymentId);
});
app.post('/api/attachments/upload', async (c) => {
  const formData = await c.req.formData();
  return handleUploadAttachment(c.env, formData);
});
app.get('/api/attachments/:id/file', async (c) => handleGetAttachmentFile(c.env, c.req.param('id')));
app.delete('/api/attachments/:id', async (c) => handleDeleteAttachment(c.env, c.req.param('id')));
app.post('/api/attachments/bind', async (c) => {
  const body = await c.req.json();
  return handleBindAttachment(c.env, body);
});
app.post('/api/attachments/unbind', async (c) => {
  const body = await c.req.json();
  return handleUnbindAttachment(c.env, body);
});

// ==================== 系统设置与 多渠道云存储 (WebDAV / S3) 路由 ====================
app.get('/api/settings', async (c) => handleGetSettings(c.env));
app.post('/api/settings', async (c) => {
  const body = await c.req.json();
  return handleSaveSettings(c.env, body);
});
app.post('/api/settings/test-webdav', async (c) => {
  const body = await c.req.json();
  return handleTestSettings(c.env, body);
});
app.post('/api/settings/test-s3', async (c) => {
  const body = await c.req.json();
  return handleTestS3Settings(c.env, body);
});
app.post('/api/settings/email-backup', async (c) => handleSendDatabaseBackupToEmail(c.env));

// ==================== 数据库速览透视与备份路由 ====================
app.get('/api/database/inspect', async (c) => {
  const table = c.req.query('table') || 'leases';
  return handleInspectDatabase(c.env, table);
});
app.get('/api/database/dump', async (c) => handleDumpDatabase(c.env));

export default {
  fetch: app.fetch,
  async scheduled(event: any, env: Env, ctx: any) {
    ctx.waitUntil(handleTriggerNotificationCheck(env));
  },
};
