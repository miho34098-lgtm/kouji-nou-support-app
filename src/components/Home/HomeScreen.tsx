// ホーム画面: 本日の予定・見逃し予定・日課チェックリストを表示（SRS.md §8参照）
import { useCallback, useEffect, useState } from "react";
import { listSchedules, getMissedSchedules, type MissedSchedule } from "../../services/scheduleManager";
import { listChecklistItems } from "../../services/checklistManager";
import type { Schedule, ChecklistItem } from "../../store/localStore";
import { ScheduleForm } from "../Schedule/ScheduleForm";
import { ScheduleList, MissedScheduleBanner } from "../Schedule/ScheduleList";
import { ChecklistForm } from "../Checklist/ChecklistForm";
import { ChecklistList } from "../Checklist/ChecklistList";

export function HomeScreen({ userId }: { userId: string }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [missed, setMissed] = useState<MissedSchedule[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  const reload = useCallback(async () => {
    setSchedules(await listSchedules(userId));
    setMissed(await getMissedSchedules(userId));
    setChecklistItems(await listChecklistItems(userId));
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div>
      <MissedScheduleBanner missed={missed} />
      <h2 style={{ fontSize: 20 }}>予定</h2>
      <ScheduleForm userId={userId} onCreated={reload} />
      <ScheduleList schedules={schedules} />
      <h2 style={{ fontSize: 20 }}>日課チェックリスト</h2>
      <ChecklistForm userId={userId} onCreated={reload} />
      <ChecklistList items={checklistItems} />
    </div>
  );
}
