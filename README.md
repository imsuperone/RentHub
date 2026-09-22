# 🏡 RentHub (房东管家) - 房源出租记账与多渠道文件中心

[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare%20Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![D1 Database](https://img.shields.io/badge/Database-Cloudflare%20D1%20(SQLite)-0051C3?logo=sqlite)](https://developers.cloudflare.com/d1/)
[![Zero External SDK](https://img.shields.io/badge/Dependencies-Zero%20Heavy%20SDK-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **极简好用的开源房东出租记账、水电抄表与文件凭单存储系统。**  
> 基于 **Cloudflare Workers 边缘计算 + D1 数据库**，零服务器运维、零绑卡门槛，完全运行在 Cloudflare 免费配额内。

---

## ✨ 核心特性

1. **🛡️ 纯粹安全与多重防护**：
   - 支持主密码登录、手机 2FA（TOTP 动态口令）、8 组紧急备用恢复码、安全密保问题及安全邮箱找回，层层守护。
   - 所有接口在 Cloudflare 边缘计算直接鉴权拦截，未授权请求绝不触碰核心数据。
2. **📁 多渠道自由文件中心 (透明存储 · 端到端 AES-256-GCM 强加密)**：
   - **本地 D1 数据库**：零门槛开箱即用，密文直存 SQLite，无任何外部服务依赖。
   - **WebDAV / 网盘挂载**：原生直连坚果云、123云盘，配合 **AList** 更可无感挂载 **阿里云盘、百度网盘、天翼云、夸克网盘**。
   - **S3 兼容对象存储**：原生纯 WebCrypto 实现 AWS SigV4 签名，完美直连 **阿里云 OSS、腾讯云 COS、Cloudflare R2、七牛云 Kodo 及自建 MinIO**，零安装任何庞大的第三方 SDK。
   - **存储去向绝对透明**：上传时可自主指定保存去向并查看即时安全说明；在文件中心可按存储渠道（本地 D1 / WebDAV / S3 / 房源 / 记账）自由筛选与快速检索。
3. **⚡ 房东实务工作流与极速记账**：
   - **一键收租**：自动计算月付/季付/半年付/年付应收金额，收租后自动顺延下次交租日。
   - **水电抄表自动算费**：输入上次底数、本次底数与单价，自动计算用量并滚存底数，自动生成待收欠款。
   - **地道微信沟通模板**：内置一键生成自然、有礼貌的微信催租提醒、租金收据与水电结算明细。
4. **📧 待收预警与一键全量数据库邮件备份**：
   - 专为 Cloudflare Workers 打造的原生纯 Socket 直连发信引擎，支持 QQ 邮箱、网易 163/126、腾讯企业邮、Gmail、Outlook 等。
   - 可一键将全量房源、账单、文件索引数据加密打包发送至管理员邮箱，作为本地冷备存档。
5. **📱 Android 16 (Material 3 Expressive) 原生美学**：
   - 超大平滑圆角容器（`28px`）、交互触感胶囊按钮、双态沉浸式卡片，完美适配手机移动端、微信内置浏览器与 PC 桌面端。
6. **💰 极致轻量与节流免费配额**：
   - 打包后 Worker 脚本体积仅 **116 KB**（gzip），个人或小微房东每日运行消耗不足 Cloudflare 免费配额的 0.1%。

---

## 🚀 快速上手与本地调试

### 1. 克隆代码并安装依赖
```bash
git clone https://github.com/imsuperone/RentHub.git
cd RentHub
npm install
```

### 2. 初始化本地数据库表结构
```bash
npm run db:migrate:local
# 或直接执行全量 schema:
npx wrangler d1 execute zufang_db --local --file=./schema.sql
```

### 3. 启动本地开发服务
```bash
npm run dev
```
浏览器打开 `http://127.0.0.1:8787` 即可开始使用。

---

## ☁️ 部署到 Cloudflare 生产环境 (零绑卡保姆级教程)

本系统仅需要 Cloudflare 免费版 **Workers** 与 **D1 Database**，无需绑定信用卡！

### 第一步：登录 Cloudflare
```bash
npx wrangler login
```

### 第二步：创建线上 D1 数据库
```bash
npx wrangler d1 create zufang_db
```
执行完毕后，控制台会输出生成的 `database_id`，例如：
```json
{
  "binding": "DB",
  "database_name": "zufang_db",
  "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 第三步：更新 `wrangler.jsonc` 配置文件
将 `wrangler.jsonc` 中的 `database_id` 替换为您刚刚创建的真实 ID：
```jsonc
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "zufang_db",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" // 👈 粘贴在这里
    }
  ]
```

### 第四步：推送线上数据库表结构
```bash
npx wrangler d1 execute zufang_db --remote --file=./schema.sql
```

### 第五步：一键部署发布
```bash
npm run deploy
```
部署成功后，终端将输出专属访问域名（如 `https://renthub.<你的子域>.workers.dev`）。首次打开系统将引导您完成管理员账号与安全凭证初始化。

---

## 📦 多渠道文件与云存储配置指南

登录系统后，点击底部或顶部导航栏的 **「⚙️ 设置」**，即可随时开启与切换存储方式：

### 渠道 1：本地 D1 数据库 (默认)
- **无需任何外部配置**，文件经端到端 AES-256-GCM 强加密后直接保存在 SQLite 中，适合追求极简、不愿配置第三方存储的用户。

### 渠道 2：WebDAV / 网盘 (坚果云 / AList 挂载阿里云盘·百度网盘)
- **坚果云**：点击「坚果云预设」自动填入地址，填入坚果云注册账号与生成的第三方应用授权码。
- **AList 挂载网盘**：如果部署了 AList，可将阿里云盘、百度网盘、天翼云盘挂载至 AList 后，填入 AList 的 WebDAV 地址与账号密码，即可实现把房源凭证自动加密存储在各大国内网盘。

### 渠道 3：S3 兼容对象存储 (阿里云 OSS / 腾讯云 COS / Cloudflare R2 / MinIO)
- 在系统设置中选择对应的厂商预设（如阿里云 OSS、腾讯云 COS、Cloudflare R2），填入 Endpoint、存储桶名称及 AccessKey / SecretKey 凭证即可。
- 原生纯 WebCrypto 边缘签名，零外部 SDK 依赖。

---

## 🔒 密码学与离线容灾安全性

即使未来您不再使用 Cloudflare，存放在各处的文件也不会锁死丢失：
- 所有文件均采用工业级标准的 **AES-256-GCM** 算法加密。
- 随机 IV（初始向量）记录在数据库，Tag 认证标签位于密文末尾 16 字节。
- 任何标准 Web Crypto 或 Python `cryptography` 单脚本均可随时批量解密还原所有文件。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源，欢迎自由二次开发与部署使用。
