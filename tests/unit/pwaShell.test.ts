import { describe, it, expect, afterEach } from "vitest";
import { isInstalledAsPwa, shouldShowInstallOnboarding } from "../../src/services/pwaShell";

describe("pwaShell (FR-SYS-001, FR-SYS-002)", () => {
  afterEach(() => {
    // matchMediaのモックをリセット
    // @ts-expect-error jsdom拡張
    delete window.matchMedia;
  });

  it("returns false when not installed (default jsdom environment)", () => {
    window.matchMedia = (() => ({ matches: false })) as unknown as typeof window.matchMedia;
    expect(isInstalledAsPwa()).toBe(false);
    expect(shouldShowInstallOnboarding()).toBe(true);
  });

  it("returns true when display-mode is standalone", () => {
    window.matchMedia = ((query: string) => ({ matches: query.includes("standalone") })) as unknown as typeof window.matchMedia;
    expect(isInstalledAsPwa()).toBe(true);
    expect(shouldShowInstallOnboarding()).toBe(false);
  });
});
