// C-09 SyncEngine: SDD.md §1。IndexedDB⇄Firestoreの差分同期、競合解決(最終更新優先)
import { db } from "../store/localStore";
import { FirestoreAdapter, type SyncResult } from "../adapters/firestoreAdapter";

const firestoreAdapter = new FirestoreAdapter();

/** FR-SYS-004: オンライン復帰時の自動同期。オフライン時はno-op（CC-01）。 */
export async function sync(): Promise<SyncResult> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { success: true, dryRun: true, syncedCount: 0 };
  }
  const schedules = await db.schedules.toArray();
  const checklistItems = await db.checklistItems.toArray();
  const scheduleResult = await firestoreAdapter.pushChanges("schedules", schedules);
  await firestoreAdapter.pushChanges("checklistItems", checklistItems);
  return scheduleResult;
}
