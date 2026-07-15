# テスト計画書（IEEE 829準拠） — kouji-nou-support-app

## 1. テスト計画ID
`TP-kouji-nou-support-app-v1.0`

## 2. 目的
`docs/SRS.md` の全Must/Should要件が、`docs/SDD.md` の設計通りに正しく動作することを、機械的に検証可能な証拠をもって証明する。

## 3. テスト対象
- 全コンポーネント（C-01〜C-10, CW-01、docs/SDD.md §1参照）
- 全機能要件（FR-*、docs/requirements_ledger.md参照）
- 全非機能要件（NFR-*）

## 4. テスト対象外
| 対象外 | 理由 |
|---|---|
| Firebase/GitHub Pages/Actionsのインフラ自体の可用性 | 無料インフラのためSLA保証外（NFR-REL-001に明記済み） |
| ブラウザ本体のPush API実装の正確性 | ブラウザベンダーの責任範囲、W3C標準準拠を信頼する |
| 訓練メニューの医学的妥当性の専門的検証 | 本プロジェクトのスコープ外。公的ガイドライン準拠を一次情報確認のみで担保（SaMD-2） |

## 5. テストアプローチ（テストピラミッド）

| 層 | テスト種別 | 対象 | ツール | 実行頻度 |
|---|---|---|---|---|
| 1 | Unit | C-01〜C-10各サービスの関数単位 | Vitest | コミット毎 |
| 2 | Integration | SyncEngine⇄Firestore（Emulator）、PushScheduler⇄Push Service | Vitest + Firebase Emulator | PR毎 |
| 3 | E2E | ユーザーシナリオ全体（`docs/E2E_SCENARIOS.md`） | Playwright | デプロイ前 |
| 4 | Acceptance | `docs/acceptance_criteria.md` 基準 | Playwright + 手動確認 | リリース前 |
| 5 | Security | 認証・認可・同意フロー・XSS/依存脆弱性 | npm audit, 手動権限テスト | リリース前 |
| 6 | Regression | 既存機能の非破壊確認 | Vitest + Playwright（蓄積） | リリース前 |
| 7 | Smoke | 起動確認、主要画面遷移 | Playwright(3件) | デプロイ直後 |

### カバレッジ目標
- Unit: 行カバレッジ80%以上（NFR-MAINT-001）。**【Round1修正 CX-10】対象範囲は`src/services/`（C-01〜C-10のロジック層）および`worker/src/`に限定する。UIコンポーネント（`src/components/`）はE2E/Acceptanceテストで担保し、Unitカバレッジ算出対象から除外する（UI込みでの80%達成は非現実的なため）**
- Integration: 主要フロー100%
- E2E: `docs/E2E_SCENARIOS.md` の6シナリオ100%（うちPush許可ダイアログ等ブラウザ依存の非決定的箇所は下記S5の運用ルールに従う）

## 6. Entry Criteria（テスト開始条件）
- [ ] SDDの設計完了（Phase 3完了、条件付きGO済み）
- [ ] テスト対象コードがビルド可能（`npm run build`成功）
- [ ] Firebase Local Emulator Suiteが起動可能
- [ ] テストデータ（ダミーユーザー・ダミー予定等）が準備済み

## 7. Exit Criteria（テスト終了条件）
- [ ] 全Must要件（30件）のテストがPASS
- [ ] コードカバレッジ80%以上
- [ ] Blocker/Mustの不具合がゼロ
- [ ] E2E 6シナリオ全PASS

## 8. Suspension Criteria（テスト中断条件）
- Blocker不具合が3件以上同時発生
- Firebase Local Emulator Suiteが起動不能
- GitHub Actions/Pagesのデプロイが継続的に失敗（3回以上）

## 9. テスト環境
- OS: Windows/macOS/Linux（開発機依存なし、Node.js 18+）
- ブラウザ: Chrome最新版（開発）、実機検証はiOS Safari 16.4+/Android Chrome最新2バージョン
- テストデータ: `tests/fixtures/` にダミーユーザー・予定・チェックリスト・障害プロフィールを用意
- 環境変数: `VITE_DRY_RUN=true`（デフォルト）、Firebase Emulator接続設定

## 10. テストスケジュール
| フェーズ | 実施内容 | 実施者 |
|---|---|---|
| Phase 6実装中 | Unit/Integrationテストを実装と並行して作成 | 実装者（Claude） |
| Phase 7 | E2E全シナリオ実行、カバレッジ計測 | 実装者（Claude） |
| Phase 7完了時 | スペックドリフト検出（SD-01〜03） | 実装者（Claude） |

## 11. リスクと対策
| リスク | 対策 |
|---|---|
| Firebase Emulatorのバージョン差異で本番動作と乖離 | 本番相当バージョンを`firebase.json`で固定 |
| iOS実機検証環境がない | BrowserStack等の無料枠 or 手動レビューで代替、実機がない旨をPROGRESS.mdに明記 |
| Push通知のE2E自動化が困難（ブラウザ許可ダイアログ） | Playwrightのpermission自動許可設定を使用、それでも困難な箇所は手動E2E手順書で補完 |

## 12. 成果物
- 本テスト計画書
- `docs/E2E_SCENARIOS.md`
- `harness/HARNESS.md`、`CONSTRAINTS.md`
- テスト実行ログ・カバレッジレポート（Phase 7で生成）

---

## P/G/E 3エージェント体制

| エージェント | 責務 | 成果物 |
|---|---|---|
| Planner | 本テスト計画・Exit Criteria・リスク洗い出し | 本ファイル |
| Generator | テストコード実装（`tests/unit`, `tests/integration`, `tests/e2e`） | テストファイル群、実行ログ |
| Evaluator | テスト結果評価、カバレッジ判定、GO/NO-GO提案 | Phase 7の評価レポート |

---

## 決定論的センサー

| # | センサー | コマンド | 合格基準 |
|---|---|---|---|
| S1 | テスト | `npx vitest run` | 全テストPASS |
| S2 | 型チェック | `npx tsc --noEmit` | エラー0件 |
| S3 | リント | `npx eslint src/` | エラー0件 |
| S4 | ビルド | `npm run build` | 正常終了 |
| S5 | E2E | `npx playwright test --grep-invert @manual` | 決定論的シナリオ全PASS |
| S6 | セキュリティ | `npm audit --audit-level=high` | HIGH以上0件（週次実行、PR時は警告のみ） |

**【Round1修正 CX-12】E2Eシナリオの決定論性分離**: Push通知許可ダイアログ等ブラウザネイティブUIに依存し自動化が困難な箇所は`@manual`タグを付与し、S5の自動ゲート対象から除外する。該当箇所はPlaywrightの権限自動許可設定（`context.grantPermissions`）で可能な範囲は自動化し、それでも不安定な箇所のみ手動E2E手順書（`docs/E2E_SCENARIOS.md`内に注記）で補完する。

**【Round1修正 CX-11】S6の運用変更**: `npm audit --audit-level=high`をコミット毎のハードゲートにすると無関係な新規advisoryでCIが不定期に停止するため、週次スケジュール実行をハードゲートとし、PR時は警告表示のみ（マージブロックしない）とする。

**【Round1修正 CX-08】iOS実機検証**: Chromiumベースの自動E2EはlOn Safari固有の挙動（Web Pushのホーム画面追加必須制約等、NFR-COMP-001）を検証できない。リリース前に最低1回、iOS実機（Safari 16.4+）での手動検証を必須とし、証跡（スクリーンショット・確認日）をPROGRESS.mdに記録する。この手動検証未実施の場合はExit Criteriaを満たさないものとする（`docs/exit_criteria.md`参照）。

全センサーは自動実行し、結果をログファイルに記録する。1つでもFAILなら次フェーズに進まない。
