// src/utils/resend.ts
// 专为 Cloudflare Workers 打造的零依赖 Resend 现代邮件发送引擎
// 基于标准 Fetch REST API，免去 SMTP 端口探测与 TLS 握手困扰，秒级可靠投递

export interface ResendConfig {
  apiKey: string;
  fromName?: string;
  fromEmail?: string;
}

export interface ResendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * 通过 Resend API 发送邮件
 * 官方接口: POST https://api.resend.com/emails
 */
export async function sendResendEmail(
  config: ResendConfig,
  mail: ResendMailOptions
): Promise<{ success: boolean; message: string; messageId?: string }> {
  const apiKey = (config.apiKey || '').trim();
  if (!apiKey) {
    return { success: false, message: '未配置 Resend API Key，请在设置中填写' };
  }
  if (!mail.to || !mail.to.trim()) {
    return { success: false, message: '未指定收件人邮箱' };
  }

  // Resend 要求规范发件人格式: "DisplayName <sender@domain.com>" 或 "sender@domain.com"
  const fromEmail = (config.fromEmail || '').trim() || 'onboarding@resend.dev';
  const fromName = (config.fromName || '').trim() || '房东管家';
  const from = `${fromName} <${fromEmail}>`;

  try {
    const payload: Record<string, any> = {
      from,
      to: [mail.to.trim()],
      subject: mail.subject,
      html: mail.html,
    };
    if (mail.text) {
      payload.text = mail.text;
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: any = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      // 提取 Resend 详细错误
      let errMsg = data.message || data.error || `HTTP ${resp.status} ${resp.statusText}`;
      if (resp.status === 401 || resp.status === 403) {
        errMsg = `Resend API Key 无效或未授权 (${errMsg})`;
      } else if (resp.status === 422) {
        errMsg = `Resend 发信地址校验失败: ${errMsg} (若使用测试账号，请使用 onboarding@resend.dev 且收件人需为 Resend 注册邮箱，或绑定自定义域名)`;
      }
      return { success: false, message: `Resend 发送失败: ${errMsg}` };
    }

    return {
      success: true,
      message: '邮件已成功通过 Resend 派发',
      messageId: data.id,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `网络或 Resend 接口请求异常: ${err.message || String(err)}`,
    };
  }
}
