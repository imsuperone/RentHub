// src/utils/crypto.ts
// 原生 Web Crypto API 强加密核心库 (零第三方依赖，极致轻便高效)

const PBKDF2_ITERATIONS = 100000;

// ==================== 实用二进制与字符串转换 ====================

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function generateRandomHex(byteLength: number = 16): string {
  return bytesToHex(generateRandomBytes(byteLength));
}

// ==================== PBKDF2 密码强哈希 ====================

export async function hashPassword(password: string, existingSaltHex?: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = existingSaltHex ? hexToBytes(existingSaltHex) : generateRandomBytes(16);
  const enc = new TextEncoder();
  const passKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passKey,
    256 // 256 bits = 32 bytes
  );

  return {
    hash: bytesToHex(new Uint8Array(derivedBits)),
    salt: bytesToHex(saltBytes),
  };
}

export async function verifyPassword(password: string, saltHex: string, expectedHashHex: string): Promise<boolean> {
  const result = await hashPassword(password, saltHex);
  // 常量时间比对防时序攻击
  if (result.hash.length !== expectedHashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < result.hash.length; i++) {
    diff |= result.hash.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
  }
  return diff === 0;
}

// ==================== TOTP 双因子验证 (RFC 6238) ====================

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length: number = 20): string {
  const bytes = generateRandomBytes(length);
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const result: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      result.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(result);
}

export async function computeTOTP(secretBase32: string, counter: number): Promise<string> {
  const keyBytes = base32ToBytes(secretBase32);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  // Counter 写入 8 字节大端整数
  const counterBuffer = new ArrayBuffer(8);
  const view = new DataView(counterBuffer);
  view.setUint32(0, Math.floor(counter / 0x100000000));
  view.setUint32(4, counter >>> 0);

  const hmac = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmacBytes = new Uint8Array(hmac);

  // 动态截断 Dynamic Truncation
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const code =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const strCode = (code % 1000000).toString().padStart(6, '0');
  return strCode;
}

export async function verifyTOTP(token: string, secretBase32: string, windowSteps: number = 1): Promise<boolean> {
  const trimmed = token.trim();
  if (trimmed.length !== 6) return false;
  const currentCounter = Math.floor(Date.now() / 1000 / 30);

  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const expected = await computeTOTP(secretBase32, currentCounter + offset);
    if (expected === trimmed) {
      return true;
    }
  }
  return false;
}

export function generateRecoveryCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const hex = generateRandomHex(4).toUpperCase();
    codes.push(`${hex.substring(0, 4)}-${hex.substring(4)}`);
  }
  return codes;
}

// ==================== AES-256-GCM 强加密/解密 ====================

export async function deriveKeyFromSecret(secretText: string, saltText: string = 'zufang_edge_salt'): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const masterKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretText),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(saltText),
      iterations: 50000,
      hash: 'SHA-256',
    },
    masterKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 使用 AES-256-GCM 加密二进制或字符串
 * Web Crypto 的 AES-GCM 加密结果会自动在末尾附带 16 字节认证标签 (Auth Tag)
 */
export async function encryptBuffer(data: ArrayBuffer | Uint8Array, cryptoKey: CryptoKey): Promise<{ ciphertext: Uint8Array; ivBase64: string }> {
  const iv = generateRandomBytes(12); // GCM 推荐 12 字节 IV
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    cryptoKey,
    data
  );

  return {
    ciphertext: new Uint8Array(encryptedBuffer),
    ivBase64: bytesToBase64(iv),
  };
}

export async function decryptBuffer(encryptedBytes: ArrayBuffer | Uint8Array, cryptoKey: CryptoKey, ivBase64: string): Promise<ArrayBuffer> {
  const iv = base64ToBytes(ivBase64);
  return await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    cryptoKey,
    encryptedBytes
  );
}

export async function encryptString(text: string, cryptoKey: CryptoKey): Promise<{ cipherBase64: string; ivBase64: string }> {
  const enc = new TextEncoder();
  const { ciphertext, ivBase64 } = await encryptBuffer(enc.encode(text), cryptoKey);
  return {
    cipherBase64: bytesToBase64(ciphertext),
    ivBase64,
  };
}

export async function decryptString(cipherBase64: string, cryptoKey: CryptoKey, ivBase64: string): Promise<string> {
  const bytes = base64ToBytes(cipherBase64);
  const decrypted = await decryptBuffer(bytes, cryptoKey, ivBase64);
  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
