// types.ts
// 全局类型定义与 Cloudflare Bindings

export interface Env {
  DB: D1Database;
}

export interface User {
  id: string;
  username: string;
  password_hash: string;
  salt: string;
  totp_secret: string;
  totp_enabled: number;
  recovery_codes: string; // JSON array
  recovery_email?: string | null;
  security_question?: string | null;
  security_answer_hash?: string | null;
  security_answer_salt?: string | null;
  created_at?: string;
}

export interface Lease {
  id: string;
  title: string;
  address: string;
  tenant_name?: string | null;
  tenant_phone?: string | null;
  tenant_id_card?: string | null;
  tenant_email?: string | null;
  landlord_name?: string | null;
  landlord_phone?: string | null;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  rent_amount: number;
  pay_cycle_months: number;
  next_pay_date: string | null;
  meter_electric_price?: number;
  meter_water_price?: number;
  meter_electric_base?: number | null;
  meter_water_base?: number | null;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  daysRemaining?: number;
  remainingText?: string;
  isOverdue?: boolean;
  daysToNextPay?: number | null;
  nextPayText?: string | null;
  isPayOverdue?: boolean;
  payOverdueDays?: number;
  unpaidUtilityAmount?: number;
  unpaidUtilityCount?: number;
  attachments?: Attachment[];
}

export interface Payment {
  id: string;
  lease_id: string;
  payment_type: 'RENT' | 'DEPOSIT' | 'WATER' | 'ELECTRICITY' | 'GAS' | 'PROPERTY' | 'OTHER';
  amount: number;
  paid_at: string;
  period_start: string | null;
  period_end: string | null;
  meter_last?: number | null;
  meter_current?: number | null;
  meter_usage?: number | null;
  unit_price?: number | null;
  status?: 'PAID' | 'UNPAID';
  remark: string | null;
  created_at?: string;
  attachments?: Attachment[];
}

export interface NotificationSettings {
  recipientEmail: string;
  mailProvider?: 'smtp' | 'resend';
  resendApiKey?: string;
  resendFromEmail?: string;
  resendFromName?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFromName: string;
  smtpFromEmail: string;
  notifyDaysBefore: string;
  notifyOnDueDay: boolean;
  notifyOnOverdue: boolean;
  templateRentTitle: string;
  templateRentBody: string;
  templateUtilityTitle: string;
  templateUtilityBody: string;
}

export interface Attachment {
  id: string;
  lease_id?: string | null;
  payment_id?: string | null;
  file_name: string;
  file_size: number;
  mime_type: string;
  category: 'CONTRACT' | 'RECEIPT' | 'HANDOVER' | 'OTHER';
  webdav_path?: string | null; // 也作为通用 remote_path
  data_blob?: string | null;
  storage_type?: 'WEBDAV' | 'D1_LOCAL' | 'S3';
  enc_iv: string; // Base64
  enc_tag: string; // Base64
  created_at?: string;
}

export interface WebDavConfig {
  endpoint: string;    // e.g. https://dav.jianguoyun.com/dav/ or https://your-openlist/dav/
  username: string;
  password: string;    // App password
  base_path: string;   // e.g. /RentRecords
  is_enabled: boolean;
}

export interface S3Config {
  endpoint: string;           // e.g. oss-cn-hangzhou.aliyuncs.com, cos.ap-guangzhou.myqcloud.com
  bucket: string;             // e.g. my-renthub-bucket
  region: string;             // e.g. cn-hangzhou, ap-guangzhou, auto
  access_key_id: string;
  secret_access_key: string;
  base_path?: string;         // e.g. /RentHubFiles
  is_enabled: boolean;
}

export interface SessionPayload {
  uid: string;
  usr: string;
  exp: number; // Unix timestamp in seconds
  stage: 'FULL' | 'AWAITING_2FA' | 'RESET_PASSWORD';
}
