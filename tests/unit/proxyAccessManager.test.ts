import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/store/localStore";
import { issueInviteCode, redeemInviteCode, recordProxyAction } from "../../src/services/proxyAccessManager";
import { inviteCodePolicy } from "../../src/config";

describe("proxyAccessManager (FR-USR-002, Round1修正CX-06)", () => {
  beforeEach(async () => {
    await db.inviteCodes.clear();
    await db.inviteAttempts.clear();
  });

  it("issues an 8-character invite code", async () => {
    const invite = await issueInviteCode("owner1");
    expect(invite.code).toHaveLength(inviteCodePolicy.length);
  });

  it("redeems successfully with a valid code", async () => {
    const invite = await issueInviteCode("owner1");
    const result = await redeemInviteCode(invite.code, "owner1");
    expect(result.status).toBe("success");
  });

  it("rejects an invalid code", async () => {
    const result = await redeemInviteCode("WRONGCOD", "owner1");
    expect(result.status).toBe("invalid");
  });

  it("boundary: succeeds exactly at expiry time, fails 1ms after (E2E-06)", async () => {
    const issuedAt = Date.now();
    const invite = await issueInviteCode("owner1", issuedAt);
    const exactExpiry = issuedAt + inviteCodePolicy.expiryHours * 60 * 60 * 1000;

    const atBoundary = await redeemInviteCode(invite.code, "owner1", exactExpiry);
    expect(atBoundary.status).toBe("success");

    await db.inviteCodes.put(invite); // used=falseに戻して再検証（テスト目的）
    const afterBoundary = await redeemInviteCode(invite.code, "owner1", exactExpiry + 1);
    expect(afterBoundary.status).toBe("expired");
  });

  it("blocks after 5 consecutive failed attempts within 1 hour (brute-force protection, E2E-05)", async () => {
    const now = Date.now();
    for (let i = 0; i < inviteCodePolicy.maxAttempts; i++) {
      const result = await redeemInviteCode("WRONGCOD", "owner1", now + i);
      expect(result.status).toBe("invalid");
    }
    const blocked = await redeemInviteCode("WRONGCOD", "owner1", now + inviteCodePolicy.maxAttempts);
    expect(blocked.status).toBe("blocked");
  });
});

describe("proxyAccessManager.recordProxyAction (FR-ADM-002)", () => {
  beforeEach(async () => {
    await db.proxyLogs.clear();
  });

  it("records who changed what, when (代理操作ログ)", async () => {
    const log = await recordProxyAction("caregiver1", "owner1", "createSchedule", { title: "9:00 服薬" });
    expect(log.actorUserId).toBe("caregiver1");
    expect(log.targetUserId).toBe("owner1");
    expect(JSON.parse(log.diff)).toEqual({ title: "9:00 服薬" });
    const stored = await db.proxyLogs.get(log.logId);
    expect(stored).toBeDefined();
  });
});
