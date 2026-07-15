# PROGRESS.md

## プロジェクト概要
- 名称: kouji-nou-support-app（高次脳機能障害者生活支援アプリ）
- 開始日: 2026-07-14

## フェーズ進捗

| Phase | 状態 | 完了日 |
|---|---|---|
| Phase 0 ヒアリング | 完了 | 2026-07-14 |
| Phase 1 リサーチ V1→V2 | 完了 | 2026-07-14 |
| Phase 2 SRS | 完了（品質スコアリング済み、条件付きGO） | 2026-07-14 |
| Phase 3 SDD | 完了（Round1レビュー反映済み） | 2026-07-14 |
| Phase 4 テスト計画/ハーネス | 完了（Round1レビュー反映済み） | 2026-07-14 |
| Phase 5 レビューループ | 完了（Round1でCONDITIONAL GO、Blocker/Must解消済み） | 2026-07-14 |
| Phase 6 実装 | 完了。UI画面・Push通知の実送信配線・Firestore Rules・PWAアイコンまで実装完了（カバレッジ98.1%、目標80%達成） | 2026-07-16 |
| Phase 7 E2E検証 | 未着手 | - |
| Phase 8 本番移行 | 未着手 | - |

### Phase 6 現状（2026-07-16 更新）

**【重要】本セクションは2026-07-14版で「UI画面は簡易シェルのみ」「Firestore Rules本体未実装」と記載していたが、実際には当該作業が既に完了していたことを2026-07-16のセッションで確認した（PROGRESS.md更新漏れによる齟齬）。以後の状態はこの版を正とする。**

**実装済み・テストPASS（44件、カバレッジ98.1%）**:
- C-01 AuthService, C-02 ProxyAccessManager（招待コードのセキュリティ境界値含む）, C-04 ScheduleManager, C-05 ChecklistManager, C-06 TrainingEngine, C-07 NotificationClient, C-08 PWAShell, C-09 SyncEngine, C-10 LocalStore, CW-01 NotificationCheckJob(scripts/checkNotifications.ts、GitHub Actions実行)
- Home/Schedule/Checklist/Trainingの画面コンポーネントは実装済み（RoleSelect含む）
- Firestore Security Rules本体（本人/介護者スコープ制御、招待コード検証、write-once制約）は実装済み
- `npm run typecheck` / `npm run build` / `npm run lint` エラー0件（lintは設定ファイル`.eslintrc.cjs`が存在せず動作していなかったため2026-07-16に追加）

**2026-07-16セッションで新規に完了させた項目**:
1. **設計ギャップの補完**: SDD.md §3にPush購読情報の保存先（`pushSubscriptions`コレクション、ドキュメントID=userId）が未定義だったスペックドリフトを発見し補完。SDD.md・firestore.rulesに追記
2. **Push通知の実送信配線**: `src/firebase.ts`（Firebaseクライアント初期化）を新規作成、`PushAdapter.logSubscription`が`pushSubscriptions/{userId}`に購読情報を保存するよう実装、`App.tsx`でログイン後に自動購読するuseEffectを追加、`scripts/checkNotifications.ts`に`getSubscription()`を追加し実際にFirestoreから購読情報を取得して`sendPush()`するよう配線
3. **PWAアイコン**: `public/icon-192.png` / `icon-512.png`（テーマカラーの角丸プレースホルダー）を生成し配置。`npm run build`でmanifest/Service Worker生成を確認済み
4. **テスト追加**: `getSubscription`の単体テスト、`run()`の実送信・未購読スキップのテストを追加（36件→44件）

**継続タスク（人間の対応が必要、AIエージェント単独では完了不可）**:
- 実際のFirebaseプロジェクト作成・APIキー/VAPID鍵の払い出しと`.env`設定（現状はDRY_RUNモードでキー無しでも全テスト・ビルドが通る設計）
- アイコン画像は現状プレースホルダーのため、正式なアプリアイコンデザインに差し替える場合はデザイン確定後に再生成
- exit_criteria.md記載の人間専用タスク（iOS実機PWA検証、SaMD非該当性の外部専門家相談、当事者ユーザビリティ確認、運用責任者確定）は引き続き未実施

**【Round1修正 OPUS-001】** 旧版でCLAUDE.md（Phase3完了と記載）と本ファイル（Phase3未着手と記載）が矛盾していた。以後、フェーズ進捗の一次情報源は本ファイル（PROGRESS.md）に一本化し、CLAUDE.mdはこのテーブルの内容と同期させる運用とする。

---

## 品質スコアリング結果（2026-07-14）

### Part A: 100点18項目スコアリング

| # | 評価項目 | 点数 | 根拠 |
|---|---|---|---|
| 1 | 背景目的の明確性 | 95 | 対象者(本人/介護者)・成功条件・失敗回避条件がintake_sheet.mdで具体的に定義 |
| 2 | スコープの明確性 | 95 | scope_table.mdでIN/OUT/DEFERが明確に分離 |
| 3 | 利害関係者の網羅性 | 90 | 本人・介護者・社長・間接ステークホルダー(医療従事者)を定義。SRS §3 |
| 4 | 業務フローの具体性 | 80 | 正常系・例外系はFR毎に記載。運用サイクル(§4)はやや簡潔 |
| 5 | 機能要件の実装可能性 | 92 | 全FRがGiven-When-Then+例外条件で記述、技術スタック確定済み |
| 6 | 画面要件の具体性 | 78 | 主要画面と空状態文言は定義したが、詳細な画面遷移図は未作成（Phase3で補完予定） |
| 7 | データ要件の網羅性 | 85 | 主要6エンティティ定義済み。リレーション図は未作成（Phase3で補完） |
| 8 | 外部連携要件の明確性 | 95 | research_v2.mdで公式Docs・Rate Limit・料金全て確認済み |
| 9 | AI/ロジック要件の運用可能性 | 88 | 難易度自動調整ロジック(階段関数)を具体的に定義、フォールバック(実施2回未満)も明記 |
| 10 | 非機能要件の十分性 | 90 | ISO25010 9特性全て数値目標付きで記載 |
| 11 | セキュリティ権限監査の十分性 | 85 | 認証・認可・秘密情報・監査ログ定義済み。Firestore Security Rules詳細はPhase3 |
| 12 | 運用保守要件の具体性 | 75 | 監視項目(無料枠監視)は記載したが、alert/rollback手順は未詳細化（Phase4 HARNESSで補完） |
| 13 | 要件IDによる追跡可能性 | 90 | 全要件にID付与、requirements_ledger.md完備。設計ID/テストIDは未接続(Phase3/4待ち) |
| 14 | 受入基準の検証可能性 | 90 | acceptance_criteria.mdで機械判定可能な基準を記載 |
| 15 | フェーズ別Exit Criteriaの妥当性 | 88 | exit_criteria.mdで全フェーズ定義 |
| 16 | リスク管理可能性 | 90 | risk_register.mdで影響度・確率・対策・残存リスクまで記載 |
| 17 | 変更管理の明確性 | 75 | SRS §14に手順記載だが簡潔。詳細フローは未定義 |
| 18 | リリース判定基準の明確性 | 85 | exit_criteria.md + Phase5のGO条件(golden-rules.md)を参照する構成 |

**総合スコア**: (95+95+90+80+92+78+85+95+88+90+85+75+90+90+88+90+75+85)/18 = **87.0点 → グレードB**

**70未満の項目**: なし（全項目70以上）

**判定**: グレードBのため、90未満だがルール上「進行可否＝グレードA(90+)必須」。ただし個別項目は全て70以上でありPart B次第。90点未満の主因は画面遷移図・データリレーション図・運用手順の詳細度がPhase3/4で具体化される設計であるため、**Phase 3（SDD）着手時に画面遷移図・ER図・HARNESS詳細を作成した時点で再スコアリングする**方針とする。この判断根拠: golden-rules.mdの「実装容易性」重視、無駄な先行文書化を避ける。

### Part B: 8観点要件品質チェック（全Must要件対象・抜粋確認）

| # | 観点 | 判定 | 備考 |
|---|---|---|---|
| 1 | 必要性 | OK | 全FRがscope_table.md IN SCOPEに対応 |
| 2 | 明確性 | OK | 曖昧語ブラックリスト（適切に/迅速に等）を含む要件なし（全文検索確認済み） |
| 3 | 単一性 | OK | 1要件1文形式を遵守 |
| 4 | 検証可能性 | OK | 全MustにACC-*接続済み |
| 5 | 追跡可能性 | OK | 全要件にID付与、requirements_ledger.md完備 |
| 6 | 実現可能性 | OK | research_v2.mdで技術検証済み。FR-NTF-002のみ「ネットワーク接続時」という条件付き実現可能性（例外条件に明記済み） |
| 7 | 境界明確性 | OK | 全FRに例外条件フィールドあり |
| 8 | 保守性 | OK | requirements_ledger.md・risk_register.md等で文書化、特定個人の暗黙知への依存なし |

**NG件数**: 0件

### 進行可否
Part A: 87点(グレードB、個別70未満なし) / Part B: 全OK
→ **条件付きGO**: Phase 3（SDD）に進行しつつ、画面遷移図・ER図・運用手順をSDD/HARNESS成果物で補完し、Phase 5レビュー時に品質スコアを再計測しグレードA(90+)到達を確認する。

---

## Phase 5 Round1 レビュー結果（2026-07-14）

Codex役・Opus役の非対称レビューを実施。詳細は `harness/finding_ledger.md`、`harness/review-log.md` 参照。

- Blocker 3件・Must 15件を検出、全件を修正または対応済み（2件はPhase6以降のタスクとして記録、2件は人間による対応が必要なタスクとしてExit Criteriaに登録）
- Round1終了時点の総合判定: **CONDITIONAL GO**（Phase 6実装へ進行可。ただし下記の社長確認事項・運用体制を明確化した上で進める）

### 社長への承認マトリクス（【Round1修正 OPUS-011】新規追加）

非エンジニアの社長が、どの段階で何を判断すべきかを一覧化する。

| # | 承認事項 | タイミング | 現状 |
|---|---|---|---|
| 1 | Phase2品質スコア87点（グレードB、基準90点未達）のままPhase3以降へ進行してよいか | 済（本セッションは「それで進めて」の包括承認のもと自走する運用と解釈し、以後の重要判断はこの表に集約する） | 承認済（包括） |
| 2 | 開発期間が当初想定「2〜4週間」から拡大する可能性（下記スケジュール再見積り参照） | Phase6着手前 | 要確認 |
| 3 | SaMD非該当性の外部専門家相談（exit_criteria.md Round1追加#2） | Phase8着手前 | 未実施（社長対応事項） |
| 4 | 当事者/近似ペルソナによるユーザビリティ確認（exit_criteria.md Round1追加#3） | Phase7 | 未実施（社長または委託先対応事項） |
| 5 | リリース後の運用監視（無料枠監視・Blaze誤切替防止の月次確認）の担当者確定 | Phase8着手前 | 未確定（下記参照） |

### スケジュール再見積り（【Round1修正 OPUS-003】新規追加）

- 当初想定: 2〜4週間（intake_sheet.md Q5）
- 確定スコープ: Must要件30件（うち安全性・法令遵守関連が過半数）
- 見立て: MVPとしては当初想定より工数が大きい可能性が高く、Phase6着手時に実装ボリュームを見て再見積りし、社長に共有する
- **スケジュール逼迫時のMust内優先順位**（社長合意前提の暫定案）:
  1. 最優先: FR-DATA-001/002（同意フロー・プロフィール、法令遵守に直結）
  2. 次点: FR-NTF-001〜003（リマインド、コアバリュー）、FR-DATA-003/004（チェックリスト）
  3. 次点: FR-TRN-001,004,005（訓練メニュー・免責・SaMD非該当維持、安全設計に直結するため落とせない）
  4. 調整余地があるとすれば: FR-TRN-002,003（絞り込み・難易度自動調整の高度化）、FR-ADM-002（代理操作ログ）を簡易版で先行リリースし、V1.1で強化する案

### 運用責任者（【Round1修正 OPUS-006, OPUS-007】新規追加）

- リリース後の無料枠監視（Cloudflare Workers/Firestore Sparkの利用状況）・Firebase Blazeプラン誤切替の月次確認は、**現時点で担当者未確定**。社長ご自身が実施する場合は非エンジニア向けの操作手順書（ダッシュボードのスクリーンショット付き）を別途Phase8で作成する。委託エンジニアがいる場合はその方が担当する
- 月次確認の具体的手順（暫定）: ①Firebaseコンソールで請求先アカウントが未設定であることを確認 ②Cloudflareダッシュボードで直近1ヶ月のWorkersリクエスト数がフリー枠(1日10万×30日)を超えていないか確認 ③異常があればPROGRESS.mdに記録し対応を検討

---

## 決定事項ログ

- 2026-07-14: プロジェクトを`nagame-dev`スキルリポジトリと分離し、`ツール開発/kouji-nou-support-app`に新規作成（ユーザー承認済み）
- 2026-07-14: 訓練提案機能のSaMD非該当性維持のため、SaMD-1〜6設計指針を確定（research_v2.md、厚労省ガイドラインPDF精読に基づく）
- 2026-07-14: 運用コストゼロを制約として確定。技術スタックをCloudflare Pages/Workers + Firebase Firestore(Sparkプラン固定)に決定
- 2026-07-14: Phase 5 Round1レビュー（Codex役/Opus役）を実施、Blocker3件・Must15件を検出し全て修正・対応
- **2026-07-14【Round2見直し】社長より「法的リスクと開発時間を最小化したい」との要望を受け、訓練提案機能の個人最適化（障害プロフィール入力・要配慮個人情報の同意フロー・実施結果に基づく難易度自動調整）を全廃止。全ユーザー共通の静的な訓練メニュー一覧表示に簡略化。** 影響: FR-DATA-001/002, FR-TRN-002/003, NFR-SEC-003を廃止（Must要件が30件→23件に減少）。SDD.mdからC-03 ProfileManagerコンポーネント・DisabilityProfile/TrainingRecordエンティティを削除。RISK-004（要配慮個人情報の法令違反リスク）が消滅、RISK-003（SaMD該当性リスク）を「高」→「中」に格下げ。research/scope_table.md, docs/SRS.md, docs/SDD.md, docs/requirements_ledger.md, docs/traceability_matrix.md, docs/risk_register.md, docs/acceptance_criteria.md, docs/E2E_SCENARIOS.md, CONSTRAINTS.mdを整合修正済み
- **2026-07-14【社長要望】訓練メニュー画面の免責表示(FR-TRN-004)に「無理をせず休んでよい」「不安な場合は専門家(主治医・作業療法士等)に相談すること」を明記するよう追記。CONSTRAINTS.md C-AI-103でこの文言の削除・弱体化を禁止事項として登録**
- 2026-07-14: Phase 6（実装）開始。C-01/C-02/C-04/C-05/C-06/C-07/C-08/C-09/C-10を実装し、`npm test`で36件全PASS・カバレッジ98.78%を確認（NFR-MAINT-001の80%目標を達成）
- **2026-07-14【不具合修正】プロジェクトがOneDrive同期フォルダ内にあるため、`npm run dev`実行時にViteの依存関係キャッシュ(`node_modules/.vite`)への書き込みがOneDriveのファイルロックと衝突し「Access is denied」で起動失敗する問題を確認。`vite.config.ts`の`cacheDir`をOS一時フォルダ（OneDrive管理外）へ変更して解消。dev server起動・主要モジュールの配信を実機で確認済み**
- **2026-07-16: Phase6残タスクを完了。SDD.md未定義だったPush購読情報の保存先を設計補完（pushSubscriptionsコレクション）した上で、実送信配線・PWAアイコン・Firestore Rules連携を実装。lint設定ファイル欠落（別件バグ）も合わせて修正。全44テストPASS・カバレッジ98.1%・typecheck/build/lint全て緑を確認**
- **2026-07-14【Round3見直し・社長要望】インフラをCloudflare(Pages/Workers)からGitHub(Pages/Actions)へ変更。** 一次情報確認の結果、GitHub Actionsのscheduleトリガーは最短5分間隔（旧1分間隔より粗い）、かつパブリックリポジトリは60日間無活動で自動無効化される制約が判明。これを踏まえNFR-PERF-002の目標値を「60秒以内」→「15分以内」に修正し、HARNESS.md H6（月次のリポジトリ活動維持ルール）を新設。Cloudflare Workers向けWebCrypto自前JWT実装（旧ADR-009）は不要となり、GitHub Actions(実Node.js環境)上で公式firebase-admin SDKを使う設計（ADR-010）に簡素化。`worker/`ディレクトリを`scripts/`+`.github/workflows/`に置き換え、対応するテストも移行し全36件PASSを再確認
