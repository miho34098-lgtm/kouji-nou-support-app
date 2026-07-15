// FR-NTF-001: 予定・服薬登録
import { useState } from "react";
import { createSchedule } from "../../services/scheduleManager";
import type { ScheduleType } from "../../store/localStore";

export function ScheduleForm({ userId, onCreated }: { userId: string; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");
  const [type, setType] = useState<ScheduleType>("一般");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createSchedule({
        userId,
        title,
        type,
        datetime: datetime ? new Date(datetime).getTime() : Date.now(),
      });
      setTitle("");
      setDatetime("");
      onCreated();
    } catch (err) {
      setError("予定のタイトルを入力してください");
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="予定登録" style={{ fontSize: 18, marginBottom: 16 }}>
      <div>
        <label htmlFor="schedule-title">タイトル</label>
        <input
          id="schedule-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ fontSize: 18, minHeight: 44, width: "100%" }}
        />
      </div>
      <div>
        <label htmlFor="schedule-datetime">日時</label>
        <input
          id="schedule-datetime"
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          style={{ fontSize: 18, minHeight: 44 }}
        />
      </div>
      <div>
        <label htmlFor="schedule-type">種別</label>
        <select
          id="schedule-type"
          value={type}
          onChange={(e) => setType(e.target.value as ScheduleType)}
          style={{ fontSize: 18, minHeight: 44 }}
        >
          <option value="一般">一般</option>
          <option value="服薬">服薬</option>
        </select>
      </div>
      {error && (
        <p role="alert" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}
      <button type="submit" style={{ minWidth: 44, minHeight: 44, fontSize: 18 }}>
        追加する
      </button>
    </form>
  );
}
