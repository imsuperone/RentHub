// src/modules/leases/index.ts
// 租房合约管理业务模块 (支持多房管理、水电初始底数与单价配置)

import { Env, Lease, Attachment } from '../../types';
import { generateRandomHex } from '../../utils/crypto';
import { jsonOk, jsonError } from '../../utils/response';

function parseYear(dateStr: string): number {
  const parts = dateStr.split('-');
  return parseInt(parts[0], 10);
}

function calculateRemainingInfo(endDateStr: string, status: string): { daysRemaining: number; remainingText: string; isOverdue: boolean } {
  const now = new Date();
  const end = new Date(endDateStr);
  
  if (isNaN(end.getTime()) || parseYear(endDateStr) < 2000) {
    return { daysRemaining: 0, remainingText: '日期待修正', isOverdue: false };
  }

  const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endZero = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  const diffDays = Math.round((endZero - todayZero) / (1000 * 60 * 60 * 24));

  let text = '';
  let isOverdue = false;

  if (status === 'TERMINATED') {
    text = '已退租结清';
  } else if (status === 'EXPIRED') {
    text = '已到期归档';
  } else if (diffDays > 0) {
    text = `剩余 ${diffDays} 天`;
  } else if (diffDays === 0) {
    text = '今日到期';
  } else {
    text = `已超期 ${Math.abs(diffDays)} 天`;
    isOverdue = true;
  }

  return { daysRemaining: diffDays, remainingText: text, isOverdue };
}

function calculatePayRemainingInfo(nextPayDateStr: string | null | undefined, status: string): {
  daysToNextPay: number | null;
  nextPayText: string | null;
  isPayOverdue: boolean;
  payOverdueDays: number;
} {
  if (status === 'TERMINATED' || !nextPayDateStr) {
    return { daysToNextPay: null, nextPayText: null, isPayOverdue: false, payOverdueDays: 0 };
  }
  const now = new Date();
  const nextPay = new Date(nextPayDateStr);
  if (isNaN(nextPay.getTime()) || parseYear(nextPayDateStr) < 2000) {
    return { daysToNextPay: null, nextPayText: '日期待设', isPayOverdue: false, payOverdueDays: 0 };
  }
  const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const payZero = new Date(nextPay.getFullYear(), nextPay.getMonth(), nextPay.getDate()).getTime();
  const daysToNextPay = Math.round((payZero - todayZero) / (1000 * 60 * 60 * 24));

  if (daysToNextPay < 0) {
    const overdueDays = Math.abs(daysToNextPay);
    return {
      daysToNextPay,
      nextPayText: `收租超期 ${overdueDays} 天`,
      isPayOverdue: true,
      payOverdueDays: overdueDays,
    };
  } else if (daysToNextPay === 0) {
    return {
      daysToNextPay: 0,
      nextPayText: '今日应收租',
      isPayOverdue: false,
      payOverdueDays: 0,
    };
  } else {
    return {
      daysToNextPay,
      nextPayText: `距收租 ${daysToNextPay} 天`,
      isPayOverdue: false,
      payOverdueDays: 0,
    };
  }
}

let hasEnsuredCustomId = false;
async function ensureLeaseCustomIdColumn(env: Env) {
  if (hasEnsuredCustomId) return;
  try {
    await env.DB.prepare('ALTER TABLE leases ADD COLUMN custom_id TEXT').run();
  } catch {}
  hasEnsuredCustomId = true;
}

export async function handleListLeases(env: Env) {
  await ensureLeaseCustomIdColumn(env);

  const result = await env.DB.prepare(
    'SELECT * FROM leases ORDER BY status ASC, end_date ASC'
  ).all();

  const attachmentsRes = await env.DB.prepare(
    'SELECT id, lease_id, file_name, file_size, category, storage_type, created_at FROM attachments WHERE lease_id IS NOT NULL ORDER BY created_at DESC'
  ).all();

  const unpaidRes = await env.DB.prepare(
    `SELECT lease_id, payment_type, SUM(amount) as total_unpaid, COUNT(*) as unpaid_count 
     FROM payments 
     WHERE status = 'UNPAID' 
     GROUP BY lease_id, payment_type`
  ).all();

  const unpaidMap = new Map<string, { rentAmount: number; rentCount: number; utilityAmount: number; utilityCount: number }>();
  for (const row of unpaidRes.results as any[]) {
    if (!unpaidMap.has(row.lease_id)) {
      unpaidMap.set(row.lease_id, { rentAmount: 0, rentCount: 0, utilityAmount: 0, utilityCount: 0 });
    }
    const item = unpaidMap.get(row.lease_id)!;
    const amt = Number(row.total_unpaid) || 0;
    const cnt = Number(row.unpaid_count) || 0;
    if (row.payment_type === 'RENT') {
      item.rentAmount += amt;
      item.rentCount += cnt;
    } else {
      item.utilityAmount += amt;
      item.utilityCount += cnt;
    }
  }

  // 查询各房源最新的房租账单记录，以便获取当前租金结清状态
  const latestRentRes = await env.DB.prepare(
    `SELECT id, lease_id, status FROM payments WHERE payment_type = 'RENT' ORDER BY paid_at DESC, created_at DESC`
  ).all();
  const latestRentMap = new Map<string, { id: string; status: 'PAID' | 'UNPAID' }>();
  for (const p of latestRentRes.results as any[]) {
    if (!latestRentMap.has(p.lease_id)) {
      latestRentMap.set(p.lease_id, { id: p.id, status: p.status || 'PAID' });
    }
  }

  const attachmentsByLease = new Map<string, Attachment[]>();
  for (const att of attachmentsRes.results as unknown as Attachment[]) {
    if (att.lease_id) {
      if (!attachmentsByLease.has(att.lease_id)) {
        attachmentsByLease.set(att.lease_id, []);
      }
      attachmentsByLease.get(att.lease_id)!.push(att);
    }
  }

  const leasesWithMeta = (result.results as unknown as Lease[]).map((lease) => {
    const { daysRemaining, remainingText, isOverdue } = calculateRemainingInfo(lease.end_date, lease.status);
    const { daysToNextPay, nextPayText, isPayOverdue, payOverdueDays } = calculatePayRemainingInfo(lease.next_pay_date, lease.status);
    const isPrepaidBeyond = !!(lease.next_pay_date && lease.end_date && lease.next_pay_date > lease.end_date);
    const unpaid = unpaidMap.get(lease.id) || { rentAmount: 0, rentCount: 0, utilityAmount: 0, utilityCount: 0 };
    const latestRent = latestRentMap.get(lease.id);

    return {
      ...lease,
      daysRemaining,
      remainingText,
      isOverdue,
      daysToNextPay,
      nextPayText,
      isPayOverdue,
      payOverdueDays,
      isPrepaidBeyond,
      unpaidRentAmount: unpaid.rentAmount,
      unpaidRentCount: unpaid.rentCount,
      unpaidUtilityAmount: unpaid.utilityAmount,
      unpaidUtilityCount: unpaid.utilityCount,
      totalUnpaidAmount: unpaid.rentAmount + unpaid.utilityAmount,
      currentRentStatus: latestRent ? latestRent.status : null,
      currentRentPaymentId: latestRent ? latestRent.id : null,
      attachments: attachmentsByLease.get(lease.id) || [],
    };
  });

  return jsonOk(leasesWithMeta);
}

export async function handleGetLease(env: Env, id: string) {
  await ensureLeaseCustomIdColumn(env);

  const lease = (await env.DB.prepare('SELECT * FROM leases WHERE id = ?').bind(id).first()) as Lease | null;
  if (!lease) {
    return jsonError('房源不存在', 404, 404);
  }

  const payments = await env.DB.prepare(
    'SELECT * FROM payments WHERE lease_id = ? ORDER BY paid_at DESC'
  ).bind(id).all();

  const attachments = await env.DB.prepare(
    'SELECT id, file_name, file_size, mime_type, category, storage_type, created_at FROM attachments WHERE lease_id = ? ORDER BY created_at DESC'
  ).bind(id).all();

  const unpaidRows = await env.DB.prepare(
    `SELECT payment_type, SUM(amount) as total_unpaid, COUNT(*) as unpaid_count 
     FROM payments 
     WHERE lease_id = ? AND status = 'UNPAID'
     GROUP BY payment_type`
  ).bind(id).all();

  let unpaidRentAmount = 0;
  let unpaidRentCount = 0;
  let unpaidUtilityAmount = 0;
  let unpaidUtilityCount = 0;
  for (const row of unpaidRows.results as any[]) {
    const amt = Number(row.total_unpaid) || 0;
    const cnt = Number(row.unpaid_count) || 0;
    if (row.payment_type === 'RENT') {
      unpaidRentAmount += amt;
      unpaidRentCount += cnt;
    } else {
      unpaidUtilityAmount += amt;
      unpaidUtilityCount += cnt;
    }
  }

  const latestRentPayment = (await env.DB.prepare(
    `SELECT id, status FROM payments WHERE lease_id = ? AND payment_type = 'RENT' ORDER BY paid_at DESC, created_at DESC LIMIT 1`
  ).bind(id).first()) as any;

  const { daysRemaining, remainingText, isOverdue } = calculateRemainingInfo(lease.end_date, lease.status);
  const { daysToNextPay, nextPayText, isPayOverdue, payOverdueDays } = calculatePayRemainingInfo(lease.next_pay_date, lease.status);
  const isPrepaidBeyond = !!(lease.next_pay_date && lease.end_date && lease.next_pay_date > lease.end_date);

  return jsonOk({
    lease: {
      ...lease,
      daysRemaining,
      remainingText,
      isOverdue,
      daysToNextPay,
      nextPayText,
      isPayOverdue,
      payOverdueDays,
      isPrepaidBeyond,
      unpaidRentAmount,
      unpaidRentCount,
      unpaidUtilityAmount,
      unpaidUtilityCount,
      totalUnpaidAmount: unpaidRentAmount + unpaidUtilityAmount,
      currentRentStatus: latestRentPayment ? latestRentPayment.status : null,
      currentRentPaymentId: latestRentPayment ? latestRentPayment.id : null,
    },
    payments: payments.results,
    attachments: attachments.results,
  });
}

export async function handleCreateLease(env: Env, body: any) {
  await ensureLeaseCustomIdColumn(env);

  const {
    custom_id,
    title,
    address,
    tenant_name,
    tenant_phone,
    tenant_id_card,
    tenant_email,
    start_date,
    end_date,
    deposit_amount,
    rent_amount,
    pay_cycle_months,
    next_pay_date,
    meter_electric_price,
    meter_water_price,
    meter_electric_base,
    meter_water_base,
    notes,
  } = body;

  const finalTitle = (title || '').trim();
  const finalAddress = (address || finalTitle).trim();

  if (!finalTitle || !finalAddress || !start_date || !end_date || rent_amount === undefined) {
    return jsonError('请填写房源名称、起止日期与月租金', 400);
  }

  const startYear = parseYear(start_date);
  const endYear = parseYear(end_date);
  if (startYear < 2000 || startYear > 2099 || endYear < 2000 || endYear > 2099) {
    return jsonError('日期年份有误，请选择 2000-2099 年之间的有效日期', 400);
  }

  if (end_date < start_date) {
    return jsonError('合同到期日不能早于起租日期', 400);
  }

  let finalCustomId = custom_id ? String(custom_id).trim().toUpperCase().slice(0, 8) : '';
  if (!finalCustomId) {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    for (let i = 0; i < 6; i++) {
      finalCustomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  const id = 'lse_' + generateRandomHex(8);
  await env.DB.prepare(
    `INSERT INTO leases (
      id, custom_id, title, address, tenant_name, tenant_phone, tenant_id_card, tenant_email,
      start_date, end_date, deposit_amount, rent_amount,
      pay_cycle_months, next_pay_date,
      meter_electric_price, meter_water_price, meter_electric_base, meter_water_base,
      status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`
  )
    .bind(
      id,
      finalCustomId,
      finalTitle,
      finalAddress,
      tenant_name ? tenant_name.trim() : null,
      tenant_phone ? tenant_phone.trim() : null,
      tenant_id_card ? tenant_id_card.trim() : null,
      tenant_email ? tenant_email.trim() : null,
      start_date,
      end_date,
      Number(deposit_amount) || 0,
      Number(rent_amount) || 0,
      Number(pay_cycle_months) || 1,
      next_pay_date || null,
      meter_electric_price ? Number(meter_electric_price) : 1.0,
      meter_water_price ? Number(meter_water_price) : 3.5,
      meter_electric_base ? Number(meter_electric_base) : null,
      meter_water_base ? Number(meter_water_base) : null,
      notes ? notes.trim() : null
    )
    .run();

  if (body.create_initial_bill) {
    const pmtId = 'pmt_' + generateRandomHex(8);
    const cycleMonths = Number(pay_cycle_months) || 1;
    const initialAmount = (Number(rent_amount) || 0) * (cycleMonths > 1 ? cycleMonths : 1);
    const initialStatus = body.initial_bill_status === 'UNPAID' ? 'UNPAID' : 'PAID';
    const cycleName = cycleMonths === 24 ? '两年付' : cycleMonths === 12 ? '年付' : cycleMonths === 6 ? '半年付' : cycleMonths === 3 ? '季付' : '月付';
    await env.DB.prepare(
      `INSERT INTO payments (
        id, lease_id, payment_type, amount, paid_at,
        period_start, period_end, status, remark
      ) VALUES (?, ?, 'RENT', ?, ?, ?, ?, ?, ?)`
    ).bind(
      pmtId,
      id,
      initialAmount,
      start_date,
      start_date,
      next_pay_date || end_date,
      initialStatus,
      `首期房租 (${cycleName} · 建档自动生成)`
    ).run();
  }

  return jsonOk({ id, custom_id: finalCustomId }, '房源添加成功');
}

export async function handleUpdateLease(env: Env, id: string, body: any) {
  await ensureLeaseCustomIdColumn(env);

  const existing = await env.DB.prepare('SELECT id, custom_id FROM leases WHERE id = ?').bind(id).first();
  if (!existing) {
    return jsonError('房源不存在', 404, 404);
  }

  const {
    custom_id,
    title,
    address,
    tenant_name,
    tenant_phone,
    tenant_id_card,
    tenant_email,
    start_date,
    end_date,
    deposit_amount,
    rent_amount,
    pay_cycle_months,
    next_pay_date,
    meter_electric_price,
    meter_water_price,
    meter_electric_base,
    meter_water_base,
    status,
    notes,
    update_current_rent_status,
    current_rent_payment_id
  } = body;

  const startYear = parseYear(start_date);
  const endYear = parseYear(end_date);
  if (startYear < 2000 || startYear > 2099 || endYear < 2000 || endYear > 2099) {
    return jsonError('年份必须在 2000 年至 2099 年之间', 400);
  }

  const finalCustomId = custom_id !== undefined ? (custom_id ? String(custom_id).trim().toUpperCase().slice(0, 8) : null) : (existing.custom_id as string || null);

  await env.DB.prepare(
    `UPDATE leases SET
      custom_id = ?,
      title = ?, address = ?, tenant_name = ?, tenant_phone = ?, tenant_id_card = ?, tenant_email = ?,
      start_date = ?, end_date = ?, deposit_amount = ?, rent_amount = ?,
      pay_cycle_months = ?, next_pay_date = ?,
      meter_electric_price = ?, meter_water_price = ?, meter_electric_base = ?, meter_water_base = ?,
      status = ?, notes = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(
      finalCustomId,
      title,
      address,
      tenant_name || null,
      tenant_phone || null,
      tenant_id_card || null,
      tenant_email || null,
      start_date,
      end_date,
      Number(deposit_amount) || 0,
      Number(rent_amount) || 0,
      Number(pay_cycle_months) || 3,
      next_pay_date || null,
      meter_electric_price ? Number(meter_electric_price) : 1.0,
      meter_water_price ? Number(meter_water_price) : 3.0,
      meter_electric_base ? Number(meter_electric_base) : null,
      meter_water_base ? Number(meter_water_base) : null,
      status || 'ACTIVE',
      notes || null,
      id
    )
    .run();

  // 快捷在房源修改弹窗中联动修改当期房租的支付状态 (已付款结清 vs 待付款未结清)
  if (update_current_rent_status === 'PAID' || update_current_rent_status === 'UNPAID') {
    if (current_rent_payment_id) {
      await env.DB.prepare('UPDATE payments SET status = ? WHERE id = ?')
        .bind(update_current_rent_status, current_rent_payment_id)
        .run();
    } else {
      const pmt = (await env.DB.prepare(
        "SELECT id FROM payments WHERE lease_id = ? AND payment_type = 'RENT' ORDER BY paid_at DESC, created_at DESC LIMIT 1"
      ).bind(id).first()) as any;
      if (pmt) {
        await env.DB.prepare('UPDATE payments SET status = ? WHERE id = ?')
          .bind(update_current_rent_status, pmt.id)
          .run();
      }
    }
  }

  return jsonOk({ id, custom_id: finalCustomId }, '房源信息已保存');
}

export async function handleDeleteLease(env: Env, id: string) {
  // 原子事务：级联删除属于该房源的记账记录，并解绑关联文件（保持文件中心原件完好）
  await env.DB.batch([
    env.DB.prepare('DELETE FROM payments WHERE lease_id = ?').bind(id),
    env.DB.prepare('UPDATE attachments SET lease_id = NULL WHERE lease_id = ?').bind(id),
    env.DB.prepare('DELETE FROM leases WHERE id = ?').bind(id),
  ]);
  return jsonOk({ id }, '房源及关联记账已安全删除');
}
