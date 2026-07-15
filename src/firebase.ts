// Firebaseクライアント初期化（CC-03設定値管理準拠）。
// APIキー未設定でもDRY_RUNモードでアプリが動作できるよう、遅延・null許容で初期化する（SDD.md §7）。
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { config } from "./config";

let app: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!config.firebase.apiKey) return null;
  if (!app) app = initializeApp(config.firebase);
  return app;
}

export function getFirestoreDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!firestoreDb) firestoreDb = getFirestore(firebaseApp);
  return firestoreDb;
}
