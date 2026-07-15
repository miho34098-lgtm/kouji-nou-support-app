import { useEffect, useState } from "react";
import { TrainingScreen } from "./components/Training/TrainingScreen";
import { HomeScreen } from "./components/Home/HomeScreen";
import { RoleSelect } from "./components/Onboarding/RoleSelect";
import { UserProvider, useCurrentUser } from "./context/UserContext";
import { shouldShowInstallOnboarding } from "./services/pwaShell";
import { subscribeToPush } from "./services/notificationClient";

function AppShell() {
  const { currentUser, loading } = useCurrentUser();
  const [showOnboarding] = useState(shouldShowInstallOnboarding());
  const [view, setView] = useState<"home" | "training">("home");

  // FR-SYS-001/FR-NTF-002: PWAインストール済み・ログイン済みになった時点でPush購読を試みる（失敗しても画面は継続表示）
  useEffect(() => {
    if (!showOnboarding && currentUser) {
      subscribeToPush(currentUser.userId).catch((err) => console.error("Push subscription failed:", err));
    }
  }, [showOnboarding, currentUser]);

  if (loading) {
    return null;
  }

  // FR-SYS-002: 未インストール状態での初回起動時にオンボーディング画面を表示
  if (showOnboarding) {
    return (
      <main style={{ fontSize: 18, padding: 16 }}>
        <h1>ホーム画面に追加してください</h1>
        <p>通知機能を使うには、このアプリをホーム画面に追加する必要があります。</p>
      </main>
    );
  }

  // FR-USR-001: ロール未選択の場合はアカウント作成画面へ
  if (!currentUser) {
    return <RoleSelect />;
  }

  return (
    <main style={{ fontSize: 18, padding: 16 }}>
      <nav style={{ marginBottom: 16 }}>
        <button onClick={() => setView("home")} style={{ minHeight: 44, fontSize: 18, marginRight: 8 }}>
          ホーム
        </button>
        <button onClick={() => setView("training")} style={{ minHeight: 44, fontSize: 18 }}>
          訓練メニュー
        </button>
      </nav>
      {view === "training" ? <TrainingScreen /> : <HomeScreen userId={currentUser.userId} />}
    </main>
  );
}

export function App() {
  return (
    <UserProvider>
      <AppShell />
    </UserProvider>
  );
}
