// src/modules/auth/index.ts
// 用户系统、密码哈希与 TOTP 2FA 核心业务逻辑

import { Env, User, SessionPayload, NotificationSettings } from '../../types';
import {
  hashPassword,
  verifyPassword,
  generateBase32Secret,
  verifyTOTP,
  generateRecoveryCodes,
  generateRandomHex,
} from '../../utils/crypto';
import { createSessionToken, verifySessionToken } from '../../utils/session';
import { jsonOk, jsonError } from '../../utils/response';
import { sendEmailMessage, getNotificationSettings } from '../notifications';

// 临时 2FA 验证会话盐值（纯内存/自验）
const TEMP_AUTH_SALT = 'zufang_temp_auth_salt';
const FULL_SESSION_SALT = 'zufang_full_session_salt';

export async function handleAuthStatus(env: Env) {
  const initSetting = (await env.DB.prepare(
    "SELECT value FROM system_settings WHERE key = 'init_completed' LIMIT 1"
  ).first()) as { value: string } | null;
  const user = (await env.DB.prepare('SELECT id, username, totp_enabled FROM users LIMIT 1').first()) as User | null;
  const isCompleted = initSetting?.value === 'true' && !!user;

  return jsonOk({
    isInitialized: isCompleted,
    totpEnabled: !!user && (user.totp_enabled as number) === 1,
    username: user ? user.username : null,
  });
}

/**
 * 初始化第 1 步：提交管理员账号密码，生成待激活的 TOTP 密钥与恢复码，支持保存安全密保与邮箱
 */
export async function handleInitAdmin(env: Env, body: any) {
  const { 
    username, 
    password, 
    recoveryEmail, 
    securityQuestion, 
    securityAnswer,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPass,
    smtpFromName,
    smtpFromEmail
  } = body;

  if (!username || !password || password.length < 8) {
    return jsonError('用户名与密码不能为空，且密码长度至少8位', 400);
  }

  // 检查是否已有完全初始化的管理员
  const initSetting = (await env.DB.prepare(
    "SELECT value FROM system_settings WHERE key = 'init_completed' LIMIT 1"
  ).first()) as { value: string } | null;

  const existing = (await env.DB.prepare('SELECT id, totp_enabled FROM users LIMIT 1').first()) as User | null;

  if (initSetting?.value === 'true' && existing) {
    return jsonError('系统已经完成管理员初始化，不可重复初始化', 400);
  }

  // 如果存在未完成初始化的残留用户（如上次停留未确认或刷新页面），清理旧记录，允许重新初始化
  if (existing) {
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(existing.id).run();
  }

  // 1. 生成密码盐值与 PBKDF2 哈希
  const { hash, salt } = await hashPassword(password);

  // 2. 生成 TOTP 2FA 密钥与备用恢复码
  const totpSecret = generateBase32Secret(20);
  const recoveryCodes = generateRecoveryCodes(8);

  const userId = 'usr_' + generateRandomHex(8);

  // 3. 安全密保问题哈希处理 (单向加盐防泄漏)
  let answerHash: string | null = null;
  let answerSalt: string | null = null;
  if (securityQuestion && securityAnswer) {
    const cleanAnswer = String(securityAnswer).trim().toLowerCase();
    const ansResult = await hashPassword(cleanAnswer);
    answerHash = ansResult.hash;
    answerSalt = ansResult.salt;
  }

  const effectiveRecoveryEmail = recoveryEmail || (body as any).recipientEmail;

  // 4. 写入 D1 用户表
  await env.DB.prepare(
    `INSERT INTO users (
      id, username, password_hash, salt, totp_secret, totp_enabled, recovery_codes,
      recovery_email, security_question, security_answer_hash, security_answer_salt
    ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`
  )
    .bind(
      userId,
      username.trim(),
      hash,
      salt,
      totpSecret,
      JSON.stringify(recoveryCodes),
      effectiveRecoveryEmail ? String(effectiveRecoveryEmail).trim() : null,
      securityQuestion ? String(securityQuestion).trim() : null,
      answerHash,
      answerSalt
    )
    .run();

  // 5. 如果用户配置了 SMTP 邮箱发信通道，同步写入系统设置
  if (effectiveRecoveryEmail && smtpHost) {
    const entries = [
      ['notify_recipient_email', String(effectiveRecoveryEmail).trim()],
      ['notify_smtp_host', String(smtpHost).trim()],
      ['notify_smtp_port', String(smtpPort || 465).trim()],
      ['notify_smtp_secure', String(smtpSecure ?? true)],
      ['notify_smtp_user', String(smtpUser || '').trim()],
      ['notify_smtp_pass', String(smtpPass || '').trim()],
      ['notify_smtp_from_name', String(smtpFromName || '房东管家').trim()],
      ['notify_smtp_from_email', String(smtpFromEmail || smtpUser || '').trim()],
    ];
    for (const [k, v] of entries) {
      await env.DB.prepare(
        'INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
      ).bind(k, v).run();
    }
  }

  // 构造标准 OTP Auth URL
  const issuer = encodeURIComponent('房东管家');
  const account = encodeURIComponent(username.trim());
  const totpUri = `otpauth://totp/${issuer}:${account}?secret=${totpSecret}&issuer=${issuer}`;

  return jsonOk({
    userId,
    username: username.trim(),
    totpSecret,
    totpUri,
    recoveryCodes,
  });
}

/**
 * 初始化第 2 步：强制校验首次 2FA 动态码，确保用户已成功绑定，并直接颁发 Session
 */
export async function handleConfirmInit2FA(env: Env, body: any) {
  const { userId, code } = body;
  if (!userId || !code) {
    return jsonError('缺少验证参数', 400);
  }

  const user = (await env.DB.prepare(
    'SELECT id, username, totp_secret FROM users WHERE id = ? LIMIT 1'
  ).bind(userId).first()) as User | null;

  if (!user) {
    return jsonError('用户不存在', 404);
  }

  const cleanCode = String(code).trim();
  const verified = await verifyTOTP(cleanCode, user.totp_secret, 1);
  if (!verified) {
    return jsonError('动态码校验失败，请检查验证器中填写的密钥或时间同步', 400);
  }

  // 激活用户并标记初始化完成
  await env.DB.prepare('UPDATE users SET totp_enabled = 1 WHERE id = ?').bind(userId).run();
  await env.DB.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('init_completed', 'true')").run();

  // 签发 7 天 Session Cookie
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    uid: user.id,
    usr: user.username,
    exp: now + 7 * 24 * 3600,
    stage: 'FULL',
  };

  const sessionToken = await createSessionToken(fullPayload, FULL_SESSION_SALT);
  const cookieStr = `rent_session=${sessionToken}; Path=/; Max-Age=${7 * 24 * 3600}; HttpOnly; SameSite=Lax`;

  const headers = new Headers();
  headers.append('Set-Cookie', cookieStr);
  headers.append('Content-Type', 'application/json; charset=utf-8');

  return new Response(
    JSON.stringify({
      code: 0,
      message: '2FA 绑定并激活成功！',
      data: { username: user.username, totpEnabled: true },
    }),
    { status: 200, headers }
  );
}

/**
 * 首次初始化跳过 2FA：直接进入系统，后续一直弹窗提醒
 */
export async function handleSkipInit2FA(env: Env, body: any) {
  const { userId } = body;
  if (!userId) {
    return jsonError('缺少用户 ID', 400);
  }

  const user = (await env.DB.prepare(
    'SELECT id, username FROM users WHERE id = ? LIMIT 1'
  ).bind(userId).first()) as User | null;

  if (!user) {
    return jsonError('用户不存在', 404);
  }

  // 保持 totp_enabled = 0，并标记系统初始化流程已完成
  await env.DB.prepare('UPDATE users SET totp_enabled = 0 WHERE id = ?').bind(userId).run();
  await env.DB.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('init_completed', 'true')").run();

  // 签发 7 天 Session Cookie
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    uid: user.id,
    usr: user.username,
    exp: now + 7 * 24 * 3600,
    stage: 'FULL',
  };

  const sessionToken = await createSessionToken(fullPayload, FULL_SESSION_SALT);
  const cookieStr = `rent_session=${sessionToken}; Path=/; Max-Age=${7 * 24 * 3600}; HttpOnly; SameSite=Lax`;

  const headers = new Headers();
  headers.append('Set-Cookie', cookieStr);
  headers.append('Content-Type', 'application/json; charset=utf-8');

  return new Response(
    JSON.stringify({
      code: 0,
      message: '已跳过 2FA，登录成功',
      data: { username: user.username, totpEnabled: false },
    }),
    { status: 200, headers }
  );
}

export async function handleLoginStep1(env: Env, body: any) {
  const { username, password } = body;
  if (!username || !password) {
    return jsonError('请输入用户名和密码', 400);
  }

  const user = (await env.DB.prepare(
    'SELECT id, username, password_hash, salt, totp_enabled FROM users WHERE username = ? LIMIT 1'
  )
    .bind(username.trim())
    .first()) as User | null;

  if (!user) {
    return jsonError('用户名或密码错误', 401);
  }

  const isPasswordValid = await verifyPassword(password, user.salt, user.password_hash);
  if (!isPasswordValid) {
    return jsonError('用户名或密码错误', 401);
  }

  // 若未启用 2FA (totp_enabled !== 1)，直接通过登录，签发正式会话 Cookie
  if ((user.totp_enabled as number) !== 1) {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: SessionPayload = {
      uid: user.id,
      usr: user.username,
      exp: now + 7 * 24 * 3600,
      stage: 'FULL',
    };

    const sessionToken = await createSessionToken(fullPayload, FULL_SESSION_SALT);
    const cookieStr = `rent_session=${sessionToken}; Path=/; Max-Age=${7 * 24 * 3600}; HttpOnly; SameSite=Lax`;

    const headers = new Headers();
    headers.append('Set-Cookie', cookieStr);
    headers.append('Content-Type', 'application/json; charset=utf-8');

    return new Response(
      JSON.stringify({
        code: 0,
        message: '登录成功 (未开启2FA)',
        data: {
          need2FA: false,
          username: user.username,
        },
      }),
      { status: 200, headers }
    );
  }

  // 启用了 2FA：签发 3 分钟有效期的临时 2FA 预认证令牌
  const now = Math.floor(Date.now() / 1000);
  const tempPayload: SessionPayload = {
    uid: user.id,
    usr: user.username,
    exp: now + 3 * 60, // 3 分钟
    stage: 'AWAITING_2FA',
  };

  const tempToken = await createSessionToken(tempPayload, TEMP_AUTH_SALT);

  return jsonOk({
    need2FA: true,
    stage: 'AWAITING_2FA',
    tempToken,
  });
}

export async function handleLoginStep2(env: Env, body: any) {
  const { tempToken, code } = body;
  if (!tempToken || !code) {
    return jsonError('参数不完整', 400);
  }

  const payload = await verifySessionToken(tempToken, TEMP_AUTH_SALT);
  if (!payload || payload.stage !== 'AWAITING_2FA') {
    return jsonError('预认证会话已过期，请重新输入账号密码', 401);
  }

  const user = (await env.DB.prepare(
    'SELECT id, username, totp_secret, recovery_codes FROM users WHERE id = ? LIMIT 1'
  )
    .bind(payload.uid)
    .first()) as User | null;

  if (!user) {
    return jsonError('用户不存在', 401);
  }

  const cleanCode = String(code).trim();
  let verified = false;

  // 1. 尝试 6 位 TOTP 动态码校验
  if (cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
    verified = await verifyTOTP(cleanCode, user.totp_secret, 1);
  }

  // 2. 若动态码不匹配，检查是否输入的是备用恢复码 (格式如 XXXX-XXXX)
  if (!verified && user.recovery_codes) {
    try {
      const recoveryList: string[] = JSON.parse(user.recovery_codes);
      const matchedIdx = recoveryList.findIndex((c) => c.toUpperCase() === cleanCode.toUpperCase());
      if (matchedIdx !== -1) {
        verified = true;
        // 消耗该恢复码
        recoveryList.splice(matchedIdx, 1);
        await env.DB.prepare('UPDATE users SET recovery_codes = ? WHERE id = ?')
          .bind(JSON.stringify(recoveryList), user.id)
          .run();
      }
    } catch {
      // ignore json parse error
    }
  }

  if (!verified) {
    return jsonError('动态验证码或恢复码错误', 401);
  }

  // 2FA 验证彻底通过！颁发 7 天有效的正式会话 Cookie
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    uid: user.id,
    usr: user.username,
    exp: now + 7 * 24 * 3600, // 7 天
    stage: 'FULL',
  };

  const sessionToken = await createSessionToken(fullPayload, FULL_SESSION_SALT);
  const cookieStr = `rent_session=${sessionToken}; Path=/; Max-Age=${7 * 24 * 3600}; HttpOnly; SameSite=Lax`;

  const headers = new Headers();
  headers.append('Set-Cookie', cookieStr);
  headers.append('Content-Type', 'application/json; charset=utf-8');

  return new Response(
    JSON.stringify({
      code: 0,
      message: '登录成功',
      data: {
        username: user.username,
      },
    }),
    { status: 200, headers }
  );
}

export async function handleChangePassword(env: Env, userId: string, body: any) {
  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword || newPassword.length < 8) {
    return jsonError('新密码长度不能少于 8 位', 400);
  }

  const user = (await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()) as User | null;
  if (!user) return jsonError('用户不存在', 404);

  const isValid = await verifyPassword(oldPassword, user.salt, user.password_hash);
  if (!isValid) return jsonError('原密码不正确', 400);

  const { hash, salt } = await hashPassword(newPassword);
  await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?')
    .bind(hash, salt, userId)
    .run();

  return jsonOk(null, '密码修改成功');
}

/**
 * 准备绑定或重新绑定 2FA：生成临时绑定令牌与新密钥
 */
export async function handlePrepare2FA(env: Env, userId: string) {
  const user = (await env.DB.prepare('SELECT id, username FROM users WHERE id = ?')
    .bind(userId)
    .first()) as User | null;
  if (!user) return jsonError('用户不存在', 404);

  const totpSecret = generateBase32Secret(20);
  const recoveryCodes = generateRecoveryCodes(8);
  const now = Math.floor(Date.now() / 1000);

  // 构造并签名 10 分钟临时令牌
  const bindPayload = {
    uid: userId,
    secret: totpSecret,
    recoveryCodes,
    exp: now + 10 * 60,
    stage: 'BIND_2FA',
  };

  const bindToken = await createSessionToken(bindPayload as any, TEMP_AUTH_SALT);
  const issuer = encodeURIComponent('房东管家');
  const account = encodeURIComponent(user.username);
  const totpUri = `otpauth://totp/${issuer}:${account}?secret=${totpSecret}&issuer=${issuer}`;

  return jsonOk({
    bindToken,
    totpSecret,
    totpUri,
    recoveryCodes,
  });
}

/**
 * 确认验证绑定 2FA (用户输入 6 位动态码确认)
 */
export async function handleConfirmBind2FA(env: Env, userId: string, body: any) {
  const { bindToken, code } = body;
  if (!bindToken || !code) {
    return jsonError('缺少绑定参数或验证码', 400);
  }

  const payload = (await verifySessionToken(bindToken, TEMP_AUTH_SALT)) as any;
  if (!payload || payload.uid !== userId || !payload.secret) {
    return jsonError('绑定会话已过期，请重新点击绑定以生成新二维码', 400);
  }

  const cleanCode = String(code).trim();
  const verified = await verifyTOTP(cleanCode, payload.secret, 1);
  if (!verified) {
    return jsonError('动态验证码错误，请检查手机验证器时间或重试', 400);
  }

  // 校验成功，正式写入并开启 2FA
  await env.DB.prepare(
    'UPDATE users SET totp_secret = ?, totp_enabled = 1, recovery_codes = ? WHERE id = ?'
  )
    .bind(payload.secret, JSON.stringify(payload.recoveryCodes), userId)
    .run();

  return jsonOk({ totpEnabled: true }, '2FA 动态验证绑定成功！');
}

/**
 * 取消 / 关闭 2FA (需要验证当前管理员主密码)
 */
export async function handleDisable2FA(env: Env, userId: string, body: any) {
  const { password } = body;
  if (!password) {
    return jsonError('请输入管理员主密码以确认关闭 2FA', 400);
  }

  const user = (await env.DB.prepare('SELECT id, salt, password_hash FROM users WHERE id = ?')
    .bind(userId)
    .first()) as User | null;
  if (!user) return jsonError('用户不存在', 404);

  const isValid = await verifyPassword(password, user.salt, user.password_hash);
  if (!isValid) {
    return jsonError('主密码不正确，无法关闭 2FA', 400);
  }

  await env.DB.prepare('UPDATE users SET totp_enabled = 0 WHERE id = ?')
    .bind(userId)
    .run();

  return jsonOk({ totpEnabled: false }, '2FA 动态验证已关闭');
}

export async function handleGet2FADetails(env: Env, userId: string) {
  const user = (await env.DB.prepare('SELECT username, totp_secret, totp_enabled, recovery_codes FROM users WHERE id = ?')
    .bind(userId)
    .first()) as User | null;
  if (!user) return jsonError('用户不存在', 404);

  const issuer = encodeURIComponent('房东管家');
  const account = encodeURIComponent(user.username);
  const totpUri = `otpauth://totp/${issuer}:${account}?secret=${user.totp_secret}&issuer=${issuer}`;

  let recoveryCodes: string[] = [];
  try {
    recoveryCodes = JSON.parse(user.recovery_codes || '[]');
  } catch {}

  return jsonOk({
    totpEnabled: (user.totp_enabled as number) === 1,
    totpSecret: user.totp_secret,
    totpUri,
    recoveryCodes,
  });
}

export async function handleLogout() {
  const cookieStr = 'rent_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax';
  const headers = new Headers();
  headers.append('Set-Cookie', cookieStr);
  headers.append('Content-Type', 'application/json; charset=utf-8');

  return new Response(
    JSON.stringify({
      code: 0,
      message: '已退出登录',
      data: null,
    }),
    { status: 200, headers }
  );
}

export async function checkSessionFromCookie(cookieHeader: string | null): Promise<SessionPayload | null> {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/rent_session=([^;]+)/);
  if (!match) return null;
  const token = match[1];
  return await verifySessionToken(token, FULL_SESSION_SALT);
}

// ==================== 🔑 首次初始化邮箱测通与忘记密码安全找回 ====================

/**
 * 首次初始化：实机测试发送安全邮箱验证码
 */
export async function handleSendInitVerifyCode(env: Env, body: any) {
  const { email, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFromName, smtpFromEmail } = body;
  if (!email || !email.includes('@')) {
    return jsonError('请填写有效的安全邮箱地址', 400);
  }

  if (!smtpHost || !smtpPort) {
    return jsonError('请填写完整的 SMTP 服务器地址与端口', 400);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const tempSettings: NotificationSettings = {
    recipientEmail: email.trim(),
    smtpHost: String(smtpHost).trim(),
    smtpPort: parseInt(String(smtpPort), 10) || 465,
    smtpSecure: Boolean(smtpSecure),
    smtpUser: String(smtpUser || '').trim(),
    smtpPass: String(smtpPass || '').trim(),
    smtpFromName: String(smtpFromName || '房东管家').trim(),
    smtpFromEmail: String(smtpFromEmail || smtpUser || '').trim(),
    notifyDaysBefore: '7,3,1',
    notifyOnDueDay: true,
    notifyOnOverdue: true,
    templateRentTitle: '',
    templateRentBody: '',
    templateUtilityTitle: '',
    templateUtilityBody: ''
  };

  const title = '【房东管家】安全邮箱绑定验证码';
  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
    <div style="border-bottom: 2px solid #006C4C; padding-bottom: 12px; margin-bottom: 18px;">
      <h2 style="color: #006C4C; margin: 0; font-size: 20px;">📧 邮箱验证码</h2>
      <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">房东管家 · 邮箱验证</p>
    </div>
    <p style="font-size: 14px; color: #333;">您正在为房东管家配置安全邮箱，本次测试验证码为：</p>
    <div style="background-color: #E8F5E9; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
      <div style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #006C4C; font-family: monospace;">${code}</div>
      <div style="font-size: 12px; color: #666; margin-top: 6px;">验证码 10 分钟内有效，请在网页中输入</div>
    </div>
    <p style="font-size: 12px; color: #888; line-height: 1.5; border-top: 1px dashed #ddd; padding-top: 12px;">
      • 此邮件为发信测试邮件。如非您本人操作，请忽略此邮件。<br>
      • 绑定成功后，当您忘记密码时可凭此邮箱接收验证码找回。
    </p>
  </div>`;

  const sendResult = await sendEmailMessage(tempSettings, email.trim(), title, html);
  if (!sendResult.success) {
    return jsonError(`SMTP 实测发信失败: ${sendResult.message}`, 400);
  }

  const verifyData = {
    email: email.trim().toLowerCase(),
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  await env.DB.prepare(
    'INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).bind('init_temp_verify_code', JSON.stringify(verifyData)).run();

  return jsonOk(null, '实测验证邮件已成功发出，请查收邮箱并填入 6 位验证码');
}

/**
 * 首次初始化：核对安全邮箱 6 位测试验证码
 */
export async function handleConfirmInitVerifyCode(env: Env, body: any) {
  const { email, code } = body;
  if (!email || !code) return jsonError('参数不完整', 400);

  const row = (await env.DB.prepare(
    "SELECT value FROM system_settings WHERE key = 'init_temp_verify_code' LIMIT 1"
  ).first()) as { value: string } | null;

  if (!row) return jsonError('尚未发送验证码或已过期，请重新发送', 400);

  try {
    const data = JSON.parse(row.value);
    if (Date.now() > data.expiresAt) {
      await env.DB.prepare("DELETE FROM system_settings WHERE key = 'init_temp_verify_code'").run();
      return jsonError('验证码已过期，请重新获取', 400);
    }
    if (data.email !== email.trim().toLowerCase() || String(data.code) !== String(code).trim()) {
      return jsonError('验证码不正确，请核对后重试', 400);
    }

    await env.DB.prepare("DELETE FROM system_settings WHERE key = 'init_temp_verify_code'").run();
    return jsonOk({ verified: true }, '✓ 安全邮箱与发信通道已成功测通激活！');
  } catch (err: any) {
    return jsonError('校验异常: ' + err.message, 500);
  }
}

/**
 * 查询指定管理员账号支持的找回选项 (抗时序枚举攻击)
 */
export async function handleGetRecoveryOptions(env: Env, username: string) {
  if (!username) return jsonError('请输入管理员账号', 400);

  const user = (await env.DB.prepare(
    'SELECT id, username, recovery_email, security_question, security_answer_hash, recovery_codes FROM users WHERE username = ? LIMIT 1'
  ).bind(username.trim()).first()) as User | null;

  if (!user) {
    // 假哈希防时序猜测
    await hashPassword('dummy_anti_timing_attack_padding');
    return jsonOk({
      hasAccount: false,
      hasSecurityQuestion: false,
      securityQuestion: null,
      hasRecoveryCodes: false,
      hasRecoveryEmail: false,
      maskedEmail: null,
    });
  }

  let hasRecoveryCodes = false;
  try {
    const codes = JSON.parse(user.recovery_codes || '[]');
    hasRecoveryCodes = Array.isArray(codes) && codes.length > 0;
  } catch {}

  let maskedEmail: string | null = null;
  if (user.recovery_email) {
    const parts = user.recovery_email.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      const masked = name.length > 2 ? name[0] + '***' + name.slice(-1) : name[0] + '***';
      maskedEmail = `${masked}@${parts[1]}`;
    }
  }

  return jsonOk({
    hasAccount: true,
    hasSecurityQuestion: !!(user.security_question && user.security_answer_hash),
    securityQuestion: user.security_question || null,
    hasRecoveryCodes,
    hasRecoveryEmail: !!user.recovery_email,
    maskedEmail,
  });
}

/**
 * 忘记密码：发送重置验证码至绑定安全邮箱
 */
export async function handleSendRecoveryEmail(env: Env, body: any) {
  const { username } = body;
  if (!username) return jsonError('请输入管理员账号', 400);

  const user = (await env.DB.prepare(
    'SELECT id, username, recovery_email FROM users WHERE username = ? LIMIT 1'
  ).bind(username.trim()).first()) as User | null;

  if (!user || !user.recovery_email) {
    await hashPassword('dummy_anti_timing_attack_padding');
    return jsonError('该账号未绑定有效安全找回邮箱，请尝试密保问题或紧急恢复码', 400);
  }

  // 频控：60 秒冷却
  const cooldownKey = `pwd_reset_cooldown_${user.id}`;
  const lastSentRow = (await env.DB.prepare(
    'SELECT value FROM system_settings WHERE key = ? LIMIT 1'
  ).bind(cooldownKey).first()) as { value: string } | null;

  if (lastSentRow && Date.now() - Number(lastSentRow.value) < 60000) {
    const leftSec = Math.ceil((60000 - (Date.now() - Number(lastSentRow.value))) / 1000);
    return jsonError(`发送过于频繁，请稍候 ${leftSec} 秒后再试`, 429);
  }

  const notifySettings = await getNotificationSettings(env);
  if (!notifySettings.smtpHost || !notifySettings.smtpPort) {
    return jsonError('发信服务尚未配置有效 SMTP 服务器，请使用密保问题或紧急恢复码找回', 400);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const title = '【房东管家】密码重置验证码';
  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
    <div style="border-bottom: 2px solid #006C4C; padding-bottom: 12px; margin-bottom: 18px;">
      <h2 style="color: #006C4C; margin: 0; font-size: 20px;">🔑 密码重置请求</h2>
    </div>
    <p style="font-size: 14px; color: #333;">您正在申请重置账号 <strong>${user.username}</strong> 的登录密码，验证码为：</p>
    <div style="background-color: #FFF3E0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; border: 1px solid #FFE0B2;">
      <div style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #E65100; font-family: monospace;">${code}</div>
      <div style="font-size: 12px; color: #666; margin-top: 6px;">验证码 10 分钟内有效，请在网页重置面板输入</div>
    </div>
    <p style="font-size: 12px; color: #666;">
      提示：若非您本人操作，请忽略此邮件，切勿将验证码泄露给他人。
    </p>
  </div>`;

  const sendResult = await sendEmailMessage(notifySettings, user.recovery_email, title, html);
  if (!sendResult.success) {
    return jsonError(`发送重置邮件失败: ${sendResult.message}`, 500);
  }

  await env.DB.prepare(
    'INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).bind(cooldownKey, String(Date.now())).run();

  const resetCodeData = {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  await env.DB.prepare(
    'INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).bind(`pwd_reset_code_${user.id}`, JSON.stringify(resetCodeData)).run();

  return jsonOk(null, '重置验证码已发送至您的安全邮箱');
}

/**
 * 校验找回凭证 (支持密保答案、紧急恢复码、邮箱验证码)，校验通过发放短效 Reset Token
 */
export async function handleVerifyRecovery(env: Env, body: any) {
  const { username, method, answer, code } = body;
  if (!username || !method) return jsonError('参数不完整', 400);

  const user = (await env.DB.prepare(
    'SELECT * FROM users WHERE username = ? LIMIT 1'
  ).bind(username.trim()).first()) as User | null;

  if (!user) {
    await hashPassword('dummy_anti_timing_attack_padding');
    return jsonError('验证信息不匹配，请核对账号与凭据', 400);
  }

  // 防爆破：检查尝试失败次数
  const attemptKey = `recovery_fail_count_${user.id}`;
  const attemptRow = (await env.DB.prepare(
    'SELECT value FROM system_settings WHERE key = ? LIMIT 1'
  ).bind(attemptKey).first()) as { value: string } | null;

  const failData = attemptRow ? JSON.parse(attemptRow.value) : { count: 0, lockUntil: 0 };
  if (failData.lockUntil && Date.now() < failData.lockUntil) {
    const waitMin = Math.ceil((failData.lockUntil - Date.now()) / 60000);
    return jsonError(`为防范恶意猜测，该账号已被临时安全锁定，请 ${waitMin} 分钟后再试`, 429);
  }

  let verified = false;

  if (method === 'QUESTION') {
    if (!user.security_answer_hash || !user.security_answer_salt) {
      return jsonError('该账号未配置密保问题', 400);
    }
    if (!answer) return jsonError('请输入密保问题答案', 400);
    const cleanAnswer = String(answer).trim().toLowerCase();
    verified = await verifyPassword(cleanAnswer, user.security_answer_salt, user.security_answer_hash);
  } else if (method === 'RECOVERY_CODE') {
    if (!code) return jsonError('请输入紧急备用恢复码', 400);
    const cleanCode = String(code).trim().toUpperCase();
    if (user.recovery_codes) {
      try {
        const list: string[] = JSON.parse(user.recovery_codes);
        const idx = list.findIndex(c => c.toUpperCase() === cleanCode);
        if (idx !== -1) {
          verified = true;
          // 彻底消耗并作废此备用恢复码
          list.splice(idx, 1);
          await env.DB.prepare('UPDATE users SET recovery_codes = ? WHERE id = ?')
            .bind(JSON.stringify(list), user.id)
            .run();
        }
      } catch {}
    }
  } else if (method === 'EMAIL_OTP') {
    if (!code) return jsonError('请输入邮箱验证码', 400);
    const cleanCode = String(code).trim();
    const row = (await env.DB.prepare(
      'SELECT value FROM system_settings WHERE key = ? LIMIT 1'
    ).bind(`pwd_reset_code_${user.id}`).first()) as { value: string } | null;

    if (!row) {
      return jsonError('验证码已失效或未请求，请重新获取', 400);
    }
    try {
      const data = JSON.parse(row.value);
      if (Date.now() > data.expiresAt) {
        return jsonError('验证码已过期，请重新获取', 400);
      }
      if (String(data.code) === cleanCode) {
        verified = true;
        await env.DB.prepare('DELETE FROM system_settings WHERE key = ?').bind(`pwd_reset_code_${user.id}`).run();
      }
    } catch {}
  } else {
    return jsonError('未知的找回方式', 400);
  }

  if (!verified) {
    const newCount = (failData.count || 0) + 1;
    let lockUntil = 0;
    if (newCount >= 5) {
      lockUntil = Date.now() + 15 * 60 * 1000; // 锁定 15 分钟
    }
    await env.DB.prepare(
      'INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    ).bind(attemptKey, JSON.stringify({ count: newCount >= 5 ? 0 : newCount, lockUntil })).run();

    return jsonError(`验证凭证不正确 (剩余尝试机会: ${Math.max(0, 5 - newCount)} 次)`, 400);
  }

  // 成功通过验证，清除失败锁定计数
  await env.DB.prepare('DELETE FROM system_settings WHERE key = ?').bind(attemptKey).run();

  // 签发 3 分钟有效、仅限重置密码阶段的防篡改签名 Token
  const now = Math.floor(Date.now() / 1000);
  const resetPayload: SessionPayload = {
    uid: user.id,
    usr: user.username,
    exp: now + 180, // 3 分钟有效
    stage: 'RESET_PASSWORD',
  };

  const resetToken = await createSessionToken(resetPayload, FULL_SESSION_SALT);
  return jsonOk({ resetToken }, '身份验证通过，请在 3 分钟内设置新密码');
}

/**
 * 正式执行重置密码 (必须携带合法的 RESET_PASSWORD 签名 Token)
 */
export async function handleResetPassword(env: Env, body: any) {
  const { resetToken, newPassword } = body;
  if (!resetToken || !newPassword) {
    return jsonError('缺少重置凭据或新密码', 400);
  }

  if (newPassword.length < 8) {
    return jsonError('新主密码长度不能少于 8 位', 400);
  }

  const payload = await verifySessionToken(resetToken, FULL_SESSION_SALT);
  if (!payload || payload.stage !== 'RESET_PASSWORD') {
    return jsonError('重置凭证已过期或无效，请重新发起验证', 401);
  }

  const user = (await env.DB.prepare('SELECT id, username FROM users WHERE id = ?')
    .bind(payload.uid)
    .first()) as User | null;

  if (!user) {
    return jsonError('目标用户不存在', 404);
  }

  // 生成全新的随机 Salt 和 PBKDF2 强哈希
  const { hash, salt } = await hashPassword(newPassword);

  await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?')
    .bind(hash, salt, user.id)
    .run();

  await env.DB.prepare('DELETE FROM system_settings WHERE key = ?').bind(`pwd_reset_code_${user.id}`).run();

  return jsonOk(null, '✓ 主密码已成功重置！请使用新密码重新登录');
}
