-- 0004_notifications_and_unpaid_status.sql
-- 增加 payments 结算状态 (PAID 已结清 / UNPAID 待缴欠费)、leases 租客通知邮箱

ALTER TABLE payments ADD COLUMN status TEXT DEFAULT 'PAID';
ALTER TABLE leases ADD COLUMN tenant_email TEXT;
