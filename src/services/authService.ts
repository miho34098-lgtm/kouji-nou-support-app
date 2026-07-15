// C-01 AuthService: SDD.md §1。Firebase Authenticationのラップ、ロール判定
import { db, type User, type UserRole } from "../store/localStore";
import { config } from "../config";

/** FR-USR-001: ロール選択によるアカウント作成 */
export async function createAccount(
  userId: string,
  role: UserRole,
  email: string,
  now: number = Date.now()
): Promise<User> {
  const user: User = { userId, role, linkedUserId: null, email, createdAt: now };
  await db.users.put(user);
  return user;
}

/** FR-AUTH-001: 認証結果の検証。ロック処理はFirebase Authentication標準の指数バックオフに委譲する（Round1修正CX-05）。 */
export function validateLoginInput(email: string, password: string): { valid: boolean; reason?: string } {
  if (!email.includes("@")) return { valid: false, reason: "invalid-email" };
  if (password.length < 8) return { valid: false, reason: "password-too-short" };
  return { valid: true };
}

export function isDryRun(): boolean {
  return config.dryRun;
}

export type { User, UserRole };
