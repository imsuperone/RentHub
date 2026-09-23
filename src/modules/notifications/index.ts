// src/modules/notifications/index.ts
// 智能催租与水电欠费邮件通知引擎 (专有 SMTP 纯边缘直连，支持完整配置项与主流邮箱预设)

import { Env, NotificationSettings, Lease } from '../../types';
import { jsonOk, jsonError } from '../../utils/response';
import { sendSmtpEmail } from '../../utils/smtp';
import { sendResendEmail } from '../../utils/resend';

const DEFAULT_SETTINGS: NotificationSettings = {
  recipientEmail: '',
  mailProvider: 'smtp',
  resendApiKey: '',
  resendFromEmail: '',
  resendFromName: 'RentHub',
  smtpHost: '',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: '',
  smtpPass: '',
  smtpFromName: 'RentHub',
  smtpFromEmail: '',
  notifyDaysBefore: '7,3,1',
  notifyOnDueDay: true,
  notifyOnOverdue: true,
  templateRentTitle: '【RentHub】房租到期交费提醒：{{property_title}} ({{status_desc}})',
  templateRentBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
  <div style="border-bottom: 2px solid #0F5B38; padding-bottom: 12px; margin-bottom: 18px;">
    <h2 style="color: #0F5B38; margin: 0; font-size: 20px;">🏠 房租交费提醒通知</h2>
    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">RentHub · 房屋资产管理</p>
  </div>
  <p style="font-size: 14px; color: #333;">房东您好，</p>
  <p style="font-size: 14px; color: #555; line-height: 1.6;">您名下的出租房源 <strong>{{property_title}}</strong> ({{address}}) 近期房租即将到期或需要收取，明细如下：</p>
  <div style="background-color: #f1f8f4; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center;">
    <div style="font-size: 12px; color: #666;">本期应收租金</div>
    <div style="font-size: 28px; font-weight: 800; color: #0F5B38; margin: 4px 0;">¥ {{rent_amount}}</div>
    <div style="font-size: 13px; font-weight: bold; color: #c5221f;">交租日期：{{due_date}} ({{status_desc}})</div>
  </div>
  <table style="width: 100%; font-size: 13px; color: #666; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 6px 0; width: 100px;">承租人姓名：</td><td style="color: #333; font-weight: bold;">{{tenant_name}} ({{tenant_phone}})</td></tr>
    <tr><td style="padding: 6px 0;">合同租期：</td><td style="color: #333;">{{lease_period}}</td></tr>
  </table>
  <div style="border-top: 1px dashed #ddd; padding-top: 14px; font-size: 12px; color: #888; line-height: 1.5;">
    • 收到租客款项后，请前往 RentHub 管理后台点击“一键收租”进行核销与下一周期顺延。
  </div>
</div>`,
  templateUtilityTitle: '【RentHub】水电杂费催缴提醒：{{property_title}} 待交明细',
  templateUtilityBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
  <div style="border-bottom: 2px solid #0F5B38; padding-bottom: 12px; margin-bottom: 18px;">
    <h2 style="color: #0F5B38; margin: 0; font-size: 20px;">⚡ 水电杂费催缴提醒</h2>
    <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">RentHub · 房屋资产管理</p>
  </div>
  <p style="font-size: 14px; color: #333;">房东您好，</p>
  <p style="font-size: 14px; color: #555; line-height: 1.6;">房源 <strong>{{property_title}}</strong> 尚有一笔水电或杂费未结清：</p>
  <div style="background-color: #fff8f6; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #fed7d7;">
    <div style="font-size: 12px; color: #742a2a;">待交欠款金额</div>
    <div style="font-size: 26px; font-weight: 800; color: #c53030; margin: 4px 0;">¥ {{unpaid_amount}}</div>
    <div style="font-size: 13px; color: #4a5568;">承租人：{{tenant_name}} | 结算日期：{{settle_date}}</div>
    <div style="font-size: 12px; color: #718096; margin-top: 4px;">用量与明细：{{usage_details}}</div>
  </div>
  <div style="border-top: 1px dashed #ddd; padding-top: 14px; font-size: 12px; color: #888; line-height: 1.5;">
    • 租客结清后，请前往 RentHub 记账台账将该笔记录标记为已结清。
  </div>
</div>`
};

export async function getNotificationSettings(env: Env): Promise<NotificationSettings> {
  const rows = await env.DB.prepare(
    "SELECT key, value FROM system_settings WHERE key LIKE 'notify_%'"
  ).all();

  const map = new Map<string, string>();
  for (const r of rows.results as { key: string; value: string }[]) {
    map.set(r.key, r.value);
  }

  return {
    recipientEmail: map.get('notify_recipient_email') || DEFAULT_SETTINGS.recipientEmail,
    mailProvider: (map.get('notify_mail_provider') as 'smtp' | 'resend') || DEFAULT_SETTINGS.mailProvider,
    resendApiKey: map.get('notify_resend_api_key') || DEFAULT_SETTINGS.resendApiKey,
    resendFromEmail: map.get('notify_resend_from_email') || DEFAULT_SETTINGS.resendFromEmail,
    resendFromName: map.get('notify_resend_from_name') || DEFAULT_SETTINGS.resendFromName,
    smtpHost: map.get('notify_smtp_host') || DEFAULT_SETTINGS.smtpHost,
    smtpPort: parseInt(map.get('notify_smtp_port') || String(DEFAULT_SETTINGS.smtpPort), 10) || 465,
    smtpSecure: map.has('notify_smtp_secure') ? map.get('notify_smtp_secure') === 'true' : DEFAULT_SETTINGS.smtpSecure,
    smtpUser: map.get('notify_smtp_user') || DEFAULT_SETTINGS.smtpUser,
    smtpPass: map.get('notify_smtp_pass') || DEFAULT_SETTINGS.smtpPass,
    smtpFromName: map.get('notify_smtp_from_name') || DEFAULT_SETTINGS.smtpFromName,
    smtpFromEmail: map.get('notify_smtp_from_email') || DEFAULT_SETTINGS.smtpFromEmail,
    notifyDaysBefore: map.get('notify_days_before') || DEFAULT_SETTINGS.notifyDaysBefore,
    notifyOnDueDay: map.has('notify_on_due_day') ? map.get('notify_on_due_day') === 'true' : DEFAULT_SETTINGS.notifyOnDueDay,
    notifyOnOverdue: map.has('notify_on_overdue') ? map.get('notify_on_overdue') === 'true' : DEFAULT_SETTINGS.notifyOnOverdue,
    templateRentTitle: map.get('notify_template_rent_title') || DEFAULT_SETTINGS.templateRentTitle,
    templateRentBody: map.get('notify_template_rent_body') || DEFAULT_SETTINGS.templateRentBody,
    templateUtilityTitle: map.get('notify_template_utility_title') || DEFAULT_SETTINGS.templateUtilityTitle,
    templateUtilityBody: map.get('notify_template_utility_body') || DEFAULT_SETTINGS.templateUtilityBody,
  };
}

export async function handleGetNotificationSettings(env: Env) {
  const settings = await getNotificationSettings(env);
  // 脱敏密码 / 授权码与 API Key
  const maskedPass = settings.smtpPass 
    ? (settings.smtpPass.length > 6 
        ? settings.smtpPass.slice(0, 2) + '****' + settings.smtpPass.slice(-2) 
        : '****') 
    : '';

  const maskedResendKey = settings.resendApiKey 
    ? (settings.resendApiKey.length > 8 
        ? settings.resendApiKey.slice(0, 3) + '****' + settings.resendApiKey.slice(-4) 
        : '****') 
    : '';

  return jsonOk({
    ...settings,
    smtpPassMasked: maskedPass,
    hasSmtpPass: !!settings.smtpPass,
    resendApiKeyMasked: maskedResendKey,
    hasResendApiKey: !!settings.resendApiKey,
  });
}

export async function handleSaveNotificationSettings(env: Env, body: any) {
  const current = await getNotificationSettings(env);
  
  const recipientEmail = body.recipientEmail !== undefined ? String(body.recipientEmail).trim() : current.recipientEmail;
  const mailProvider = (body.mailProvider === 'resend' || body.mailProvider === 'smtp') ? body.mailProvider : current.mailProvider;
  
  const resendApiKey = (body.resendApiKey && String(body.resendApiKey).trim() !== '' && !body.resendApiKey.includes('****')) 
    ? String(body.resendApiKey).trim() 
    : current.resendApiKey;

  const resendFromEmail = body.resendFromEmail !== undefined ? String(body.resendFromEmail).trim() : current.resendFromEmail;
  const resendFromName = body.resendFromName !== undefined ? String(body.resendFromName).trim() : current.resendFromName;

  const smtpHost = body.smtpHost !== undefined ? String(body.smtpHost).trim() : current.smtpHost;
  const smtpPort = body.smtpPort !== undefined ? String(body.smtpPort).trim() : String(current.smtpPort);
  const smtpSecure = body.smtpSecure !== undefined ? String(body.smtpSecure) : String(current.smtpSecure);
  const smtpUser = body.smtpUser !== undefined ? String(body.smtpUser).trim() : current.smtpUser;
  
  const smtpPass = (body.smtpPass && String(body.smtpPass).trim() !== '' && !body.smtpPass.includes('****')) 
    ? String(body.smtpPass).trim() 
    : current.smtpPass;

  const smtpFromName = body.smtpFromName !== undefined ? String(body.smtpFromName).trim() : current.smtpFromName;
  const smtpFromEmail = body.smtpFromEmail !== undefined ? String(body.smtpFromEmail).trim() : current.smtpFromEmail;
  const notifyDaysBefore = body.notifyDaysBefore !== undefined ? String(body.notifyDaysBefore).trim() : current.notifyDaysBefore;
  const notifyOnDueDay = body.notifyOnDueDay !== undefined ? String(body.notifyOnDueDay) : String(current.notifyOnDueDay);
  const notifyOnOverdue = body.notifyOnOverdue !== undefined ? String(body.notifyOnOverdue) : String(current.notifyOnOverdue);
  const templateRentTitle = body.templateRentTitle !== undefined ? String(body.templateRentTitle).trim() : current.templateRentTitle;
  const templateRentBody = body.templateRentBody !== undefined ? String(body.templateRentBody).trim() : current.templateRentBody;
  const templateUtilityTitle = body.templateUtilityTitle !== undefined ? String(body.templateUtilityTitle).trim() : current.templateUtilityTitle;
  const templateUtilityBody = body.templateUtilityBody !== undefined ? String(body.templateUtilityBody).trim() : current.templateUtilityBody;

  const entries = [
    ['notify_recipient_email', recipientEmail],
    ['notify_mail_provider', mailProvider || 'smtp'],
    ['notify_resend_api_key', resendApiKey || ''],
    ['notify_resend_from_email', resendFromEmail || ''],
    ['notify_resend_from_name', resendFromName || ''],
    ['notify_smtp_host', smtpHost],
    ['notify_smtp_port', smtpPort],
    ['notify_smtp_secure', smtpSecure],
    ['notify_smtp_user', smtpUser],
    ['notify_smtp_pass', smtpPass],
    ['notify_smtp_from_name', smtpFromName],
    ['notify_smtp_from_email', smtpFromEmail],
    ['notify_days_before', notifyDaysBefore],
    ['notify_on_due_day', notifyOnDueDay],
    ['notify_on_overdue', notifyOnOverdue],
    ['notify_template_rent_title', templateRentTitle],
    ['notify_template_rent_body', templateRentBody],
    ['notify_template_utility_title', templateUtilityTitle],
    ['notify_template_utility_body', templateUtilityBody],
  ];

  for (const [k, v] of entries) {
    await env.DB.prepare(
      'INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    ).bind(k, v).run();
  }

  return jsonOk(null, '邮件通知与催租设置已保存');
}

/**
 * 模板变量替换引擎 (地道中文语境)
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [k, v] of Object.entries(vars)) {
    result = result.split(`{{${k}}}`).join(v || '');
  }
  return result;
}

/**
 * 底层邮件派发器 (支持 Resend REST API 与 SMTP 双通道)
 */
export async function sendEmailMessage(
  settings: NotificationSettings,
  toEmail: string,
  title: string,
  htmlContent: string
): Promise<{ success: boolean; message: string }> {
  if (!toEmail) {
    return { success: false, message: '未指定收件人邮箱' };
  }

  // 1. 优先根据指定的渠道派发：Resend API
  if (settings.mailProvider === 'resend') {
    if (!settings.resendApiKey) {
      return { success: false, message: '未配置 Resend API Key，请在系统设置中填写' };
    }
    return await sendResendEmail(
      {
        apiKey: settings.resendApiKey,
        fromName: settings.resendFromName || settings.smtpFromName || 'RentHub',
        fromEmail: settings.resendFromEmail || 'onboarding@resend.dev',
      },
      {
        to: toEmail,
        subject: title,
        html: htmlContent,
      }
    );
  }

  // 2. 自定义 SMTP 派发
  if (!settings.smtpHost || !settings.smtpPort) {
    return { success: false, message: '未配置 SMTP 发信服务器，请在系统设置中配置' };
  }

  return await sendSmtpEmail({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    user: settings.smtpUser,
    pass: settings.smtpPass,
    fromName: settings.smtpFromName || 'RentHub',
    fromEmail: settings.smtpFromEmail || settings.smtpUser,
  }, {
    to: toEmail,
    subject: title,
    html: htmlContent,
  });
}

/**
 * 房东主动手动发送测试邮件
 */
export async function handleSendTestNotification(env: Env, body: any) {
  const { 
    testEmail, 
    type, 
    mailProvider,
    resendApiKey,
    resendFromEmail,
    resendFromName,
    smtpHost, 
    smtpPort, 
    smtpSecure, 
    smtpUser, 
    smtpPass, 
    smtpFromName, 
    smtpFromEmail 
  } = body;
  const current = await getNotificationSettings(env);

  // 允许使用传入的实时配置测试 (方便用户在点击保存前先行测试)
  const activeSettings: NotificationSettings = {
    ...current,
    mailProvider: (mailProvider === 'resend' || mailProvider === 'smtp') ? mailProvider : current.mailProvider,
    resendApiKey: (resendApiKey && resendApiKey !== '****' && !resendApiKey.includes('****')) ? String(resendApiKey).trim() : current.resendApiKey,
    resendFromEmail: resendFromEmail !== undefined ? String(resendFromEmail).trim() : current.resendFromEmail,
    resendFromName: resendFromName !== undefined ? String(resendFromName).trim() : current.resendFromName,
    smtpHost: smtpHost !== undefined ? String(smtpHost).trim() : current.smtpHost,
    smtpPort: smtpPort !== undefined ? (parseInt(String(smtpPort), 10) || 465) : current.smtpPort,
    smtpSecure: smtpSecure !== undefined ? Boolean(smtpSecure) : current.smtpSecure,
    smtpUser: smtpUser !== undefined ? String(smtpUser).trim() : current.smtpUser,
    smtpPass: (smtpPass && smtpPass !== '****' && !smtpPass.includes('****')) ? String(smtpPass).trim() : current.smtpPass,
    smtpFromName: smtpFromName !== undefined ? String(smtpFromName).trim() : current.smtpFromName,
    smtpFromEmail: smtpFromEmail !== undefined ? String(smtpFromEmail).trim() : current.smtpFromEmail,
  };

  const targetEmail = testEmail || activeSettings.recipientEmail || (activeSettings.mailProvider === 'smtp' ? activeSettings.smtpUser : '');
  if (!targetEmail) {
    return jsonError('请先填写接收测试邮件的邮箱地址', 400);
  }

  const sampleVars = {
    房源名称: '望京SOHO 3-2-501',
    房源地址: '北京市朝阳区阜通东大街1号',
    承租人: '张三',
    承租人手机: '13800138000',
    租期范围: '2026-01-01 ~ 2027-01-01',
    应交租金: '6500.00',
    交租截止日: '2026-10-01',
    状态描述: '距交租还剩 8 天',
    房东电话: '13988886666',
    欠款金额: '168.50',
    结算日期: new Date().toISOString().slice(0, 10),
    用量明细: '用电 150 度 × ¥1.0；用水 5 吨 × ¥3.5',
    property_title: '望京SOHO 3-2-501',
    address: '北京市朝阳区阜通东大街1号',
    tenant_name: '张三',
    tenant_phone: '13800138000',
    lease_period: '2026-01-01 ~ 2027-01-01',
    rent_amount: '6500.00',
    due_date: '2026-10-01',
    status_desc: '距交租还剩 8 天',
    landlord_phone: '13988886666',
    unpaid_amount: '168.50',
    settle_date: new Date().toISOString().slice(0, 10),
    usage_details: '用电 150 度 × ¥1.0；用水 5 吨 × ¥3.5',
  };

  const isUtility = type === 'utility';
  const titleTemplate = isUtility ? activeSettings.templateUtilityTitle : activeSettings.templateRentTitle;
  const bodyTemplate = isUtility ? activeSettings.templateUtilityBody : activeSettings.templateRentBody;

  const title = renderTemplate(titleTemplate, sampleVars);
  const html = renderTemplate(bodyTemplate, sampleVars);

  const result = await sendEmailMessage(activeSettings, targetEmail, title, html);
  if (!result.success) {
    return jsonError(`发送测试邮件失败: ${result.message}`, 400);
  }

  const providerName = activeSettings.mailProvider === 'resend' ? 'Resend API' : 'SMTP 服务器';
  return jsonOk(null, `测试邮件已成功通过 ${providerName} 发送至 ${targetEmail}`);
}

/**
 * 房东待收提醒与定时检查执行器 (支持 Cloudflare Cron 或 API 主动触发)
 */
export async function handleTriggerNotificationCheck(env: Env) {
  const settings = await getNotificationSettings(env);
  const isConfigured = settings.mailProvider === 'resend' ? !!settings.resendApiKey : (!!settings.smtpHost && !!settings.smtpPort);
  if (!settings.recipientEmail || !isConfigured) {
    return jsonOk({ sentCount: 0, details: [] }, '未配置有效发信渠道或收件邮箱，已跳过检查');
  }

  const now = new Date();
  const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // 解析提前天数
  const daysList = settings.notifyDaysBefore
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));

  const leasesRes = await env.DB.prepare(
    "SELECT * FROM leases WHERE status = 'ACTIVE'"
  ).all();

  const sentDetails: string[] = [];
  let sentCount = 0;

  for (const lease of leasesRes.results as unknown as Lease[]) {
    if (!lease.next_pay_date) continue;

    const payDate = new Date(lease.next_pay_date);
    if (isNaN(payDate.getTime())) continue;

    const payZero = new Date(payDate.getFullYear(), payDate.getMonth(), payDate.getDate()).getTime();
    const diffDays = Math.round((payZero - todayZero) / (1000 * 60 * 60 * 24));

    let shouldNotify = false;
    let statusDesc = '';

    if (diffDays > 0 && daysList.includes(diffDays)) {
      shouldNotify = true;
      statusDesc = `距交租还剩 ${diffDays} 天`;
    } else if (diffDays === 0 && settings.notifyOnDueDay) {
      shouldNotify = true;
      statusDesc = '今日交租截止';
    } else if (diffDays < 0 && settings.notifyOnOverdue) {
      shouldNotify = true;
      statusDesc = `已逾期超期 ${Math.abs(diffDays)} 天`;
    }

    if (shouldNotify) {
      // 仅提醒 Worker 使用者 / 房东安全邮箱
      const targetEmail = settings.recipientEmail;
      if (!targetEmail) continue;

      const vars: Record<string, string> = {
        房源名称: lease.title || '',
        房源地址: lease.address || '未填写',
        承租人: lease.tenant_name || '租客',
        承租人手机: lease.tenant_phone || '',
        租期范围: `${lease.start_date} ~ ${lease.end_date}`,
        应交租金: String(lease.rent_amount || 0),
        交租截止日: lease.next_pay_date || '',
        状态描述: statusDesc,
        房东电话: lease.landlord_phone || '见租房合同',
        property_title: lease.title || '',
        address: lease.address || '未填写',
        tenant_name: lease.tenant_name || '租客',
        tenant_phone: lease.tenant_phone || '',
        lease_period: `${lease.start_date} ~ ${lease.end_date}`,
        rent_amount: String(lease.rent_amount || 0),
        due_date: lease.next_pay_date || '',
        status_desc: statusDesc,
        landlord_phone: lease.landlord_phone || '见租房合同',
      };

      const title = renderTemplate(settings.templateRentTitle, vars);
      const html = renderTemplate(settings.templateRentBody, vars);

      const res = await sendEmailMessage(settings, targetEmail, title, html);
      if (res.success) {
        sentCount++;
        sentDetails.push(`已向房东邮箱 (${targetEmail}) 发送 [${lease.title}] 待收租提醒 (${statusDesc})`);
      } else {
        sentDetails.push(`[${lease.title}] 提醒发送失败: ${res.message}`);
      }
    }
  }

  // 检查未结清的水电账单 (UNPAID)
  try {
    const unpaidPayments = await env.DB.prepare(
      "SELECT p.*, l.title as lease_title, l.tenant_name FROM payments p LEFT JOIN leases l ON p.lease_id = l.id WHERE p.status = 'UNPAID' AND p.payment_type IN ('ELECTRICITY', 'WATER', 'GAS', 'PROPERTY') AND l.status = 'ACTIVE' AND (p.remark NOT LIKE '%[坏账%' OR p.remark IS NULL)"
    ).all();

    for (const pmt of unpaidPayments.results as any[]) {
      const targetEmail = settings.recipientEmail;
      if (!targetEmail) continue;

      const vars = {
        房源名称: pmt.lease_title || '关联房屋',
        承租人: pmt.tenant_name || '租客',
        欠款金额: String(pmt.amount || 0),
        用量明细: pmt.remark || '抄表结算费用',
        property_title: pmt.lease_title || '关联房屋',
        tenant_name: pmt.tenant_name || '租客',
        unpaid_amount: String(pmt.amount || 0),
        usage_details: pmt.remark || '抄表结算费用',
      };

      const title = renderTemplate(settings.templateUtilityTitle, vars);
      const html = renderTemplate(settings.templateUtilityBody, vars);

      const res = await sendEmailMessage(settings, targetEmail, title, html);
      if (res.success) {
        sentCount++;
        sentDetails.push(`已向房东邮箱 (${targetEmail}) 发送 [${pmt.lease_title}] 水电待缴提醒 (¥${pmt.amount})`);
      }
    }
  } catch (_) {}

  return jsonOk({ sentCount, details: sentDetails }, `提醒检查已完成，共向您的邮箱发送了 ${sentCount} 封待收提醒`);
}
