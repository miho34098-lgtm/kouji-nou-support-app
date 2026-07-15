// NotificationCheckJob（旧CW-01。GitHub Actionsから5分間隔で実行、SDD.md ADR-010参照）
// GitHub Actionsランナーは実Node.js環境のため、Firebase Admin SDKを直接使用できる
// （Cloudflare Workers向けの自前WebCrypto JWT実装=ADR-009は不要になり廃止）
import { initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import webpush from "web-push";

export interface JobEnv {
  DRY_RUN: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string; // GitHub Actions Secretsに保存
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_SUBJECT: string; // mailto:連絡先
}

export interface DueSchedule {
  scheduleId: string;
  userId: string;
  title: string;
}

export function initFirestore(env: JobEnv): Firestore {
  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const app: App = initializeApp({ credential: cert(serviceAccount) });
  return getFirestore(app);
}

/** 期限到来かつ未通知の予定を検索する */
export async function queryDueSchedules(db: Firestore, nowMs: number): Promise<DueSchedule[]> {
  const snapshot = await db
    .collection("schedules")
    .where("datetime", "<=", Timestamp.fromMillis(nowMs))
    .where("notified", "==", false)
    .limit(100)
    .get();
  return snapshot.docs.map((doc) => ({
    scheduleId: doc.id,
    userId: doc.get("userId") as string,
    title: doc.get("title") as string,
  }));
}

/**
 * CX-03冪等性対応: notified==falseを前提条件としたトランザクション更新でclaimする。
 * 複数のワークフロー実行が重なっても二重送信しない。
 */
export async function claimAndSend(db: Firestore, scheduleId: string): Promise<boolean> {
  const ref = db.collection("schedules").doc(scheduleId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.get("notified") === true) {
      return false;
    }
    tx.update(ref, { notified: true });
    return true;
  });
}

export async function sendPush(env: JobEnv, subscription: webpush.PushSubscription, title: string): Promise<void> {
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  await webpush.sendNotification(subscription, JSON.stringify({ title, body: "予定の時間です" }));
}

/** SDD.md §3（Phase6追加）: pushSubscriptions/{userId} から購読情報を取得する。未購読ならnull */
export async function getSubscription(db: Firestore, userId: string): Promise<webpush.PushSubscription | null> {
  const snap = await db.collection("pushSubscriptions").doc(userId).get();
  if (!snap.exists) return null;
  return {
    endpoint: snap.get("endpoint") as string,
    keys: snap.get("keys") as { p256dh: string; auth: string },
  };
}

export async function run(env: JobEnv): Promise<void> {
  if (env.DRY_RUN === "true") {
    console.log("[DRY_RUN] NotificationCheckJob would scan Firestore and send push notifications");
    return;
  }
  const db = initFirestore(env);
  const dueSchedules = await queryDueSchedules(db, Date.now());
  for (const schedule of dueSchedules) {
    const claimed = await claimAndSend(db, schedule.scheduleId);
    if (!claimed) continue;
    const subscription = await getSubscription(db, schedule.userId);
    if (!subscription) {
      console.log(`No push subscription for user ${schedule.userId}, skipping schedule ${schedule.scheduleId} (FR-NTF-003キャッチアップ表示に委ねる)`);
      continue;
    }
    try {
      await sendPush(env, subscription, schedule.title);
      console.log(`Sent push notification for schedule ${schedule.scheduleId} to user ${schedule.userId}`);
    } catch (err) {
      // CC-01: Push送信失敗時はエラーログのみ。当該予定はFR-NTF-003キャッチアップ表示で補償される
      console.error(`Failed to send push for schedule ${schedule.scheduleId}:`, err);
    }
  }
}
