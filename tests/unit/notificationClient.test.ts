import { describe, it, expect, vi, afterEach } from "vitest";
import { subscribeToPush, speakNotification } from "../../src/services/notificationClient";

describe("notificationClient (FR-NTF-002 purchase, FR-NTF-004)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    // @ts-expect-error jsdom拡張のクリーンアップ
    delete window.speechSynthesis;
  });

  it("subscribeToPush returns true in DRY_RUN mode without calling browser Push API", async () => {
    // テスト環境ではVITE_DRY_RUNは未設定 → config.dryRun=trueがデフォルト
    const result = await subscribeToPush("u1");
    expect(result).toBe(true);
  });

  it("speakNotification does nothing when speechSynthesis is unavailable", () => {
    expect(() => speakNotification("お薬の時間です")).not.toThrow();
  });

  it("speakNotification calls window.speechSynthesis.speak when available", () => {
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { speak });
    class FakeUtterance {
      lang = "";
      constructor(public text: string) {}
    }
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    speakNotification("お薬の時間です");
    expect(speak).toHaveBeenCalledTimes(1);
  });
});
