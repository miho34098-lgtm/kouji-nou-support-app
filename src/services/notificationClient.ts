// C-07 NotificationClient: SDD.md §1。Service Worker登録、Push購読、通知表示、音声読み上げ
import { PushAdapter } from "../adapters/pushAdapter";

const pushAdapter = new PushAdapter();

/** FR-SYS-001/FR-NTF-002: Push購読を開始し、購読情報をuserIdに紐付けて保存する */
export async function subscribeToPush(userId: string): Promise<boolean> {
  const subscription = await pushAdapter.subscribe();
  const result = await pushAdapter.logSubscription(subscription, userId);
  return result.success;
}

/** FR-NTF-004: 音声読み上げ通知（Should要件）。非対応ブラウザではスキップする。 */
export function speakNotification(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  window.speechSynthesis.speak(utterance);
}
