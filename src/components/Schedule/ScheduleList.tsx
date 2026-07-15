// FR-NTF-001/FR-NTF-003: 予定一覧・見逃し予定のキャッチアップ表示
import type { Schedule } from "../../store/localStore";
import type { MissedSchedule } from "../../services/scheduleManager";

export function ScheduleList({ schedules }: { schedules: Schedule[] }) {
  if (schedules.length === 0) {
    return <p>今日の予定はまだ登録されていません。＋ボタンから追加できます</p>;
  }
  return (
    <ul aria-label="予定一覧">
      {schedules.map((s) => (
        <li key={s.scheduleId} style={{ fontSize: 18, marginBottom: 8 }}>
          {new Date(s.datetime).toLocaleString("ja-JP")} — {s.title}（{s.type}）
        </li>
      ))}
    </ul>
  );
}

export function MissedScheduleBanner({ missed }: { missed: MissedSchedule[] }) {
  if (missed.length === 0) {
    return <p>見逃した予定はありません</p>;
  }
  const recent = missed.filter((m) => !m.isOld);
  const old = missed.filter((m) => m.isOld);
  return (
    <section aria-label="見逃した予定" style={{ border: "2px solid #e67e22", padding: 12 }}>
      <h2 style={{ fontSize: 18 }}>見逃した予定</h2>
      <ul>
        {recent.map((s) => (
          <li key={s.scheduleId} style={{ fontSize: 18 }}>
            {new Date(s.datetime).toLocaleString("ja-JP")} — {s.title}
          </li>
        ))}
      </ul>
      {old.length > 0 && (
        <details>
          <summary>古い予定（{old.length}件）</summary>
          <ul>
            {old.map((s) => (
              <li key={s.scheduleId} style={{ fontSize: 18 }}>
                {new Date(s.datetime).toLocaleString("ja-JP")} — {s.title}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
