-- 0006_performance_indices.sql
-- 增加高频排序与按月统计复合索引，消除全表扫描，提升边缘计算毫秒级性能

CREATE INDEX IF NOT EXISTS idx_leases_next_pay ON leases(status, next_pay_date);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_lease_paid ON payments(lease_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachments_storage_type ON attachments(storage_type);
