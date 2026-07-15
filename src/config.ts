// CC-03: 設定値の一元管理。ハードコード禁止、環境変数経由のみ

export const config = {
  dryRun: import.meta.env.VITE_DRY_RUN !== "false",
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
  },
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "",
} as const;

// SRS FR-USR-002 (Round1修正CX-06反映): 招待コードの桁数・有効期限・レート制限
export const inviteCodePolicy = {
  length: 8,
  expiryHours: 24,
  maxAttempts: 5,
  blockDurationHours: 1,
} as const;
