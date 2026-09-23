// src/modules/payments/index.ts
// 房租、押金与水电杂费记账管理 (支持电表水表抄表算费)

import { Env } from '../../types';
import { generateRandomHex } from '../../utils/crypto';
import { jsonOk, jsonError } from '../../utils/response';

export async function handleListPayments(env: Env, leaseId?: string) {
  let query = 'SELECT p.*, l.title as lease_title, l.custom_id as lease_custom_id, l.tenant_name FROM payments p LEFT JOIN leases l ON p.lease_id = l.id';
  let params: any[] = [];

  if (leaseId) {
    query += ' WHERE p.lease_id = ?';
    params.push(leaseId);
  }

  query += ' ORDER BY p.paid_at DESC LIMIT 500';

  const stmt = env.DB.prepare(query);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

  // 聚合查询关联的付款凭据附件
  try {
    const attachmentsRes = await env.DB.prepare(
      'SELECT id, lease_id, payment_id, file_name, file_size, category, storage_type, created_at FROM attachments WHERE payment_id IS NOT NULL ORDER BY created_at DESC'
    ).all();
    const attachmentsByPayment = new Map<string, any[]>();
    for (const att of attachmentsRes.results as any[]) {
      if (att.payment_id) {
        if (!attachmentsByPayment.has(att.payment_id)) {
          attachmentsByPayment.set(att.payment_id, []);
        }
        attachmentsByPayment.get(att.payment_id)!.push(att);
      }
    }
    const enriched = (result.results as any[]).map((p) => ({
      ...p,
      attachments: attachmentsByPayment.get(p.id) || [],
    }));
    return jsonOk(enriched);
  } catch (_) {
    return jsonOk(result.results);
  }
}

export async function handleCreatePayment(env: Env, body: any) {
  const {
    lease_id,
    payment_type,
    amount,
    paid_at,
    period_start,
    period_end,
    meter_last,
    meter_current,
    meter_usage,
    unit_price,
    status,
    remark,
    next_pay_date,
  } = body;

  if (!lease_id || !payment_type || amount === undefined || !paid_at) {
    return jsonError('请选择房源并填写金额与日期', 400);
  }

  const id = 'pmt_' + generateRandomHex(8);
  const paymentStatus = status === 'UNPAID' ? 'UNPAID' : 'PAID';

  const insertStmt = env.DB.prepare(
    `INSERT INTO payments (
      id, lease_id, payment_type, amount, paid_at,
      period_start, period_end,
      meter_last, meter_current, meter_usage, unit_price,
      status, remark
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    lease_id,
    payment_type,
    Number(amount),
    paid_at,
    period_start || null,
    period_end || null,
    meter_last !== undefined && meter_last !== '' ? Number(meter_last) : null,
    meter_current !== undefined && meter_current !== '' ? Number(meter_current) : null,
    meter_usage !== undefined && meter_usage !== '' ? Number(meter_usage) : null,
    unit_price !== undefined && unit_price !== '' ? Number(unit_price) : null,
    paymentStatus,
    remark ? remark.trim() : null
  );

  const batchStmts = [insertStmt];

  // 如果传入了新的下次交租日期，原子同步更新租约：
  // 1. 同步更新下次收租日
  // 2. 若下次收租日已超过原合同到期日，自动将合同到期日顺延至下次交租日，彻底避免收租后出现“合同超期/到期”的逻辑冲突
  // 3. 将房源状态确保恢复为 ACTIVE (在租)
  if (next_pay_date) {
    batchStmts.push(
      env.DB.prepare(
        `UPDATE leases 
         SET next_pay_date = ?,
             end_date = CASE WHEN end_date < ? THEN ? ELSE end_date END,
             status = CASE WHEN status = 'TERMINATED' THEN 'TERMINATED' ELSE 'ACTIVE' END,
             updated_at = datetime('now')
         WHERE id = ?`
      ).bind(next_pay_date, next_pay_date, next_pay_date, lease_id)
    );
  }

  // 抄表底数原子滚存为房源的最新底数，下次抄表直接带出
  if (payment_type === 'ELECTRICITY' && meter_current !== undefined && meter_current !== '' && meter_current !== null) {
    batchStmts.push(
      env.DB.prepare('UPDATE leases SET meter_electric_base = ? WHERE id = ?').bind(Number(meter_current), lease_id)
    );
  } else if (payment_type === 'WATER' && meter_current !== undefined && meter_current !== '' && meter_current !== null) {
    batchStmts.push(
      env.DB.prepare('UPDATE leases SET meter_water_base = ? WHERE id = ?').bind(Number(meter_current), lease_id)
    );
  }

  await env.DB.batch(batchStmts);

  return jsonOk({ id, status: paymentStatus }, '账单记录添加成功');
}

export async function handleUpdatePayment(env: Env, id: string, body: any) {
  const existing = await env.DB.prepare('SELECT id FROM payments WHERE id = ?').bind(id).first();
  if (!existing) {
    return jsonError('账单记录不存在', 404, 404);
  }

  const {
    lease_id,
    payment_type,
    amount,
    paid_at,
    meter_last,
    meter_current,
    meter_usage,
    unit_price,
    status,
    remark,
  } = body;

  if (!lease_id || !payment_type || amount === undefined || !paid_at) {
    return jsonError('请选择房源并填写金额与日期', 400);
  }

  const updateStmt = env.DB.prepare(
    `UPDATE payments SET
      lease_id = ?, payment_type = ?, amount = ?, paid_at = ?,
      meter_last = ?, meter_current = ?, meter_usage = ?, unit_price = ?,
      status = ?, remark = ?
     WHERE id = ?`
  ).bind(
    lease_id,
    payment_type,
    Number(amount),
    paid_at,
    meter_last !== undefined && meter_last !== '' ? Number(meter_last) : null,
    meter_current !== undefined && meter_current !== '' ? Number(meter_current) : null,
    meter_usage !== undefined && meter_usage !== '' ? Number(meter_usage) : null,
    unit_price !== undefined && unit_price !== '' ? Number(unit_price) : null,
    status || 'PAID',
    remark ? remark.trim() : null,
    id
  );

  const batchStmts = [updateStmt];
  if (payment_type === 'RENT' && body.next_pay_date) {
    batchStmts.push(
      env.DB.prepare('UPDATE leases SET next_pay_date = ? WHERE id = ?').bind(body.next_pay_date, lease_id)
    );
  }
  if (payment_type === 'ELECTRICITY' && meter_current !== undefined && meter_current !== '' && meter_current !== null) {
    batchStmts.push(
      env.DB.prepare('UPDATE leases SET meter_electric_base = ? WHERE id = ?').bind(Number(meter_current), lease_id)
    );
  } else if (payment_type === 'WATER' && meter_current !== undefined && meter_current !== '' && meter_current !== null) {
    batchStmts.push(
      env.DB.prepare('UPDATE leases SET meter_water_base = ? WHERE id = ?').bind(Number(meter_current), lease_id)
    );
  }

  await env.DB.batch(batchStmts);

  return jsonOk({ id }, '账单记录已修改');
}

export async function handleSettlePayment(env: Env, id: string) {
  const existing = await env.DB.prepare('SELECT id, status FROM payments WHERE id = ?').bind(id).first();
  if (!existing) {
    return jsonError('账单记录不存在', 404, 404);
  }
  await env.DB.prepare("UPDATE payments SET status = 'PAID' WHERE id = ?").bind(id).run();
  return jsonOk({ id }, '账单已成功结清');
}

export async function handleDeletePayment(env: Env, id: string) {
  // 解绑关联文件 (payment_id = NULL) 并删除账单，保证文件原件完好留在文件中心
  await env.DB.batch([
    env.DB.prepare('UPDATE attachments SET payment_id = NULL WHERE payment_id = ?').bind(id),
    env.DB.prepare('DELETE FROM payments WHERE id = ?').bind(id),
  ]);
  return jsonOk({ id }, '账单记录已删除');
}
