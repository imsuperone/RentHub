-- 0001_init.sql
-- 房屋管理系统 (zufangwoker) 数据库初始化表结构

-- 1. 用户与认证表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    totp_secret TEXT NOT NULL,
    totp_enabled INTEGER DEFAULT 1,
    recovery_codes TEXT,
    recovery_email TEXT,
    security_question TEXT,
    security_answer_hash TEXT,
    security_answer_salt TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 2. 租房记录表
CREATE TABLE IF NOT EXISTS leases (
    id TEXT PRIMARY KEY,
    custom_id TEXT,
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
    pay_cycle_months INTEGER DEFAULT 3,
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

-- 3. 账单与交费/续费记录表 (含水电表计量与单价)
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

-- 4. 加密凭证与附件表 (支持 D1 本地与 WebDAV 双轨加密)
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
    storage_type TEXT DEFAULT 'WEBDAV',
    enc_iv TEXT NOT NULL,
    enc_tag TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 5. 系统设置表 (存 WebDAV 配置等)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 创建常用查询索引，减少 D1 读取消耗
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_payments_lease_id ON payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_attachments_lease_id ON attachments(lease_id);
CREATE INDEX IF NOT EXISTS idx_attachments_payment_id ON attachments(payment_id);
