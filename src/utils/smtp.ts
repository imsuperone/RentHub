// src/utils/smtp.ts
// 专为 Cloudflare Workers 边缘计算设计的零依赖、高可靠 SMTP 发信引擎
// 原生采用 cloudflare:sockets 直连，支持 SSL/TLS (465)、STARTTLS (587) 及国内全主流邮箱预设

import { connect } from 'cloudflare:sockets';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName?: string;
  fromEmail?: string;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// 主流邮箱服务商一键预设配置
export const SMTP_PRESETS: Record<string, { name: string; host: string; port: number; secure: boolean }> = {
  qq: {
    name: 'QQ 邮箱',
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
  },
  '163': {
    name: '163 网易邮箱',
    host: 'smtp.163.com',
    port: 465,
    secure: true,
  },
  '126': {
    name: '126 网易邮箱',
    host: 'smtp.126.com',
    port: 465,
    secure: true,
  },
  foxmail: {
    name: '腾讯企业邮 / Foxmail',
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true,
  },
  qiye163: {
    name: '网易企业邮',
    host: 'smtphz.qiye.163.com',
    port: 465,
    secure: true,
  },
  gmail: {
    name: 'Gmail (谷歌邮箱)',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  },
  outlook: {
    name: 'Outlook / Office 365',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
  },
};

/**
 * 字符串转 Base64 编码 (兼容纯 Edge 与 Node.js 跨平台环境)
 */
export function toBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * RFC 2047 规范：中文邮件标头 Base64 编码
 */
export function encodeHeader(text: string): string {
  if (!text) return '';
  // 纯 ASCII 则无需编码
  if (/^[\x20-\x7E]*$/.test(text)) return text;
  return `=?UTF-8?B?${toBase64Utf8(text)}?=`;
}

/**
 * Cloudflare Socket SMTP 会话封装
 */
class SmtpSocketClient {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  private buffer: string = '';
  private decoder = new TextDecoder();
  private encoder = new TextEncoder();
  private socket: any;

  constructor(socket: any) {
    this.socket = socket;
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
  }

  async startTls() {
    this.reader.releaseLock();
    this.writer.releaseLock();
    const secureSocket = this.socket.startTls();
    this.socket = secureSocket;
    this.reader = secureSocket.readable.getReader();
    this.writer = secureSocket.writable.getWriter();
  }

  async sendCommand(cmd: string): Promise<{ code: number; message: string; raw: string }> {
    await this.writer.write(this.encoder.encode(cmd + '\r\n'));
    return await this.readResponse();
  }

  async sendRaw(raw: string): Promise<void> {
    await this.writer.write(this.encoder.encode(raw));
  }

  async readResponse(timeoutMs = 15000): Promise<{ code: number; message: string; raw: string }> {
    let timer: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`SMTP 服务器响应超时 (${timeoutMs}ms)`)), timeoutMs);
    });

    try {
      return await Promise.race([this._readLines(), timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private async _readLines(): Promise<{ code: number; message: string; raw: string }> {
    const lines: string[] = [];
    while (true) {
      const newlineIdx = this.buffer.indexOf('\n');
      if (newlineIdx !== -1) {
        const line = this.buffer.slice(0, newlineIdx).replace(/\r$/, '');
        this.buffer = this.buffer.slice(newlineIdx + 1);
        lines.push(line);

        // 识别 SMTP 响应结尾行：以 3 位数字 + 空格 (或行尾) 开头，非 '-'
        const match = line.match(/^(\d{3})(?:[ -](.*))?$/);
        if (match) {
          const isContinuation = line.length >= 4 && line[3] === '-';
          if (!isContinuation) {
            const code = parseInt(match[1], 10);
            return {
              code,
              message: match[2] || '',
              raw: lines.join('\n'),
            };
          }
        }
        continue;
      }

      const { value, done } = await this.reader.read();
      if (done) {
        if (lines.length > 0) {
          const last = lines[lines.length - 1];
          const match = last.match(/^(\d{3})/);
          return {
            code: match ? parseInt(match[1], 10) : 0,
            message: last,
            raw: lines.join('\n'),
          };
        }
        throw new Error('SMTP 连接被对端服务器过早关闭');
      }
      this.buffer += this.decoder.decode(value, { stream: true });
    }
  }

  async close() {
    try {
      await this.sendCommand('QUIT');
    } catch (_) {}
    try {
      this.reader.releaseLock();
      this.writer.releaseLock();
      await this.socket.close();
    } catch (_) {}
  }
}

/**
 * 核心发信函数：通过 SMTP 派发邮件
 */
export async function sendSmtpEmail(
  config: SmtpConfig,
  mail: SendMailOptions
): Promise<{ success: boolean; message: string; messageId?: string }> {
  if (!config.host || !config.port) {
    return { success: false, message: '未配置 SMTP 服务器地址或端口' };
  }
  if (!mail.to) {
    return { success: false, message: '未指定收件人邮箱' };
  }

  const port = Number(config.port) || 465;
  const isSsl = config.secure !== false && (port === 465 || config.secure === true);
  const isStartTls = !isSsl && port === 587;

  let conn: SmtpSocketClient | null = null;
  try {
    const socketOptions: any = {};
    if (isSsl) {
      socketOptions.secureTransport = 'on';
    } else if (isStartTls) {
      socketOptions.secureTransport = 'starttls';
    } else {
      socketOptions.secureTransport = 'off';
    }

    const socket = connect({ hostname: config.host, port }, socketOptions);
    conn = new SmtpSocketClient(socket);

    // 1. 读取服务器初次握手问候语 (220)
    const greeting = await conn.readResponse(12000);
    if (greeting.code !== 220) {
      throw new Error(`SMTP 握手失败 (${greeting.code}): ${greeting.raw}`);
    }

    // 2. 发送 EHLO 客户端标识
    let ehlo = await conn.sendCommand('EHLO localhost');
    if (ehlo.code !== 250) {
      ehlo = await conn.sendCommand('HELO localhost');
      if (ehlo.code !== 250) {
        throw new Error(`EHLO 交互失败 (${ehlo.code}): ${ehlo.raw}`);
      }
    }

    // 3. 处理 STARTTLS 升级
    if (isStartTls) {
      const starttls = await conn.sendCommand('STARTTLS');
      if (starttls.code === 220) {
        await conn.startTls();
        ehlo = await conn.sendCommand('EHLO localhost');
      } else {
        throw new Error(`STARTTLS 加密协商失败 (${starttls.code}): ${starttls.raw}`);
      }
    }

    // 4. 用户名密码身份验证 (AUTH LOGIN)
    if (config.user && config.pass) {
      const auth = await conn.sendCommand('AUTH LOGIN');
      if (auth.code === 334) {
        const u = await conn.sendCommand(toBase64Utf8(config.user));
        if (u.code !== 334) {
          throw new Error(`账号错误或不支持 (${u.code}): ${u.raw}`);
        }
        const p = await conn.sendCommand(toBase64Utf8(config.pass));
        if (p.code !== 235) {
          if (p.code === 535) {
            throw new Error(`SMTP 密码认证失败 (535)：用户名或授权码错误。请注意：QQ/网易等邮箱必须使用生成的【专有授权码】，不能使用网页登录密码！`);
          }
          throw new Error(`SMTP 认证未通过 (${p.code}): ${p.raw}`);
        }
      } else if (auth.code !== 503 && auth.code !== 235) {
        throw new Error(`SMTP 认证不支持 AUTH LOGIN (${auth.code}): ${auth.raw}`);
      }
    }

    // 5. 指定发件人 (MAIL FROM)
    const fromAddr = config.fromEmail || config.user;
    const mailFrom = await conn.sendCommand(`MAIL FROM:<${fromAddr}>`);
    if (mailFrom.code !== 250) {
      throw new Error(`发件地址被拒 (${mailFrom.code}): ${mailFrom.raw}`);
    }

    // 6. 指定收件人 (RCPT TO)
    const rcptTo = await conn.sendCommand(`RCPT TO:<${mail.to}>`);
    if (rcptTo.code !== 250) {
      throw new Error(`收件地址被拒 (${rcptTo.code}): ${rcptTo.raw}`);
    }

    // 7. 发起数据载荷传输 (DATA)
    const dataResp = await conn.sendCommand('DATA');
    if (dataResp.code !== 354) {
      throw new Error(`DATA 握手失败 (${dataResp.code}): ${dataResp.raw}`);
    }

    // 8. 构造 RFC 2822 标准格式邮件
    const msgId = `<${Date.now()}.${Math.random().toString(36).slice(2, 9)}@${config.host}>`;
    const fromName = config.fromName || '房东管家';
    const fromHeader = `"${encodeHeader(fromName)}" <${fromAddr}>`;
    const subjectHeader = encodeHeader(mail.subject);
    const dateHeader = new Date().toUTCString();

    const rawBodyBase64 = toBase64Utf8(mail.html);
    const formattedBody = rawBodyBase64.match(/.{1,76}/g)?.join('\r\n') || rawBodyBase64;

    const emailHeaders = [
      `From: ${fromHeader}`,
      `To: <${mail.to}>`,
      `Subject: ${subjectHeader}`,
      `Date: ${dateHeader}`,
      `Message-ID: ${msgId}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
    ].join('\r\n');

    const emailPayload = `${emailHeaders}\r\n\r\n${formattedBody}\r\n.\r\n`;
    await conn.sendRaw(emailPayload);

    const finishResp = await conn.readResponse(15000);
    if (finishResp.code !== 250) {
      throw new Error(`邮件排队提交失败 (${finishResp.code}): ${finishResp.raw}`);
    }

    await conn.close();
    return { success: true, message: '邮件已成功通过 SMTP 服务器发送', messageId: msgId };
  } catch (err: any) {
    if (conn) {
      await conn.close();
    }
    return { success: false, message: `SMTP 派发失败: ${err.message || String(err)}` };
  }
}
