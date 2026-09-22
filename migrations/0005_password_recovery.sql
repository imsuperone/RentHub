-- 0005_password_recovery.sql
-- 支持管理员忘记密码找回与首次初始化安全凭证配置

ALTER TABLE users ADD COLUMN recovery_email TEXT;
ALTER TABLE users ADD COLUMN security_question TEXT;
ALTER TABLE users ADD COLUMN security_answer_hash TEXT;
ALTER TABLE users ADD COLUMN security_answer_salt TEXT;
