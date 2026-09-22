// src/modules/dashboard/index.ts
// 房东多房运营大盘 (多维度资产收益、待收租预警、水电抄表追踪)

import { Env, Lease } from '../../types';
import { jsonOk } from '../../utils/response';

export async function handleDashboardSummary(env: Env) {
  const allLeasesRes = await env.DB.prepare(
    'SELECT * FROM leases ORDER BY status ASC, end_date ASC'
  ).all();

  const now = new Date();
  const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let totalProperties = allLeasesRes.results.length;
  let activeCount = 0;
  let overdueCount = 0;
  let terminatedCount = 0;
  let totalMonthlyRent = 0;
  let totalDepositHeld = 0;

  const leases = (allLeasesRes.results as unknown as Lease[]).map((lease) => {
    const end = new Date(lease.end_date);
    let daysRemaining = 0;
    let remainingText = '';
    let isOverdue = false;

    if (!isNaN(end.getTime()) && parseInt(lease.end_date.split('-')[0], 10) >= 2000) {
      const endZero = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      daysRemaining = Math.round((endZero - todayZero) / (1000 * 60 * 60 * 24));
      if (lease.status === 'TERMINATED') {
        remainingText = '已退租结清';
      } else if (lease.status === 'EXPIRED') {
        remainingText = '已到期归档';
      } else if (daysRemaining > 0) {
        remainingText = `剩余 ${daysRemaining} 天`;
      } else if (daysRemaining === 0) {
        remainingText = '今日到期';
      } else {
        remainingText = `已超期 ${Math.abs(daysRemaining)} 天`;
        isOverdue = true;
      }
    } else {
      remainingText = '日期待修正';
    }

    if (lease.status === 'ACTIVE') {
      if (isOverdue) {
        overdueCount++;
      } else {
        activeCount++;
      }
      totalMonthlyRent += Number(lease.rent_amount) || 0;
      totalDepositHeld += Number(lease.deposit_amount) || 0;
    } else {
      terminatedCount++;
    }

    let daysToNextPay: number | null = null;
    let nextPayText: string | null = null;
    let isPayOverdue = false;

    if (lease.next_pay_date) {
      const nextPay = new Date(lease.next_pay_date);
      if (!isNaN(nextPay.getTime())) {
        const payZero = new Date(nextPay.getFullYear(), nextPay.getMonth(), nextPay.getDate()).getTime();
        daysToNextPay = Math.round((payZero - todayZero) / (1000 * 60 * 60 * 24));
        if (daysToNextPay > 0) {
          nextPayText = `距收租 ${daysToNextPay} 天`;
        } else if (daysToNextPay === 0) {
          nextPayText = '今日应收租';
        } else {
          nextPayText = `收租超期 ${Math.abs(daysToNextPay)} 天`;
          isPayOverdue = true;
        }
      }
    }

    return {
      ...lease,
      daysRemaining,
      remainingText,
      isOverdue,
      daysToNextPay,
      nextPayText,
      isPayOverdue,
      payOverdueDays: isPayOverdue ? Math.abs(daysToNextPay!) : 0,
    };
  });

  // 待收租预警队列：仅包含已逾期、今日到期或未来 30 天内应收租金的房源 (已逾期在前，超过30天的远期不纳入预警)
  const upcomingRentQueue = leases
    .filter((l) => l.status === 'ACTIVE' && l.daysToNextPay !== null && l.daysToNextPay <= 30)
    .sort((a, b) => (a.daysToNextPay || 0) - (b.daysToNextPay || 0))
    .slice(0, 8);

  const recentPayments = await env.DB.prepare(
    `SELECT p.*, l.title as lease_title, l.tenant_name 
     FROM payments p 
     LEFT JOIN leases l ON p.lease_id = l.id 
     ORDER BY p.paid_at DESC LIMIT 5`
  ).all();

  const attCountRow = await env.DB.prepare('SELECT COUNT(*) as count FROM attachments').first();
  const attachmentCount = attCountRow ? (attCountRow.count as number) : 0;

  const webdavRow = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'webdav_config'").first();
  let webdavEnabled = false;
  if (webdavRow && webdavRow.value) {
    try {
      const parsed = JSON.parse(webdavRow.value as string);
      webdavEnabled = !!parsed.is_enabled;
    } catch {}
  }

  const userRow = await env.DB.prepare('SELECT username, totp_enabled FROM users LIMIT 1').first();
  const totpEnabled = userRow ? (userRow.totp_enabled as number) === 1 : false;
  const username = userRow ? (userRow.username as string) : 'Admin';

  const curMonthPrefix = now.toISOString().slice(0, 7);
  const paymentsAggRow = (await env.DB.prepare(`
    SELECT
      SUM(CASE WHEN status = 'PAID' AND payment_type != 'DEPOSIT' AND paid_at LIKE ? THEN amount ELSE 0 END) as this_month_income,
      SUM(CASE WHEN status = 'UNPAID' THEN amount ELSE 0 END) as total_unpaid_amount,
      COUNT(CASE WHEN status = 'UNPAID' THEN 1 END) as total_unpaid_count
    FROM payments
  `).bind(`${curMonthPrefix}%`).first()) as any;

  const thisMonthIncome = Number(paymentsAggRow?.this_month_income) || 0;
  const totalUnpaidAmount = Number(paymentsAggRow?.total_unpaid_amount) || 0;
  const totalUnpaidCount = Number(paymentsAggRow?.total_unpaid_count) || 0;

  return jsonOk({
    stats: {
      totalProperties,
      activeCount,
      overdueCount,
      terminatedCount,
      totalMonthlyRent,
      totalDepositHeld,
      thisMonthIncome,
      totalUnpaidAmount,
      totalUnpaidCount,
      currentMonth: curMonthPrefix,
    },
    upcomingRentQueue,
    leases,
    recentPayments: recentPayments.results,
    attachmentCount,
    webdavEnabled,
    totpEnabled,
    username,
    serverTime: now.toISOString(),
  });
}
