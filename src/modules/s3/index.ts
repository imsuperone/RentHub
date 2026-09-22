// src/modules/s3/index.ts
// 原生零依赖 AWS SigV4 对象存储客户端 (支持 阿里云 OSS、腾讯云 COS、七牛云、Cloudflare R2、MinIO 等)
// 完全基于 Web Crypto API 与原生 fetch，零第三方 npm 依赖，极致轻量

import { S3Config } from '../../types';
import { encryptBuffer, decryptBuffer } from '../../utils/crypto';

// 字节转十六进制辅助
function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// 字符串转 Uint8Array
function strToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// SHA-256 哈希计算
async function sha256Hex(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  const bytes = typeof data === 'string' ? strToBytes(data) : data;
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return toHex(hash);
}

// HMAC-SHA256 计算
async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string | Uint8Array): Promise<ArrayBuffer> {
  const keyBytes = key instanceof Uint8Array ? key : new Uint8Array(key);
  const dataBytes = typeof data === 'string' ? strToBytes(data) : data;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
}

// 派生 AWS SigV4 签名密钥
async function getSignatureKey(secretKey: string, dateStamp: string, region: string): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(strToBytes('AWS4' + secretKey), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, 's3');
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

// 标准化 S3 请求 URL 与 Host
function getS3UrlAndHost(config: S3Config, objectKey: string): { url: string; host: string; path: string } {
  let endpoint = config.endpoint.replace(/^https?:\/\//, '').trim();
  if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);

  const cleanKey = objectKey.startsWith('/') ? objectKey.slice(1) : objectKey;
  const bucket = config.bucket.trim();

  // 判断是否为虚拟主机风格 (bucket.endpoint)
  let host = `${bucket}.${endpoint}`;
  let path = `/${cleanKey}`;
  let url = `https://${host}${path}`;

  // 如果 endpoint 已经是 IP 或者 localhost，则使用路径风格 (endpoint/bucket/key)
  if (/^(\d{1,3}\.){3}\d{1,3}/.test(endpoint) || endpoint.includes('localhost')) {
    host = endpoint;
    path = `/${bucket}/${cleanKey}`;
    url = `https://${host}${path}`;
  }

  return { url, host, path };
}

/**
 * 构造并发送经过 AWS SigV4 认证的 S3 REST API 请求
 */
async function sendS3Request(
  config: S3Config,
  method: string,
  objectKey: string,
  body?: ArrayBuffer | Uint8Array
): Promise<Response> {
  const { url, host, path } = getS3UrlAndHost(config, objectKey);
  const region = config.region || 'us-east-1';

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // 格式: 20260922T160000Z
  const dateStamp = amzDate.slice(0, 8); // 格式: 20260922

  const bodyBuffer = body || new Uint8Array(0);
  const payloadHash = await sha256Hex(bodyBuffer);

  // 1. 规范标头 (Canonical Headers)
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

  // 2. 规范请求 (Canonical Request)
  // URI 编码 path 中的斜杠需保留
  const encodedPath = path
    .split('/')
    .map(p => encodeURIComponent(p))
    .join('/');

  const canonicalRequest = `${method}\n${encodedPath}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // 3. 待签字符串 (String to Sign)
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // 4. 计算签名
  const signingKey = await getSignatureKey(config.secret_access_key, dateStamp, region);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = toHex(signatureBuffer);

  // 5. 构造 Authorization 标头
  const authHeader = `AWS4-HMAC-SHA256 Credential=${config.access_key_id}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers: Record<string, string> = {
    Host: host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    Authorization: authHeader,
  };

  if (body) {
    headers['Content-Type'] = 'application/octet-stream';
  }

  return await fetch(url, {
    method,
    headers,
    body: body ? body : undefined,
  });
}

/**
 * 测试 S3 对象存储连通性 (写入并删除微型探测文件)
 */
export async function testS3Connection(config: S3Config): Promise<{ success: boolean; message: string }> {
  try {
    if (!config.endpoint || !config.bucket || !config.access_key_id || !config.secret_access_key) {
      return { success: false, message: '请完整填写 S3 Endpoint、存储桶名称及 AccessKey 凭证' };
    }

    const testKey = `.renthub_probe_${Date.now()}.tmp`;
    const testContent = strToBytes('probe');

    // 尝试 PUT 上传探测文件
    const putRes = await sendS3Request(config, 'PUT', testKey, testContent);
    if (!putRes.ok) {
      const errText = await putRes.text().catch(() => '');
      return {
        success: false,
        message: `S3 响应错误 (HTTP ${putRes.status}): ${errText.slice(0, 150) || putRes.statusText}`,
      };
    }

    // 探测成功，异步清理探测文件
    sendS3Request(config, 'DELETE', testKey).catch(() => {});

    return {
      success: true,
      message: `✓ 成功连通对象存储 [${config.bucket}]！权限验证通过。`,
    };
  } catch (err: any) {
    return { success: false, message: `连接异常: ${err.message || String(err)}` };
  }
}

/**
 * 加密并上传文件到 S3 对象存储
 */
export async function uploadEncryptedFileToS3(
  config: S3Config,
  subDir: string,
  fileName: string,
  rawBuffer: ArrayBuffer,
  cryptoKey: CryptoKey
): Promise<{ success: boolean; s3Path: string; ivBase64: string; error?: string }> {
  try {
    // 1. 本地 AES-256-GCM 强加密
    const { ciphertext, ivBase64 } = await encryptBuffer(rawBuffer, cryptoKey);

    // 2. 构造存储路径
    const basePath = (config.base_path || 'RentHubFiles').replace(/^\/|\/$/g, '');
    const cleanSubDir = subDir.replace(/^\/|\/$/g, '');
    const encFileName = `${fileName}.enc`;
    const objectKey = `${basePath}/${cleanSubDir}/${encFileName}`;

    // 3. 发送 S3 PUT 请求
    const res = await sendS3Request(config, 'PUT', objectKey, ciphertext);

    if (res.ok) {
      return {
        success: true,
        s3Path: objectKey,
        ivBase64,
      };
    } else {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        s3Path: '',
        ivBase64: '',
        error: `S3 上传失败 (HTTP ${res.status}): ${errText.slice(0, 100) || res.statusText}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      s3Path: '',
      ivBase64: '',
      error: `S3 上传异常: ${err.message || String(err)}`,
    };
  }
}

/**
 * 从 S3 对象存储下载密文并解密还原明文
 */
export async function downloadAndDecryptFromS3(
  config: S3Config,
  objectKey: string,
  ivBase64: string,
  cryptoKey: CryptoKey
): Promise<ArrayBuffer> {
  const res = await sendS3Request(config, 'GET', objectKey);
  if (!res.ok) {
    throw new Error(`无法从 S3 下载文件 (HTTP ${res.status}): ${res.statusText}`);
  }

  const encryptedBytes = await res.arrayBuffer();
  return await decryptBuffer(encryptedBytes, cryptoKey, ivBase64);
}

/**
 * 从 S3 对象存储删除文件
 */
export async function deleteFromS3(config: S3Config, objectKey: string): Promise<boolean> {
  try {
    const res = await sendS3Request(config, 'DELETE', objectKey);
    return res.status === 204 || res.status === 200 || res.status === 404;
  } catch {
    return false;
  }
}
