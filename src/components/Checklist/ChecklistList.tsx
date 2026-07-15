// FR-DATA-004: チェックリスト項目の一覧表示とタップ完了（44x44px以上のボタン、NFR-USE-002）
import { useEffect, useState } from "react";
import { toggleChecklistCompletion } from "../../services/checklistManager";
import { db, type ChecklistItem } from "../../store/localStore";

export function ChecklistList({ items }: { items: ChecklistItem[] }) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const map: Record<string, boolean> = {};
      for (const item of items) {
        const logs = await db.checklistLogs.where("itemId").equals(item.itemId).and((l) => !l.undone).toArray();
        map[item.itemId] = logs.length > 0;
      }
      setCompletedMap(map);
    })();
  }, [items]);

  const handleToggle = async (itemId: string) => {
    await toggleChecklistCompletion(itemId);
    setCompletedMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (items.length === 0) {
    return <p>日課チェックリストはまだ登録されていません</p>;
  }

  return (
    <ul aria-label="日課チェックリスト" style={{ listStyle: "none", padding: 0 }}>
      {items.map((item) => (
        <li key={item.itemId} style={{ marginBottom: 8 }}>
          <button
            onClick={() => handleToggle(item.itemId)}
            aria-pressed={completedMap[item.itemId] ?? false}
            style={{
              minWidth: 44,
              minHeight: 44,
              fontSize: 18,
              width: "100%",
              textAlign: "left",
              background: completedMap[item.itemId] ? "#d5f5e3" : "#fff",
            }}
          >
            {completedMap[item.itemId] ? "✅ " : "⬜ "}
            {item.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
