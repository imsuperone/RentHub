-- RentHub (房东管家) 数据库全量结构初始化脚本
-- 适用平台: Cloudflare D1 (基于 SQLite)
-- 执行命令: npx wrangler d1 execute <database_name> --file=./schema.sql

-- 1. 用户与认证表 (主密码 PBKDF2 强哈希 + TOTP 2FA + 密保找回体系)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    totp_secret TEXT NOT NULL,
    totp_enabled INTEGER DEFAULT 0,
    recovery_codes TEXT,
    recovery_email TEXT,
    security_question TEXT,
    security_answer_hash TEXT,
    security_answer_salt TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 2. 出租房源与合同管理表 (涵盖租金周期、下次交租日、水表电表底数与单价)
CREATE TABLE IF NOT EXISTS leases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    tenant_name TEXT,
    tenant_phone TEXT,
    tenant_id_card TEXT,
    tenant_email TEXT,
    landlord_name TEXT,
    landlord_phone TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    deposit_amount REAL DEFAULT 0,
    rent_amount REAL NOT NULL,
    pay_cycle_months INTEGER DEFAULT 1,
    next_pay_date TEXT,
    meter_electric_price REAL DEFAULT 1.0,
    meter_water_price REAL DEFAULT 3.0,
    meter_electric_base REAL,
    meter_water_base REAL,
    status TEXT DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 3. 台账与收支流水记录表 (房租收取、水电燃气抄表核销、押金管理、结算状态)
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    lease_id TEXT NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    payment_type TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'PAID',
    paid_at TEXT NOT NULL,
    period_start TEXT,
    period_end TEXT,
    meter_last REAL,
    meter_current REAL,
    meter_usage REAL,
    unit_price REAL,
    remark TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 4. 文件与单据附件表 (AES-256-GCM 端到端加密；三轨自由存储：本地 D1、WebDAV、S3 对象存储)
CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    lease_id TEXT REFERENCES leases(id) ON DELETE CASCADE,
    payment_id TEXT REFERENCES payments(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    category TEXT NOT NULL,
    webdav_path TEXT,
    data_blob TEXT,
    storage_type TEXT DEFAULT 'D1_LOCAL',
    enc_iv TEXT NOT NULL,
    enc_tag TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 5. 系统全局设置表 (多渠道网盘配置、S3 对象存储参数、SMTP 邮件服务、默认存储渠道)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 常用高频索引 (极致优化 Worker 边缘冷启动与 D1 读取性能)
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_payments_lease_id ON payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_attachments_lease_id ON attachments(lease_id);
CREATE INDEX IF NOT EXISTS idx_attachments_payment_id ON attachments(payment_id);
CREATE INDEX IF NOT EXISTS idx_attachments_storage_type ON attachments(storage_type);
