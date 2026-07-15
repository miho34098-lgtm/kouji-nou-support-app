// エントリポイント: GitHub Actionsから `tsx scripts/runCheckNotifications.ts` として実行される
import { run, type JobEnv } from "./checkNotifications";

const env: JobEnv = {
  DRY_RUN: process.env.DRY_RUN ?? "true",
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? "",
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY ?? "",
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ?? "",
  VAPID_SUBJECT: process.env.VAPID_SUBJECT ?? "mailto:example@example.com",
};

run(env).catch((err) => {
  console.error(err);
  process.exit(1);
});
