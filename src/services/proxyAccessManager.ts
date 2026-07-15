// C-02 ProxyAccessManager: SDD.md §1。招待コード発行/検証、代理操作ログ記録
import { db, type InviteCode, type ProxyLog } from "../store/localStore";
import { inviteCodePolicy } from "../config";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 紛らわしい文字(0,O,1,I)を除外

function randomCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function issueInviteCode(ownerUserId: string, now: number = Date.now()): Promise<InviteCode> {
  const invite: InviteCode = {
    code: randomCode(inviteCodePolicy.length),
    ownerUserId,
    createdAt: now,
    expiresAt: now + inviteCodePolicy.expiryHours * 60 * 60 * 1000,
    used: false,
  };
  await db.inviteCodes.put(invite);
  return invite;
}

export type RedeemResult =
  | { status: "success"; ownerUserId: string }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "blocked"; retryAfterMs: number };

/**
 * FR-USR-002（Round1修正CX-06）: 招待コード検証。
 * 5回連続失敗で1時間ブロックする総当たり攻撃対策を実装する。
 */
export async function redeemInviteCode(
  code: string,
  targetUserId: string,
  now: number = Date.now()
): Promise<RedeemResult> {
  const windowStart = now - inviteCodePolicy.blockDurationHours * 60 * 60 * 1000;
  const recentAttempts = await db.inviteAttempts
    .where("targetUserId")
    .equals(targetUserId)
    .and((a) => a.attemptedAt >= windowStart && !a.success)
    .toArray();

  if (recentAttempts.length >= inviteCodePolicy.maxAttempts) {
    const oldestBlocking = Math.min(...recentAttempts.map((a) => a.attemptedAt));
    const retryAfterMs = oldestBlocking + inviteCodePolicy.blockDurationHours * 60 * 60 * 1000 - now;
    return { status: "blocked", retryAfterMs: Math.max(retryAfterMs, 0) };
  }

  const invite = await db.inviteCodes.get(code);
  if (!invite || invite.ownerUserId !== targetUserId) {
    await db.inviteAttempts.add({ targetUserId, attemptedAt: now, success: false });
    return { status: "invalid" };
  }
  // 境界値: expiresAtちょうどは有効（E2E-06「23:59:59」は有効）、超過は無効
  if (now > invite.expiresAt) {
    await db.inviteAttempts.add({ targetUserId, attemptedAt: now, success: false });
    return { status: "expired" };
  }

  await db.inviteAttempts.add({ targetUserId, attemptedAt: now, success: true });
  return { status: "success", ownerUserId: invite.ownerUserId };
}

/** FR-ADM-002: 代理操作ログ記録 */
export async function recordProxyAction(
  actorUserId: string,
  targetUserId: string,
  action: string,
  diff: Record<string, unknown>,
  now: number = Date.now()
): Promise<ProxyLog> {
  const log: ProxyLog = {
    logId: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    actorUserId,
    targetUserId,
    action,
    diff: JSON.stringify(diff),
    timestamp: now,
  };
  await db.proxyLogs.add(log);
  return log;
}
