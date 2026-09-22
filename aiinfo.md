# 房东管家 (zufangwoker) - 系统架构与开发技术全景文档 (aiinfo)

## 一、 系统技术架构与运行时
- **核心框架**：Hono 驱动的 Cloudflare Worker 无服务器架构；
- **运行时环境**：纯 Cloudflare Edge V8 Isolates（零 Node 原生二进制与 Native Sockets 依赖，完全兼容 Cloudflare 生产环境一键部署）；
- **邮件服务协议**：基于 `cloudflare:sockets` 专有实现的零依赖边缘 SMTP 引擎（`src/utils/smtp.ts`），支持 SSL/TLS（端口 465）、STARTTLS（端口 587）及明文传输，内置 RFC 2822 报文封装与 RFC 2047 标题编码；
- **数据持久化**：Cloudflare D1 (Serverless SQLite) 强一致性关系型数据库；
- **文件与凭据存储**：客户端 AES-256-GCM 本地加密 + WebDAV 远程多端同步备份。

---

## 二、 数据库结构详解 (Migrations 0001 ~ 0005)

### 1. `users` (管理员身份与安全凭据表)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | TEXT PRIMARY KEY | 用户唯一 ID (`usr_...`) |
| `username` | TEXT UNIQUE NOT NULL | 管理员用户名 |
| `password_hash` | TEXT NOT NULL | PBKDF2-SHA256 (100,000次迭代) 强哈希 |
| `salt` | TEXT NOT NULL | 密码独立 16 字节随机 Salt (十六进制) |
| `totp_secret` | TEXT NOT NULL | 2FA Base32 密钥 |
| `totp_enabled` | INTEGER DEFAULT 0 | 是否开启 2FA (1 为开启，0 为未激活) |
| `recovery_codes` | TEXT | 8 组紧急备用恢复码 (JSON 数组) |
| `recovery_email` | TEXT | 安全找回邮箱 |
| `security_question` | TEXT | 安全密保问题题目 |
| `security_answer_hash`| TEXT | 密保答案加盐 PBKDF2-SHA256 哈希 |
| `security_answer_salt`| TEXT | 密保答案独立随机 Salt (十六进制) |
| `created_at` | TEXT | 创建时间 |

### 2. `leases` (房源与租约主表)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | TEXT PRIMARY KEY | 房源唯一 ID (`lse_...`) |
| `title` | TEXT NOT NULL | 房源名称 (如: 望京SOHO 2号楼233室) |
| `address` | TEXT NOT NULL | 房源地址 |
| `tenant_name` | TEXT | 承租人姓名 |
| `tenant_phone` | TEXT | 承租人联系电话 |
| `tenant_email` | TEXT | 承租人接收账单邮箱 |
| `start_date` | TEXT NOT NULL | 起租日期 (`YYYY-MM-DD`) |
| `end_date` | TEXT NOT NULL | 到期日期 (`YYYY-MM-DD`) |
| `deposit_amount` | REAL | 押金金额 |
| `rent_amount` | REAL NOT NULL | 月租金 |
| `pay_cycle_months`| INTEGER | 交租周期 (12=年付, 6=半年付, 3=季付, 1=月付) |
| `next_pay_date` | TEXT | 下次收租日 (支持智能校准至到期下一年) |
| `meter_electric_price` | REAL | 预设电费单价 (元/度) |
| `meter_water_price` | REAL | 预设水费单价 (元/吨) |
| `meter_electric_base` | REAL | 起租/最新电表底数 (自动滚存) |
| `meter_water_base` | REAL | 起租/最新水表底数 (自动滚存) |
| `status` | TEXT | 租约状态 (`ACTIVE`, `EXPIRED`, `TERMINATED`) |
| `notes` | TEXT | 备注信息 |

### 3. `payments` (收租与水电费流水表)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | TEXT PRIMARY KEY | 流水 ID (`pmt_...`) |
| `lease_id` | TEXT NOT NULL | 关联房源 ID |
| `payment_type` | TEXT NOT NULL | 类型 (`RENT`, `ELECTRICITY`, `WATER`, `DEPOSIT`, `OTHER`) |
| `amount` | REAL NOT NULL | 账单金额 (押金退款为负数) |
| `paid_at` | TEXT NOT NULL | 发生/实收日期 |
| `status` | TEXT DEFAULT 'PAID' | 缴费状态：`PAID` (已结清) 或 `UNPAID` (待缴欠款) |
| `meter_last` | REAL | 抄表起数 |
| `meter_current` | REAL | 抄表止数 |
| `meter_usage` | REAL | 本期用量 |
| `unit_price` | REAL | 本期单价 |
| `remark` | TEXT | 流水备注 |

### 4. `attachments` (加密凭据与原件凭证表)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | TEXT PRIMARY KEY | 凭据唯一 ID (`att_...`) |
| `lease_id` | TEXT NOT NULL | 关联房源 ID |
| `payment_id` | TEXT | 关联流水 ID (支持收租与抄表凭据直接绑定，可为空) |
| `category` | TEXT | 凭据分类 (`CONTRACT`, `ID_CARD`, `RECEIPT`, `OTHER`) |
| `file_name` | TEXT NOT NULL | 原始文件名 |
| `file_path` | TEXT NOT NULL | 本地加密存储哈希路径 |
| `content_type` | TEXT | MIME 类型 (图片/PDF等) |
| `file_size` | INTEGER | 文件大小 (字节) |
| `created_at` | TEXT | 上传时间 |

### 5. `system_settings` (系统级键值配置表)
存储初始化状态 (`init_completed`)、WebDAV 备份配置以及纯房东 SMTP 待收提醒引擎参数：
- `notify_recipient_email`：房东接收告警邮箱 / 安全收件邮箱
- `notify_smtp_host`：SMTP 服务器地址 (如 `smtp.qq.com`)
- `notify_smtp_port`：SMTP 端口 (465 或 587)
- `notify_smtp_secure`：是否开启 SSL/TLS 加密 (`true`/`false`)
- `notify_smtp_user`：SMTP 登录用户名
- `notify_smtp_pass`：SMTP 授权密码 (后台安全掩码脱敏)
- `notify_smtp_from_name`：发件人展示名称
- `notify_smtp_from_email`：发信邮箱地址
- `notify_days_before`：提前催收天数 (如 `7,3,1`)
- `notify_on_due_day` / `notify_on_overdue`：当天与超期提醒开关
- `notify_template_rent_*` / `notify_template_utility_*`：自定义中文通知模板
- `init_temp_verify_code` / `pwd_reset_code_*` / `recovery_fail_count_*`：重置与验证临时安全凭证

---

## 三、 防攻破与防撞库安全防御机制

1. **防爆破锁定机制**：
   - 找回密码验证时，每次失败记录尝试次数；
   - 15 分钟内连续 5 次错误验证，账号触发临时安全锁定，阻断字典攻击与撞库。
2. **防时序侧信道攻击 (Anti-Timing Attack)**：
   - 查询不存在的账号时，执行恒定耗时假哈希操作，保证响应延迟与真实账号一致，杜绝用户名枚举。
3. **密保答案单向加盐强哈希**：
   - 密保答案经过标准化预处理（去除前后空格并转小写），采用独立随机 Salt 经由 PBKDF2-SHA256 (100,000 次计算) 进行单向哈希，即便数据库泄露也无法还原真实密保答案。
4. **单次销毁防重放**：
   - 8 组紧急恢复码在用于找回密码或 2FA 登录后，立即从数据库数组中彻底物理删除，无法二次重复利用。
5. **短效防篡改签名 Token 状态闭环**：
   - 校验通过后签发包含 `stage: 'RESET_PASSWORD'` 的短效 HMAC-SHA256 签名 Token（有效期仅 3 分钟）；
   - `/api/auth/reset-password` 严格校验此签名，非法调用或篡改均被直接拒绝。

---

## 四、 核心 API 路由全景

### 1. 认证与密码找回公开接口 (白名单)
- `GET /api/auth/status`：查询系统是否已初始化及 2FA 状态
- `POST /api/auth/init`：首次初始化主管理员与安全凭据
- `POST /api/auth/send-init-verify`：初始化通过用户 SMTP 服务器实机发送安全邮箱测试验证码
- `POST /api/auth/confirm-init-verify`：初始化核验安全邮箱测试验证码
- `GET /api/auth/recovery-options?username=...`：查询账号支持的找回通道 (脱敏保护)
- `POST /api/auth/send-recovery-email`：向绑定安全邮箱发送重置验证码
- `POST /api/auth/verify-recovery`：校验密保答案/备用码/邮箱验证码，签发 Reset Token
- `POST /api/auth/reset-password`：使用合法 Reset Token 正式更新主密码
- `POST /api/auth/login-step1` / `POST /api/auth/login-step2`：主密码与 2FA 登录

### 2. 业务管理受保护接口 (需 FULL 会话)
- `/api/leases`：房源与租约增删改查
- `/api/payments`：收租流水与抄表记账（`paid_at` 支持秒级 `YYYY-MM-DD HH:mm:ss`）
- `/api/payments/:id/settle`：一键结清水电欠费账单
- `/api/attachments`：凭证查询列表与上传（支持 D1 本地与 WebDAV 加密）
- `/api/attachments/bind`：将已有内置凭据复用绑定至指定房源或收租/水电账单（多账单复用克隆引用机制）
- `/api/attachments/unbind`：解绑凭据与特定账单/房源的关联
- `/api/attachments/:id` (DELETE)：彻底删除凭据原件（**与业务台账解耦：严格只删附件，绝不级联误删流水与房源**）
- `/api/notifications/settings`：通知与 SMTP 配置存取（密码自动脱敏）
- `/api/notifications/send-test`：通过配置的 SMTP 发送测试邮件
- `/api/notifications/trigger-check`：立即执行全量账单巡检与派发
- `/api/database/inspect` / `/api/database/dump`：数据库透视与备份

---

## 五、 凭据解耦与日期精度设计规范

1. **凭证与财务流水绝对解耦安全规范**：
   - 凭据物理删除操作由 `DELETE FROM attachments WHERE id = ?` 承接，`payments` 与 `leases` 表完全无反向级联依赖，删除凭据绝不会造成财务流水丢失；
   - 删除凭证后，前端与后端即时联动清理关联映射，流水卡片上的凭据缩略图自动隐退，不留任何死链或界面报错；
   - WebDAV 多引用保护机制：若同份加密文件被多条引用记录复用，仅当引用计数清零时才会触发远端 WebDAV 物理文件删除。
2. **日期时间精度分级规范**：
   - **记账实收时间 (`paid_at`)**：标准格式为 `YYYY-MM-DD HH:mm:ss`（年月日 时:分:秒），精确记录交易发生瞬间；
   - **业务周期与截止日 (`start_date`, `end_date`, `next_pay_date`, `period_start`, `period_end`)**：标准格式为 `YYYY-MM-DD`（年月日），严格到日，杜绝时分秒偏移导致账期错乱。
