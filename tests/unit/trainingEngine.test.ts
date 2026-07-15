import { describe, it, expect } from "vitest";
import { getTrainingMenus, TRAINING_DISCLAIMER } from "../../src/services/trainingEngine";

describe("trainingEngine (FR-TRN-001, FR-TRN-004, FR-TRN-005, Round2簡略化)", () => {
  it("returns all 3 categories with no personalization input", () => {
    const categories = getTrainingMenus();
    expect(categories.map((c) => c.category)).toEqual(["記憶訓練", "注意訓練", "遂行機能訓練"]);
  });

  it("每 menu item includes a source URL (根拠の明示)", () => {
    const categories = getTrainingMenus();
    for (const cat of categories) {
      for (const menu of cat.menus) {
        expect(menu.sourceUrl).toMatch(/^https:\/\//);
      }
    }
  });

  it("does not expose any disease name or severity score fields (FR-TRN-005)", () => {
    const categories = getTrainingMenus();
    const serialized = JSON.stringify(categories);
    expect(serialized).not.toMatch(/severity|diagnosis|disease/i);
  });

  it("disclaimer includes rest/consult-a-specialist wording (社長要望 2026-07-14)", () => {
    expect(TRAINING_DISCLAIMER).toContain("無理に行わず");
    expect(TRAINING_DISCLAIMER).toContain("専門家にご相談ください");
  });
});
