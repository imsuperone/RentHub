# 🗄️ RentHub (房东管家) D1 数据库结构与速读指南 (SCHEMA.md)

本项目底层采用 **Cloudflare D1 (Serverless SQLite 关系型数据库)**，专为房东多房运营、财务抄表及加密凭证设计。数据表设计保持高度规约与零冗余，所有表均可在系统后台「系统设置 -> 🗄️ D1 数据库透视」中直接可视化速查与导出。

---

## 1. 管理员与认证表 (`users`)
存放管理员账号认证信息与多重安全凭据。

| 字段名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | TEXT (PK) | 用户唯一标识 | `usr_a1b2c3d4` |
| `username` | TEXT (Unique) | 登录用户名 | `admin` |
| `password_hash`| TEXT | PBKDF2-HMAC-SHA256 10万次强哈希 | `64位十六进制` |
| `salt` | TEXT | 密码独立 16 字节随机 Salt | `d4e5f6...` |
| `totp_secret` | TEXT | RFC 6238 Base32 密钥 | `JBSWY3DPEHPK3PXP` |
| `totp_enabled` | INTEGER | 2FA 是否激活 (`1`: 已开, `0`: 关闭) | `1` 或 `0` |
| `recovery_codes`| TEXT | 8 组紧急备用恢复码 JSON 数组 | `["A1B2-C3D4", ...]` |
| `recovery_email`| TEXT | 安全找回与告警接收邮箱 | `landlord@example.com` |
| `security_question`| TEXT | 密保问题题目 | `您就读的第一所小学全称是？` |
| `security_answer_hash`| TEXT | 密保答案 PBKDF2 哈希 | `64位十六进制` |
| `security_answer_salt`| TEXT | 密保独立随机 Salt | `32位十六进制` |
| `created_at` | TEXT | 创建时间 | `2026-09-21 21:00:00` |

---

## 2. 房源与租客合同表 (`leases`)
存放房源核心资产信息、租客联系方式、起止日、租金周期与水电底数标准。

| 字段名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | TEXT (PK) | 租约唯一编号 | `lse_99887766` |
| `title` | TEXT | 房屋名称 / 房号 | `朝阳区望京SOHO 3-2-501` |
| `address` | TEXT | 详细房屋地址 (留空时自动复用名称) | `北京市朝阳区阜通东大街1号` |
| `tenant_name` | TEXT | 承租人姓名 | `张三` |
| `tenant_phone`| TEXT | 租客联系手机号 | `13800138000` |
| `tenant_id_card`| TEXT | 租客身份证 / 紧急备忘 | `1101011990...` |
| `tenant_email`| TEXT | 租客接收账单通知邮箱 | `tenant@example.com` |
| `landlord_name`| TEXT | 房东/经办人姓名 | `王房东` |
| `landlord_phone`| TEXT | 房东/客服联系电话 | `13900000000` |
| `start_date` | TEXT | 起租日期 (`YYYY-MM-DD`) | `2024-01-01` |
| `end_date` | TEXT | 到期日期 (`YYYY-MM-DD`) | `2025-01-01` |
| `rent_amount` | REAL | 每月租金金额 (元) | `6500.00` |
| `deposit_amount`| REAL | 实收代管押金 (元) | `6500.00` |
| `pay_cycle_months`| INTEGER| 交租周期月数 (`1`:月付, `3`:季付, `6`:半年, `12`:年付) | `3` |
| `next_pay_date`| TEXT | 下次约定收租日期 (`YYYY-MM-DD`) | `2024-12-25` |
| `meter_electric_price` | REAL | 电费单价标准 (元/度) | `1.00` |
| `meter_water_price` | REAL | 水费单价标准 (元/吨) | `3.00` |
| `meter_electric_base` | REAL | 最新电表滚存底数 | `150.0` |
| `meter_water_base` | REAL | 最新水表滚存底数 | `35.0` |
| `status` | TEXT | 状态 (`ACTIVE`:在租, `TERMINATED`:已结清退租) | `ACTIVE` |
| `notes` | TEXT | 特别约定与备注 | `含一个地下车位` |

---

## 3. 账单与收支流水记录表 (`payments`)
存放租金收取、水电抄表算费及各项杂费流水。

| 字段名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | TEXT (PK) | 账单流水唯一编号 | `pmt_12345678` |
| `lease_id` | TEXT (FK) | 关联合同房源 ID | `lse_99887766` |
| `payment_type` | TEXT | 费用类型 (`RENT`, `ELECTRICITY`, `WATER`, `DEPOSIT`, `OTHER`) | `ELECTRICITY` |
| `amount` | REAL | 实收/应收金额 (元) | `360.00` |
| `status` | TEXT | 结算状态 (`PAID`:已结清付款, `UNPAID`:待缴欠费) | `PAID` |
| `paid_at` | TEXT | 收款/抄表结算时间 | `2024-08-01 15:30:00` |
| `period_start`| TEXT | 计费区间开始日期 | `2024-07-01` |
| `period_end` | TEXT | 计费区间结束日期 | `2024-07-31` |
| `meter_last` | REAL | 上次抄表底数 | `150.0` |
| `meter_current`| REAL | 本次抄表底数 | `450.0` |
| `meter_usage` | REAL | 实际用量 (`meter_current - meter_last`) | `300.0` (度) |
| `unit_price` | REAL | 计费单价 (元/度或吨) | `1.00` |
| `remark` | TEXT | 流水备注 / 支付说明 | `9月份电费微信转账` |

---

## 4. 文件与单据附件表 (`attachments`)
存放租房合同原件、转账截图、水电表照片等文件索引，端到端 AES-256-GCM 强加密。

| 字段名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | TEXT (PK) | 文件唯一编号 | `att_abcdef12` |
| `lease_id` | TEXT (FK) | 关联房源 ID (可选，解绑置空保护原件) | `lse_99887766` |
| `payment_id` | TEXT (FK) | 关联账单流水 ID (可选) | `pmt_12345678` |
| `file_name` | TEXT | 原文件名称 | `租房合同原件2026.jpg` |
| `file_size` | INTEGER | 文件字节大小 (Bytes) | `245800` |
| `mime_type` | TEXT | 文件 MIME 类型 | `image/jpeg` |
| `category` | TEXT | 分类 (`CONTRACT`, `RECEIPT`, `HANDOVER`, `OTHER`) | `CONTRACT` |
| `storage_type`| TEXT | 存储渠道 (`D1_LOCAL`: 本地D1, `WEBDAV`: 网盘, `S3`: 对象存储) | `D1_LOCAL` |
| `data_blob` | TEXT | Base64 AES-256-GCM 密文 (仅 D1_LOCAL 模式使用) | `密文字符串...` |
| `webdav_path` | TEXT | 网盘或 S3 对象远端相对路径 | `/RentRecords/att_xxx.enc` |
| `enc_iv` | TEXT | 12 字节初始化向量 (Base64) | `3a9b...` |
| `enc_tag` | TEXT | 16 字节认证标签 (Base64 / GCM) | `f01c...` |
| `created_at` | TEXT | 上传时间戳 | `2026-09-22 10:00:00` |

---

## 5. 系统设置表 (`system_settings`)
存放全局存储配置、默认渠道、发信凭据等。

| 键名 (`key`) | 类型 | 说明 |
| :--- | :--- | :--- |
| `default_storage` | TEXT | 全局默认存储渠道 (`D1_LOCAL` / `WEBDAV` / `S3`) |
| `webdav_config` | TEXT | WebDAV / AList 端点、账号、应用密码等 JSON |
| `s3_config` | TEXT | S3 Endpoint、Bucket、Region、AK/SK 凭证 JSON |
| `notification_settings`| TEXT | 提醒天数与 SMTP 发信服务器配置 JSON |
| `init_completed` | TEXT | 系统初始化完成状态标记 (`true`) |
