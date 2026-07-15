// FR-USR-001: ロール選択によるアカウント作成
import { useState } from "react";
import { createAccount } from "../../services/authService";
import { useCurrentUser } from "../../context/UserContext";
import type { UserRole } from "../../store/localStore";

export function RoleSelect() {
  const { setCurrentUser } = useCurrentUser();
  const [role, setRole] = useState<UserRole | "">("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "") {
      setError("本人または介護者を選択してください");
      return;
    }
    const userId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = await createAccount(userId, role, `${userId}@local.example`);
    setCurrentUser(user);
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontSize: 18, padding: 16 }}>
      <h1>ようこそ</h1>
      <p>あなたの役割を選んでください</p>
      <label style={{ display: "block", marginBottom: 12 }}>
        <input type="radio" name="role" value="本人" checked={role === "本人"} onChange={() => setRole("本人")} />
        本人
      </label>
      <label style={{ display: "block", marginBottom: 12 }}>
        <input
          type="radio"
          name="role"
          value="介護者"
          checked={role === "介護者"}
          onChange={() => setRole("介護者")}
        />
        介護者
      </label>
      {error && (
        <p role="alert" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}
      <button type="submit" style={{ minWidth: 44, minHeight: 44, fontSize: 18 }}>
        はじめる
      </button>
    </form>
  );
}
