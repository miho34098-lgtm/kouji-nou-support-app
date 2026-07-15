import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { db } from "../../src/store/localStore";
import { sync } from "../../src/services/syncEngine";

describe("syncEngine (FR-SYS-004)", () => {
  beforeEach(async () => {
    await db.schedules.clear();
    await db.checklistItems.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is a no-op when offline (CC-01)", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    const result = await sync();
    expect(result.syncedCount).toBe(0);
  });

  it("syncs local schedules and checklist items when online (DRY_RUN logs only)", async () => {
    vi.stubGlobal("navigator", { onLine: true });
    await db.schedules.put({
      scheduleId: "s1",
      userId: "u1",
      datetime: Date.now(),
      title: "予定A",
      type: "一般",
      completed: false,
      notified: false,
      updatedAt: Date.now(),
    });
    const result = await sync();
    expect(result.dryRun).toBe(true);
    expect(result.syncedCount).toBe(1);
  });
});
