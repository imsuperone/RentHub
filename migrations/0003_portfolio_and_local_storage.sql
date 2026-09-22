-- 0003_portfolio_and_local_storage.sql
-- 增加本地 D1 加密兜底存储、房源初始电表水表单价与底数字段

ALTER TABLE leases ADD COLUMN meter_electric_price REAL DEFAULT 1.0;
ALTER TABLE leases ADD COLUMN meter_water_price REAL DEFAULT 3.0;
ALTER TABLE leases ADD COLUMN meter_electric_base REAL;
ALTER TABLE leases ADD COLUMN meter_water_base REAL;

ALTER TABLE attachments ADD COLUMN data_blob TEXT;
ALTER TABLE attachments ADD COLUMN storage_type TEXT DEFAULT 'WEBDAV';
