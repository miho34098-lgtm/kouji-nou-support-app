// C-10 LocalStore: Dexie.js(IndexedDB)ラッパー。SDD.md §3データビュー準拠（Round2改訂反映）
import Dexie, { type Table } from "dexie";

export type UserRole = "本人" | "介護者";
export type ScheduleType = "一般" | "服薬";

export interface User {
  userId: string;
  role: UserRole;
  linkedUserId: string | null;
  email: string;
  createdAt: number;
}

export interface Schedule {
  scheduleId: string;
  userId: string;
  datetime: number; // epoch ms, BC-4対応: 内部はUTC epochで統一
  title: string;
  type: ScheduleType;
  completed: boolean;
  notified: boolean;
  updatedAt: number;
}

export interface ChecklistItem {
  itemId: string;
  userId: string;
  title: string;
  frequency: "毎日" | "曜日指定";
  updatedAt: number;
}

export interface ChecklistLog {
  logId: string;
  itemId: string;
  completedAt: number;
  undone: boolean;
}

export interface ProxyLog {
  logId: string;
  actorUserId: string;
  targetUserId: string;
  action: string;
  diff: string; // JSON文字列
  timestamp: number;
}

export interface InviteCode {
  code: string; // PK, 8桁英数字
  ownerUserId: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

// FR-USR-002例外条件(Round1修正CX-06): 招待コード試行回数のレート制限用
export interface InviteAttempt {
  id?: number; // auto increment
  targetUserId: string;
  attemptedAt: number;
  success: boolean;
}

export class AppDatabase extends Dexie {
  users!: Table<User, string>;
  schedules!: Table<Schedule, string>;
  checklistItems!: Table<ChecklistItem, string>;
  checklistLogs!: Table<ChecklistLog, string>;
  proxyLogs!: Table<ProxyLog, string>;
  inviteCodes!: Table<InviteCode, string>;
  inviteAttempts!: Table<InviteAttempt, number>;

  constructor() {
    super("kouji-nou-support-app");
    this.version(1).stores({
      users: "userId, role, linkedUserId",
      schedules: "scheduleId, userId, datetime, notified",
      checklistItems: "itemId, userId",
      checklistLogs: "logId, itemId, completedAt",
      proxyLogs: "logId, actorUserId, targetUserId, timestamp",
      inviteCodes: "code, ownerUserId, expiresAt",
      inviteAttempts: "++id, targetUserId, attemptedAt",
    });
  }
}

export const db = new AppDatabase();
