# kouji-nou-support-app — CLAUDE.md

## PART A: プロジェクト情報 ★毎セッション確認
- プロジェクト名: kouji-nou-support-app（高次脳機能障害者生活支援アプリ）
- 目的(1文): 高次脳機能障害の本人・介護者がリマインド/日課管理/公的ガイドラインに基づく訓練提案を、コストゼロのPWAで利用できるようにする
- 技術スタック: React+Vite(TypeScript) / Dexie.js(IndexedDB) / GitHub Pages+Actions（Round3改訂） / Firebase Firestore(Sparkプラン固定)+Authentication / firebase-admin, web-push
- 現在フェーズ: Phase 6（実装）完了、Phase 7（E2E検証）未着手（詳細はPROGRESS.mdを正とする）
- 現在セッション: 2

## PART B: 完了基準 (Definition of Done)
1. [x] 全 Must 機能が実装済み（`docs/requirements_ledger.md` のMust要件。Round2見直しで23件に変更）
2. [x] 全テスト通過（カバレッジ 98.1%、NFR-MAINT-001の80%基準を達成）
3. [ ] E2E シナリオ全 PASS（`docs/E2E_SCENARIOS.md`）
4. [ ] セキュリティチェック完了（PART F 全項目）
5. [ ] スペックドリフトなし（SD-01 で HIGH ドリフト 0件）
6. [ ] レビュー GO 判定（`harness/review-log.md`）
7. [ ] PROGRESS.md 最新

## PART C: 作業ルール
- 承認制: コード変更は必ず人間の確認を取る
- 1コミット1変更: 1つのコミットに複数の無関係な変更を含めない
- スペックドリフト防止: ドリフト発見時は SD-ALERT 形式で即報告
- ファイルに書く: 会話での合意はその場でファイルに反映する

## PART D: 絶対禁止事項
- 本番DB直接操作禁止（dry-run → Firebase Emulator → 本番の順で確認）
- テスト削除・改ざん禁止（テストが通らない場合は実装を修正する）
- force push 禁止（変更履歴は保持する）
- SRS 未記載機能の追加禁止（新機能は SRS 追記 → 承認後に実装）
- APIキー・Firebase設定・VAPID鍵の直書き禁止（環境変数経由のみ、CC-03）
- **Firebase Blazeプランへのアップグレード禁止**（ADR-005、予算制約に直結。請求先アカウントを紐付けない）
- **訓練メニューに疾病名・重症度スコアを表示する機能の追加禁止**（FR-TRN-005、SaMD非該当性維持のため）
- **訓練メニューの動的AI生成機能の追加禁止**（ADR-006、公的ガイドライン準拠の静的JSON管理を維持）
- **障害プロフィール入力・要配慮個人情報の収集機能、訓練メニューのパーソナライズ（絞り込み・難易度自動調整）機能の再追加禁止**（Round2見直しで社長の要望により明示的に廃止。再検討する場合は社長の明示承認必須）
- CONSTRAINTS.md の無断変更禁止（変更は人間の承認後のみ）
- 50往復超のセッション継続禁止（→ docs/harness/session-mgmt.md）

## PART E: セッション管理
- 開始時: PROGRESS.md 読了 → 前回の続きから再開
- 終了時: PROGRESS.md 更新 → git commit
- 50往復超: 即座にセッション切替（例外なし）
- 詳細: → docs/harness/session-mgmt.md

## PART F: セキュリティチェックリスト
- [ ] 認証・認可設計済み（C-01 AuthService、Firestore Security Rulesで本人/介護者スコープ制御）
- [ ] データ保護設計済み（要配慮個人情報の同意フロー、FR-DATA-001）
- [ ] 外部連携の安全設計済み（VAPID鍵管理、HTTPS通信強制、NFR-SEC-002）
- [ ] 入力検証設計済み（CC-04、クライアント+Security Rulesの二重検証）
- [ ] 依存パッケージの脆弱性チェック済み（npm audit、Phase6実装時に実施）

## PART G: 本番移行チェックリスト（Google SRE PRR 準拠）
- [ ] アーキテクチャレビュー完了（docs/SDD.md）
- [ ] 容量計画策定済み（無料枠の想定利用量、adoption_stop_criteria.md）
- [ ] 監視・アラート設定済み（GitHub Actions/Firestore無料枠監視、60日無活動によるscheduleワークフロー停止対策含む）
- [ ] ロールバック手順文書化済み
- [ ] 運用ドキュメント完備

## PART H: RYG ゲート
- **Green**: 次フェーズへ進行 OK。全チェック項目クリア
- **Yellow**: sandbox / PoC のみ許可。本番操作禁止。注意事項あり
- **Red**: 停止。再設計・再リサーチが必要。進行禁止

## PART I: スペック検証スケジュール
- 週1回: SD-01（定期チェック）実行
- 実装完了時: SD-02（受入条件検証）実行
- テスト変更時: SD-03（テスト改ざん検出）実行
- 詳細: → docs/harness/spec-drift.md

## PART J: ハーネス設計
- dry-run: Push送信・Firestore書き込みは`VITE_DRY_RUN=true`でモック動作（SDD §7）
- sandbox: Firebase Local Emulator Suiteで本番分離テスト
- rollback: GitHub Pagesはrevert push、GitHub ActionsワークフローはDisable workflowで即座に停止
- 承認フロー: 重要操作（Blazeプラン切替可能性のある設定変更等）は人間の承認を得てから実行
- 操作ログ: 全操作を記録（PROGRESS.md + git log + ProxyLog）

## PART K: テスト計画概要
- Unit テスト: 各サービス（C-01〜C-10）の単体テスト
- Integration テスト: SyncEngine⇄Firestore、PushScheduler⇄Push Service連携テスト
- E2E テスト: docs/E2E_SCENARIOS.md 参照
- dry-run テスト: DRY_RUNモードでの事前確認
- Acceptance テスト: docs/acceptance_criteria.md 基準
- Regression テスト: 変更による既存機能への影響確認
- 詳細: → docs/TEST_PLAN.md

## PART L: 成長型ハーネス
- 知識蓄積: 失敗・成功パターンをharness/failure_patterns.mdに記録
- プロジェクト完了時: Layer1知識をLayer2/3へ移植（H-UPDATE）
- 詳細: → docs/harness/three-layers.md

## PART M: 変更履歴
| 版 | 日付 | 変更内容 |
|---|---|---|
| v1.0.0 | 2026-07-14 | 初版作成（SDD完成を受けて生成） |
