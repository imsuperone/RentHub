-- 0002_enhance_landlord.sql
-- 针对房东出租场景与精细化水电表计费、租客信息扩展

ALTER TABLE leases ADD COLUMN tenant_name TEXT;
ALTER TABLE leases ADD COLUMN tenant_phone TEXT;
ALTER TABLE leases ADD COLUMN tenant_id_card TEXT;

ALTER TABLE payments ADD COLUMN meter_last REAL;
ALTER TABLE payments ADD COLUMN meter_current REAL;
ALTER TABLE payments ADD COLUMN meter_usage REAL;
ALTER TABLE payments ADD COLUMN unit_price REAL;
