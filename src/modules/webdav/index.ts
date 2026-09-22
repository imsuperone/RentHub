// src/modules/webdav/index.ts
// 坚果云 & OpenList WebDAV 原生客户端 (带 AES-256-GCM 零知识端到端流式加密)

import { WebDavConfig } from '../../types';
import { encryptBuffer, decryptBuffer } from '../../utils/crypto';

function getAuthHeader(config: WebDavConfig): string {
  return 'Basic ' + btoa(`${config.username}:${config.password}`);
}

function cleanUrl(base: string, path: string): string {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * 测试 WebDAV 连通性 (使用 PROPFIND 探测根目录)
 */
export async function testWebDavConnection(config: WebDavConfig): Promise<{ success: boolean; message: string }> {
  try {
    const url = cleanUrl(config.endpoint, config.base_path || '/');
    const res = await fetch(url, {
      method: 'PROPFIND',
      headers: {
        Authorization: getAuthHeader(config),
        Depth: '0',
      },
    });

    if (res.status === 207 || res.status === 200) {
      return { success: true, message: 'WebDAV 连接测试成功！' };
    }
    if (res.status === 404) {
      // 目录尚不存在，尝试创建
      const created = await ensureWebDavDirectory(config, config.base_path || '/RentRecords');
      if (created) {
        return { success: true, message: 'WebDAV 连接成功，已自动创建目标基础目录！' };
      }
    }
    return { success: false, message: `WebDAV 响应状态异常: HTTP ${res.status} ${res.statusText}` };
  } catch (err: any) {
    return { success: false, message: `连接失败: ${err.message || String(err)}` };
  }
}

/**
 * 确保多级目录在 WebDAV 端存在 (递归 MKCOL)
 */
export async function ensureWebDavDirectory(config: WebDavConfig, dirPath: string): Promise<boolean> {
  const parts = dirPath.split('/').filter(Boolean);
  let current = '';

  for (const part of parts) {
    current += `/${part}`;
    const url = cleanUrl(config.endpoint, current);
    try {
      const propRes = await fetch(url, {
        method: 'PROPFIND',
        headers: { Authorization: getAuthHeader(config), Depth: '0' },
      });
      if (propRes.status === 404) {
        const mkRes = await fetch(url, {
          method: 'MKCOL',
          headers: { Authorization: getAuthHeader(config) },
        });
        if (mkRes.status !== 201 && mkRes.status !== 200 && mkRes.status !== 405) {
          // 405 可能表示已经存在
          return false;
        }
      }
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * 加密并上传文件到 WebDAV (坚果云 / OpenList 只会看到密文 .enc 文件)
 */
export async function uploadEncryptedFileToWebDav(
  config: WebDavConfig,
  subDir: string,
  fileName: string,
  rawBuffer: ArrayBuffer,
  cryptoKey: CryptoKey
): Promise<{ success: boolean; webdavPath: string; ivBase64: string; error?: string }> {
  try {
    const fullDirPath = cleanUrl(config.base_path || '/RentRecords', subDir);
    await ensureWebDavDirectory(config, fullDirPath);

    // 1. 本地 AES-256-GCM 强加密
    const { ciphertext, ivBase64 } = await encryptBuffer(rawBuffer, cryptoKey);

    // 2. 生成远端密文文件名
    const encFileName = `${fileName}.enc`;
    const targetPath = `${fullDirPath}/${encFileName}`;
    const targetUrl = cleanUrl(config.endpoint, targetPath);

    // 3. HTTP PUT 上传密文块
    const putRes = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        Authorization: getAuthHeader(config),
        'Content-Type': 'application/octet-stream',
      },
      body: ciphertext,
    });

    if (putRes.status === 200 || putRes.status === 201 || putRes.status === 204) {
      return {
        success: true,
        webdavPath: targetPath,
        ivBase64,
      };
    } else {
      return {
        success: false,
        webdavPath: '',
        ivBase64: '',
        error: `上传失败: HTTP ${putRes.status} ${putRes.statusText}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      webdavPath: '',
      ivBase64: '',
      error: `上传异常: ${err.message || String(err)}`,
    };
  }
}

/**
 * 从 WebDAV 下载密文文件并实时解密还原
 */
export async function downloadAndDecryptFromWebDav(
  config: WebDavConfig,
  webdavPath: string,
  ivBase64: string,
  cryptoKey: CryptoKey
): Promise<ArrayBuffer> {
  const targetUrl = cleanUrl(config.endpoint, webdavPath);
  const getRes = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(config),
    },
  });

  if (!getRes.ok) {
    throw new Error(`无法从 WebDAV 获取文件: HTTP ${getRes.status}`);
  }

  const encryptedBytes = await getRes.arrayBuffer();
  // 解密并返回明文 Buffer
  return await decryptBuffer(encryptedBytes, cryptoKey, ivBase64);
}

/**
 * 从 WebDAV 删除文件
 */
export async function deleteFromWebDav(config: WebDavConfig, webdavPath: string): Promise<boolean> {
  try {
    const targetUrl = cleanUrl(config.endpoint, webdavPath);
    const res = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        Authorization: getAuthHeader(config),
      },
    });
    return res.status === 200 || res.status === 204 || res.status === 404;
  } catch {
    return false;
  }
}
