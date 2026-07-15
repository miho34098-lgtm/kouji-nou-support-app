// FR-DATA-003: チェックリスト項目登録
import { useState } from "react";
import { createChecklistItem } from "../../services/checklistManager";

export function ChecklistForm({ userId, onCreated }: { userId: string; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createChecklistItem({ userId, title, frequency: "毎日" });
      setTitle("");
      onCreated();
    } catch {
      setError("項目名を入力してください");
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="日課チェックリスト登録" style={{ fontSize: 18, marginBottom: 16 }}>
      <label htmlFor="checklist-title">項目名</label>
      <input
        id="checklist-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ fontSize: 18, minHeight: 44, width: "100%" }}
      />
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
