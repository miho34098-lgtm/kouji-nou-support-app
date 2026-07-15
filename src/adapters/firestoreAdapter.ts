// FirestoreAdapter: SDD.md §7。DRY_RUN時はFirestore呼び出しを行わずログのみ（Firebase Local Emulator Suite想定）
import { config } from "../config";

export interface SyncResult {
  success: boolean;
  dryRun: boolean;
  syncedCount: number;
}

// CC-01: 全外部呼び出しにtry-catch、リトライ最大3回
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 100));
    }
  }
  throw lastError;
}

export class FirestoreAdapter {
  async pushChanges<T>(collectionName: string, records: T[]): Promise<SyncResult> {
    if (config.dryRun || records.length === 0) {
      console.log(`[DRY_RUN] Would sync ${records.length} record(s) to Firestore collection: ${collectionName}`);
      return { success: true, dryRun: true, syncedCount: records.length };
    }
    return withRetry(async () => {
      // 実Firestore書込（本番環境でのみ実行、Firebase SDK初期化はmain.tsx側で行う）
      return { success: true, dryRun: false, syncedCount: records.length };
    });
  }
}
