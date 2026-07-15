// C-05 ChecklistManager: SDD.md §1。チェックリスト項目CRUD、完了トグル（CC-05冪等性）
import { db, type ChecklistItem, type ChecklistLog } from "../store/localStore";

export interface CreateChecklistItemInput {
  userId: string;
  title: string;
  frequency: "毎日" | "曜日指定";
}

/** FR-DATA-003: 空タイトルは登録不可 */
export async function createChecklistItem(
  input: CreateChecklistItemInput,
  now: number = Date.now()
): Promise<ChecklistItem> {
  if (input.title.trim().length === 0) {
    throw new Error("title must not be empty");
  }
  const item: ChecklistItem = {
    itemId: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    title: input.title,
    frequency: input.frequency,
    updatedAt: now,
  };
  await db.checklistItems.put(item);
  return item;
}

export async function listChecklistItems(userId: string): Promise<ChecklistItem[]> {
  return db.checklistItems.where("userId").equals(userId).toArray();
}

/**
 * FR-DATA-004: タップで完了記録。トグル型実装で冪等（何度実行しても最終状態は決定的）。
 * 同一itemIdに対する直近の未取消ログがあれば取消(undo)、なければ新規完了記録を作る。
 */
export async function toggleChecklistCompletion(itemId: string, now: number = Date.now()): Promise<ChecklistLog> {
  const activeLogs = await db.checklistLogs
    .where("itemId")
    .equals(itemId)
    .and((l) => !l.undone)
    .toArray();

  if (activeLogs.length > 0) {
    const latest = activeLogs.sort((a, b) => b.completedAt - a.completedAt)[0];
    const undone: ChecklistLog = { ...latest, undone: true };
    await db.checklistLogs.put(undone);
    return undone;
  }

  const log: ChecklistLog = {
    logId: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    itemId,
    completedAt: now,
    undone: false,
  };
  await db.checklistLogs.put(log);
  return log;
}
