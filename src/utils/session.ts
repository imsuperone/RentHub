// src/utils/session.ts
// 无状态防篡改 Session Cookie (HMAC-SHA256 签名，彻底杜绝 KV 写入开销)

import { SessionPayload } from '../types';

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionToken(payload: SessionPayload, secretSeed: string): Promise<string> {
  const enc = new TextEncoder();
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${header}.${body}`;

  const key = await getHmacKey(secretSeed);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const signatureBytes = new Uint8Array(signatureBuffer);
  
  let binary = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  const signature = base64UrlEncode(binary);

  return `${dataToSign}.${signature}`;
}

export async function verifySessionToken(token: string, secretSeed: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const dataToSign = `${header}.${body}`;

    const enc = new TextEncoder();
    const key = await getHmacKey(secretSeed);

    const sigBinary = base64UrlDecode(signature);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(dataToSign));
    if (!isValid) return null;

    const payload: SessionPayload = JSON.parse(base64UrlDecode(body));
    const now = Math.floor(Date.now() / 1000);

    // 检查过期时间
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
