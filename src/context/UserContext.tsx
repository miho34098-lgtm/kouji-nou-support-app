// 現在ログイン中のユーザー情報を保持するContext。
// 本格的なFirebase Authentication連携（ログイン画面）はPhase6継続タスク。
// 現時点ではDRY_RUN運用を前提に、ローカルに作成したアカウントをそのまま「ログイン中」として扱う。
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { db, type User } from "../store/localStore";

interface UserContextValue {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const CURRENT_USER_ID_KEY = "kouji-nou-support-app:currentUserId";

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!storedId) {
      setLoading(false);
      return;
    }
    db.users.get(storedId).then((user) => {
      setCurrentUserState(user ?? null);
      setLoading(false);
    });
  }, []);

  const setCurrentUser = useCallback((user: User) => {
    localStorage.setItem(CURRENT_USER_ID_KEY, user.userId);
    setCurrentUserState(user);
  }, []);

  return <UserContext.Provider value={{ currentUser, setCurrentUser, loading }}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within UserProvider");
  return ctx;
}
