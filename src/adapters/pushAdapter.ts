// PushAdapter（クライアント側）: SDD.md §7 アダプターパターン+DRY_RUN設計
import { doc, setDoc } from "firebase/firestore";
import { config } from "../config";
import { getFirestoreDb } from "../firebase";

export interface NotificationPayload {
  title: string;
  body: string;
  scheduleId: string;
}

export interface PushSendResult {
  success: boolean;
  dryRun: boolean;
}

export class PushAdapter {
  async subscribe(): Promise<PushSubscription | null> {
    if (config.dryRun) {
      console.log("[DRY_RUN] Push subscription would be requested");
      return null;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return null;
    }
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: config.vapidPublicKey,
    });
  }

  // クライアント側は「購読」のみ担当し、実送信はCW-01(GitHub Actions)が行う（SDD.md §2プロセスビュー）
  // 購読情報はpushSubscriptions/{userId}に保存する（SDD.md §3 Phase6追加分参照）
  async logSubscription(subscription: PushSubscription | null, userId: string): Promise<PushSendResult> {
    if (config.dryRun) {
      console.log("[DRY_RUN] Subscription would be sent to server:", subscription);
      return { success: true, dryRun: true };
    }
    if (!subscription) {
      return { success: false, dryRun: false };
    }
    const db = getFirestoreDb();
    if (!db) {
      return { success: false, dryRun: false };
    }
    try {
      const json = subscription.toJSON();
      await setDoc(doc(db, "pushSubscriptions", userId), {
        endpoint: json.endpoint,
        keys: json.keys,
        updatedAt: Date.now(),
      });
      return { success: true, dryRun: false };
    } catch (err) {
      console.error("Failed to save push subscription:", err); // CC-01
      return { success: false, dryRun: false };
    }
  }
}
