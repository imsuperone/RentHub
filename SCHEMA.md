# 🗄️ 房东管家 (zufangwoker) D1 数据库结构与速读指南 (SCHEMA.md)

本项目底层采用 **Cloudflare D1 (SQLite 关系型数据库)**，专为房东多房运营、财务抄表及加密凭证设计。数据表设计保持高度规约与零冗余，所有表均可在系统后台「系统设置 -> 🗄️ D1 数据库透视」中直接可视化速查与导出。

---

## 1. 管理员与认证表 (`users`)
存放管理员账号认证信息与 2FA 密钥体系。

| 字段名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | TEXT (PK) | 用户唯一标识 | `usr_a1b2c3d4` |
| `username` | TEXT (Unique) | 登录用户名 | `admin` |
| `password_hash`| TEXT | PBKDF2-HMAC-SHA256 10万次哈希 | `64位十六进制` |
| `salt` | TEXT | 密码独立加密盐 (32位十六进制) | `d4e5f6...` |
| `totp_secret` | TEXT | RFC 6238 Base32 密钥 | `JBSWY3DPEHPK3PXP` |
| `totp_enabled` | INTEGER | 2FA 是否激活 (`1`: 已开, `0`: 关闭) | `1` 或 `0` |
| `recovery_codes`| TEXT | 8 组紧急备用恢复码 JSON 数组 | `["A1B2-C3D4", ...]` |
| `created_at` | TEXT | 注册时间戳 | `2026-09-21 21:00:00` |

---

## 2. 房源与租客合同表 (`leases`)
存放房源核心资产信息、租客联系方式、起止日、租金与水电底数标准。

| 字段名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | TEXT (PK) | 租约唯一编号 | `lse_99887766` |
| `title` | TEXT | 房屋名称 / 房号 | `朝阳区望京SOHO 3-2-501` |
| `address` | TEXT | 详细房屋地址 | `北京市朝阳区阜通东大街1号` |
| `tenant_name` | TEXT | 承租人姓名 | `张三` |
| `tenant_phone`| TEXT | 租客联系手机号 | `13800138000` |
| `tenant_id_card`| TEXT | 租客身份证 / 紧急备忘 | `1101011990...` |
| `landlord_name`| TEXT | 房东/经办人姓名 | `王房东` |
| `landlord_phone`| TEXT | 房东/客服联系电话 | `13900000000` |
| `start_date` | TEXT | 起租日期 (YYYY-MM-DD) | `2024-01-01` |
| `end_date` | TEXT | 到期日期 (YYYY-MM-DD) | `2025-01-01` |
| `rent_amount` | REAL | 每月租金金额 (元) | `6500.00` |
| `deposit_amount`| REAL | 实收房屋押金 (元) | `6500.00` |
| `pay_cycle_months`| INTEGER| 交租周期月数 (`1`:月付, `3`:季付, `12`:年付) | `12` |
| `next_pay_date`| TEXT | 下次约定收租日期 | `2024-12-25` |
| `meter_electric_price` | REAL | 电费单价标准 (元/度) | `1.20` |
| `meter_water_price` | REAL | 水费单价标准 (元/吨) | `4.50` |
| `meter_electric_base` | REAL | 交房时初始电表底数 | `150.0` |
| `meter_water_base` | REAL | 交房时初始水表底数 | `35.0` |
| `status` | TEXT | 状态 (`ACTIVE`:在租, `TERMINATED`:退租, `EXPIRED`:超期) | `ACTIVE` |
| `notes` | TEXT | 合同特别约定 / 备注 | `含一个地下车位` |

---

## 3. 账单与交费记录表 (`payments`)
存放租金收取、水电抄表算费及杂费流水记录。

| 字段名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | TEXT (PK) | 账单流水唯一编号 | `pay_12345678` |
| `lease_id` | TEXT (FK) | 关联合同房源 ID | `lse_99887766` |
| `payment_type` | TEXT | 费用类型 (`RENT`, `ELECTRICITY`, `WATER`, `DEPOSIT`, `OTHER`) | `ELECTRICITY` |
| `amount` | REAL | 实收金额 (元) | `360.00` |
| `paid_at` | TEXT | 收款/结算日期 | `2024-08-01` |
| `period_start`| TEXT | 计费区间开始日期 | `2024-07-01` |
| `period_end` | TEXT | 计费区间结束日期 | `2024-07-31` |
| `meter_last` | REAL | 上次抄表底数 | `150.0` |
| `meter_current`| REAL | 本次抄表底数 | `450.0` |
| `meter_usage` | REAL | 实抄用量 (`meter_current - meter_last`) | `300.0` (度) |
| `unit_price` | REAL | 计费单价 (元/度或吨) | `1.20` |
| `remark` | TEXT | 流水备注 / 支付方式 | `租客微信转账支付` |

---

## 4. 加密凭证与附件表 (`attachments`)
存放租房合同、转账凭证等文件索引，支持 D1 本地强加密 BLOB 与 WebDAV 双轨。

| 字段名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | TEXT (PK) | 凭证唯一编号 | `att_abcdef12` |
| `lease_id` | TEXT (FK) | 关联合同房源 ID | `lse_99887766` |
| `payment_id` | TEXT (FK) | 关联账单流水 ID (可选) | `pay_12345678` |
| `file_name` | TEXT | 原文件名称 | `租房合同原件2024.jpg` |
| `file_size` | INTEGER | 文件字节大小 (Bytes) | `245800` |
| `mime_type` | TEXT | 文件 MIME 类型 | `image/jpeg` |
| `category` | TEXT | 分类 (`CONTRACT`, `RECEIPT`, `HANDOVER`, `OTHER`) | `CONTRACT` |
| `storage_type`| TEXT | 存储渠道 (`D1_LOCAL`: D1加密BLOB, `WEBDAV`: 网盘) | `D1_LOCAL` |
| `data_blob` | TEXT | Base64 编码的 AES-256-GCM 密文 (D1_LOCAL 模式使用) | `密文字符串` |
| `webdav_path` | TEXT | 网盘加密远端相对路径 (WEBDAV 模式使用) | `/RentRecords/att_xxx.enc` |
| `enc_iv` | TEXT | 12 字节随机初始化向量 (Hex) | `3a9b...` |
| `enc_tag` | TEXT | 16 字节认证标签 (Hex) | `f01c...` |

---

## 5. 系统设置表 (`system_settings`)
存放外部异地 WebDAV 等配置。

| 键名 (`key`) | 类型 | 说明 |
| :--- | :--- | :--- |
| `webdav_config` | TEXT | 坚果云或自建 OpenList 的端点、账号、加密凭证等 JSON |

---

## 💡 如何在界面中阅读查看？
无需打开 SQLite 命令行，进入系统后点击右侧/底部 **「系统设置」**，即可在 **「🗄️ D1 数据库透视与数据阅读」** 卡片中点击任意表名即时以表格形式浏览全部行数据，并支持点击 **「📥 导出全量 JSON」** 一键下载备份！
