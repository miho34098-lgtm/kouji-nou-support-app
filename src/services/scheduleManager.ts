// C-04 ScheduleManager: SDD.md §1。予定・服薬のCRUD、見逃し予定の抽出
import { db, type Schedule, type ScheduleType } from "../store/localStore";

export interface CreateScheduleInput {
  userId: string;
  datetime: number;
  title: string;
  type: ScheduleType;
}

/** FR-NTF-001: 予定・服薬登録。例外: title空は登録不可 */
export async function createSchedule(input: CreateScheduleInput, now: number = Date.now()): Promise<Schedule> {
  if (input.title.trim().length === 0) {
    throw new Error("title must not be empty");
  }
  const schedule: Schedule = {
    scheduleId: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    datetime: input.datetime,
    title: input.title,
    type: input.type,
    completed: false,
    notified: false,
    updatedAt: now,
  };
  await db.schedules.put(schedule);
  return schedule;
}

export async function listSchedules(userId: string): Promise<Schedule[]> {
  return db.schedules.where("userId").equals(userId).sortBy("datetime");
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * FR-NTF-003: キャッチアップ表示。配信時刻を過ぎた未完了予定を抽出する。
 * 7日以上前のものは isOld=true として区別する（折りたたみ表示用）。
 */
export interface MissedSchedule extends Schedule {
  isOld: boolean;
}

export async function getMissedSchedules(userId: string, now: number = Date.now()): Promise<MissedSchedule[]> {
  const all = await db.schedules
    .where("userId")
    .equals(userId)
    .and((s) => s.datetime <= now && !s.completed)
    .toArray();
  return all.map((s) => ({ ...s, isOld: now - s.datetime > SEVEN_DAYS_MS }));
}
