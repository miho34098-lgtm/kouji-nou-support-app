import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockRunTransaction = vi.fn();
const mockSubscriptionDocGet = vi.fn();
const mockDoc = vi.fn((id?: string) => ({ id: id ?? "s1", get: mockSubscriptionDocGet }));
const mockCollection = vi.fn(() => ({
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  get: mockGet,
  doc: mockDoc,
}));

vi.mock("firebase-admin/app", () => ({
  initializeApp: vi.fn(() => ({})),
  cert: vi.fn((x: unknown) => x),
}));
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    collection: mockCollection,
    runTransaction: mockRunTransaction,
  })),
  Timestamp: { fromMillis: vi.fn((ms: number) => ({ ms })) },
}));

const { mockSetVapidDetails, mockSendNotification } = vi.hoisted(() => ({
  mockSetVapidDetails: vi.fn(),
  mockSendNotification: vi.fn(),
}));
vi.mock("web-push", () => ({
  default: {
    setVapidDetails: mockSetVapidDetails,
    sendNotification: mockSendNotification,
  },
}));

import { run, queryDueSchedules, claimAndSend, initFirestore, sendPush, getSubscription, type JobEnv } from "../../scripts/checkNotifications";

const baseEnv: JobEnv = {
  DRY_RUN: "true",
  FIREBASE_SERVICE_ACCOUNT_JSON: "{}",
  VAPID_PUBLIC_KEY: "pub",
  VAPID_PRIVATE_KEY: "priv",
  VAPID_SUBJECT: "mailto:test@example.com",
};

describe("scripts/checkNotifications (NotificationCheckJob, ADR-010)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when DRY_RUN=true (H1)", async () => {
    await run(baseEnv);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("queryDueSchedules maps Firestore documents to DueSchedule[]", async () => {
    mockGet.mockResolvedValue({
      docs: [
        {
          id: "s1",
          get: (field: string) => ({ userId: "u1", title: "9:00 服薬" } as Record<string, string>)[field],
        },
      ],
    });
    const db = { collection: mockCollection } as unknown as import("firebase-admin/firestore").Firestore;
    const results = await queryDueSchedules(db, Date.now());
    expect(results).toEqual([{ scheduleId: "s1", userId: "u1", title: "9:00 服薬" }]);
  });

  it("claimAndSend returns false when already notified (CX-03冪等性)", async () => {
    mockRunTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<boolean>) =>
      cb({
        get: vi.fn().mockResolvedValue({ exists: true, get: () => true }),
        update: vi.fn(),
      })
    );
    const db = { collection: mockCollection, runTransaction: mockRunTransaction } as unknown as import("firebase-admin/firestore").Firestore;
    const claimed = await claimAndSend(db, "s1");
    expect(claimed).toBe(false);
  });

  it("claimAndSend returns true and updates notified when not yet notified", async () => {
    const update = vi.fn();
    mockRunTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<boolean>) =>
      cb({
        get: vi.fn().mockResolvedValue({ exists: true, get: () => false }),
        update,
      })
    );
    const db = { collection: mockCollection, runTransaction: mockRunTransaction } as unknown as import("firebase-admin/firestore").Firestore;
    const claimed = await claimAndSend(db, "s1");
    expect(claimed).toBe(true);
    expect(update).toHaveBeenCalledWith(expect.anything(), { notified: true });
  });

  it("initFirestore initializes the Firebase Admin app from a service account JSON", () => {
    const db = initFirestore({ ...baseEnv, FIREBASE_SERVICE_ACCOUNT_JSON: '{"project_id":"test"}' });
    expect(db).toBeDefined();
  });

  it("sendPush configures VAPID details and sends a notification", async () => {
    await sendPush(baseEnv, { endpoint: "https://example.com/push", keys: { p256dh: "a", auth: "b" } }, "9:00 服薬");
    expect(mockSetVapidDetails).toHaveBeenCalledWith(baseEnv.VAPID_SUBJECT, baseEnv.VAPID_PUBLIC_KEY, baseEnv.VAPID_PRIVATE_KEY);
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
  });

  it("getSubscription returns null when no subscription document exists", async () => {
    mockSubscriptionDocGet.mockResolvedValue({ exists: false });
    const db = { collection: mockCollection } as unknown as import("firebase-admin/firestore").Firestore;
    const result = await getSubscription(db, "u1");
    expect(result).toBeNull();
  });

  it("getSubscription returns endpoint/keys when a subscription document exists", async () => {
    mockSubscriptionDocGet.mockResolvedValue({
      exists: true,
      get: (f: string) => ({ endpoint: "https://push.example.com", keys: { p256dh: "a", auth: "b" } } as Record<string, unknown>)[f],
    });
    const db = { collection: mockCollection } as unknown as import("firebase-admin/firestore").Firestore;
    const result = await getSubscription(db, "u1");
    expect(result).toEqual({ endpoint: "https://push.example.com", keys: { p256dh: "a", auth: "b" } });
  });

  it("run() queries, claims, fetches subscription, and sends push when DRY_RUN=false", async () => {
    mockGet.mockResolvedValue({
      docs: [{ id: "s1", get: (f: string) => ({ userId: "u1", title: "予定1" } as Record<string, string>)[f] }],
    });
    mockRunTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<boolean>) =>
      cb({ get: vi.fn().mockResolvedValue({ exists: true, get: () => false }), update: vi.fn() })
    );
    mockSubscriptionDocGet.mockResolvedValue({
      exists: true,
      get: (f: string) => ({ endpoint: "https://push.example.com", keys: { p256dh: "a", auth: "b" } } as Record<string, unknown>)[f],
    });
    await run({ ...baseEnv, DRY_RUN: "false", FIREBASE_SERVICE_ACCOUNT_JSON: '{"project_id":"test"}' });
    expect(mockGet).toHaveBeenCalled();
    expect(mockRunTransaction).toHaveBeenCalled();
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
  });

  it("run() skips sending when the user has no push subscription", async () => {
    mockGet.mockResolvedValue({
      docs: [{ id: "s1", get: (f: string) => ({ userId: "u1", title: "予定1" } as Record<string, string>)[f] }],
    });
    mockRunTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<boolean>) =>
      cb({ get: vi.fn().mockResolvedValue({ exists: true, get: () => false }), update: vi.fn() })
    );
    mockSubscriptionDocGet.mockResolvedValue({ exists: false });
    await run({ ...baseEnv, DRY_RUN: "false", FIREBASE_SERVICE_ACCOUNT_JSON: '{"project_id":"test"}' });
    expect(mockSendNotification).not.toHaveBeenCalled();
  });
});
