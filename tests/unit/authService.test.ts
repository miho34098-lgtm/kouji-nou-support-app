import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/store/localStore";
import { validateLoginInput, createAccount, isDryRun } from "../../src/services/authService";

describe("authService.validateLoginInput (FR-AUTH-001)", () => {
  it("accepts a valid email and 8+ character password", () => {
    expect(validateLoginInput("user@example.com", "password1")).toEqual({ valid: true });
  });

  it("rejects an email without @", () => {
    expect(validateLoginInput("invalid-email", "password1").valid).toBe(false);
  });

  it("boundary: rejects a 7-character password, accepts 8-character (最小値-1/最小値)", () => {
    expect(validateLoginInput("user@example.com", "1234567").valid).toBe(false);
    expect(validateLoginInput("user@example.com", "12345678").valid).toBe(true);
  });
});

describe("authService.createAccount (FR-USR-001)", () => {
  beforeEach(async () => {
    await db.users.clear();
  });

  it("creates and persists a user with the given role", async () => {
    const user = await createAccount("u1", "本人", "user@example.com");
    expect(user.role).toBe("本人");
    const stored = await db.users.get("u1");
    expect(stored?.email).toBe("user@example.com");
  });
});

describe("authService.isDryRun", () => {
  it("returns true by default in the test environment (H1)", () => {
    expect(isDryRun()).toBe(true);
  });
});
