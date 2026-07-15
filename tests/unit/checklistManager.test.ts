import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/store/localStore";
import { createChecklistItem, toggleChecklistCompletion } from "../../src/services/checklistManager";

describe("checklistManager (FR-DATA-003, FR-DATA-004)", () => {
  beforeEach(async () => {
    await db.checklistItems.clear();
    await db.checklistLogs.clear();
  });

  it("registers a checklist item with a valid title", async () => {
    const item = await createChecklistItem({ userId: "u1", title: "歯磨き", frequency: "毎日" });
    expect(item.title).toBe("歯磨き");
  });

  it("rejects an empty title", async () => {
    await expect(createChecklistItem({ userId: "u1", title: "", frequency: "毎日" })).rejects.toThrow();
  });

  it("is idempotent: toggling twice returns to the original state (CC-05)", async () => {
    const item = await createChecklistItem({ userId: "u1", title: "歯磨き", frequency: "毎日" });
    const first = await toggleChecklistCompletion(item.itemId);
    expect(first.undone).toBe(false);
    const second = await toggleChecklistCompletion(item.itemId);
    expect(second.undone).toBe(true);
    const third = await toggleChecklistCompletion(item.itemId);
    expect(third.undone).toBe(false);
  });
});
