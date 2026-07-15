import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/store/localStore";
import { createSchedule, listSchedules, getMissedSchedules } from "../../src/services/scheduleManager";

describe("scheduleManager (FR-NTF-001, FR-NTF-003)", () => {
  beforeEach(async () => {
    await db.schedules.clear();
  });

  it("registers a schedule with a valid title", async () => {
    const schedule = await createSchedule({ userId: "u1", datetime: Date.now(), title: "9:00 服薬", type: "服薬" });
    expect(schedule.title).toBe("9:00 服薬");
    const list = await listSchedules("u1");
    expect(list).toHaveLength(1);
  });

  it("rejects an empty title (boundary: empty input)", async () => {
    await expect(createSchedule({ userId: "u1", datetime: Date.now(), title: "  ", type: "一般" })).rejects.toThrow();
  });

  it("returns missed schedules that are past due and not completed", async () => {
    const now = Date.now();
    await createSchedule({ userId: "u1", datetime: now - 60_000, title: "過去の予定", type: "一般" }, now - 60_000);
    const missed = await getMissedSchedules("u1", now);
    expect(missed).toHaveLength(1);
    expect(missed[0].isOld).toBe(false);
  });

  it("marks schedules older than 7 days as isOld=true (E2E-04関連の境界)", async () => {
    const now = Date.now();
    const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;
    await createSchedule({ userId: "u1", datetime: eightDaysAgo, title: "古い予定", type: "一般" }, eightDaysAgo);
    const missed = await getMissedSchedules("u1", now);
    expect(missed[0].isOld).toBe(true);
  });
});
