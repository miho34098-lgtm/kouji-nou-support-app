# 設計書（SDD） — kouji-nou-support-app

IEEE 1016準拠。SRS（`docs/SRS.md`）の全要件を実装可能な設計に変換する。

---

## 1. 論理ビュー（コンポーネント構成）

**【Round2見直し 2026-07-14】** 訓練提案のパーソナライズ廃止（SRS §7.3, §7.7参照）に伴い、C-03 ProfileManagerコンポーネントおよびDisabilityProfile/TrainingRecordエンティティを削除した。C-06 TrainingEngineは静的JSON（`src/data/trainingMenus.json`）を返すだけの単純な読み取り専用コンポーネントに縮小される。

### コンポーネント一覧

| ID | コンポーネント名 | 責務 | 依存先 | 対応要件 |
|---|---|---|---|---|
| C-01 | AuthService | Firebase Authenticationのラップ、ロール判定 | Firebase Auth SDK | FR-USR-001, FR-AUTH-001 |
| C-02 | ProxyAccessManager | 招待コード発行/検証、介護者-本人紐付け、代理操作ログ記録 | C-01, C-10 | FR-USR-002, FR-ADM-001, FR-ADM-002 |
| ~~C-03~~ | ~~ProfileManager~~ | 【Round2廃止】要配慮個人情報を収集しない方針のため削除 | - | - |
| C-04 | ScheduleManager | 予定・服薬のCRUD、見逃し予定の抽出 | C-10 | FR-NTF-001, FR-NTF-003 |
| C-05 | ChecklistManager | チェックリスト項目CRUD、完了トグル | C-10 | FR-DATA-003, FR-DATA-004 |
| C-06 | TrainingEngine（Round2簡略化） | 静的訓練メニュー(trainingMenus.json)の読込・カテゴリ別整形のみ。パーソナライズ・難易度調整ロジックなし | C-10 | FR-TRN-001, FR-TRN-004, FR-TRN-005 |
| C-07 | NotificationClient | Service Worker登録、Push購読、通知表示、音声読み上げ | ブラウザAPI | FR-NTF-002, FR-NTF-004 |
| C-08 | PWAShell | Web App Manifest、インストール検知、オンボーディング制御 | ブラウザAPI | FR-SYS-001, FR-SYS-002 |
| C-09 | SyncEngine | IndexedDB⇄Firestoreの差分同期、競合解決(最終更新優先) | C-10, Firestore SDK | FR-SYS-003, FR-SYS-004 |
| C-10 | LocalStore | Dexie.js(IndexedDB)ラッパー、全コンポーネント共通のデータアクセス層 | Dexie.js | 全FR（データ永続化基盤） |
| CW-01 | NotificationCheckJob（GitHub Actions、別実行環境）【Round3: 旧PushScheduler/Cloudflare Workerから改称】 | scheduleトリガー(5分間隔)で期限到来予定を検出しVAPID Push送信 | firebase-admin SDK, web-push, Push Service | FR-NTF-002 |

**【Round3修正】GitHub Actionsは実Node.js環境のため、CW-01は公式`firebase-admin` SDKで直接Firestoreにアクセスする。ADR-010参照（ADR-009のWebCrypto自前JWT実装は廃止）。**

### コンポーネント間の依存関係

```
UI(React Components)
  ├→ C-01 AuthService
  ├→ C-02 ProxyAccessManager ─→ C-01, C-10
  ├→ C-04 ScheduleManager ────→ C-10
  ├→ C-05 ChecklistManager ───→ C-10
  ├→ C-06 TrainingEngine ─────→ C-10（静的JSON読込のみ、Round2簡略化）
  ├→ C-07 NotificationClient ─→ ブラウザPush API
  └→ C-08 PWAShell ───────────→ ブラウザ Manifest API

C-10 LocalStore ⇄ C-09 SyncEngine ⇄ Firestore SDK

（別実行環境・サーバーサイド）
CW-01 PushScheduler ─→ Firestore REST API（読取: 期限到来予定の検索／書込: notifiedフラグのトランザクション更新） ─→ Push Service（VAPID送信）
```

**【Round1修正 CX-02】上図の通り、CW-01はFirestoreに対し読取専用ではなく「notifiedフラグの更新」という限定的な書込権限を持つ。旧記述「読取専用」は誤りであり本版で訂正した。**

### インターフェース定義（抜粋）

| コンポーネント | 公開関数 | 入力 | 出力 | エラー時の振る舞い |
|---|---|---|---|---|
| C-06 TrainingEngine | `getMenus()` | なし | TrainingMenu[]（全カテゴリ、パーソナライズなし） | trainingMenus.json読込失敗時は空配列＋エラー表示（例外にしない） |
| C-09 SyncEngine | `sync()` | なし | Promise\<SyncResult\> | オフライン時はno-op、オンライン復帰時に自動リトライ（CC-01） |
| CW-01 PushScheduler | `onScheduledEvent()` | Cron trigger | なし（副作用としてPush送信） | Firestore読取失敗時は次回Cron実行まで待機、アラートなし（MVPでは監視省略） |
| CW-01 NotificationCheckJob | `claimAndSend(scheduleId)` | scheduleId | boolean（claim成功可否） | Firestoreの`runTransaction`で`notified==false`を前提条件とした条件付き更新を行い、成功した場合のみPush送信する（CX-03対応: GitHub Actionsの重複実行による二重送信を防止） |

---

## 2. プロセスビュー（フロー/並行性）

### メインフロー（アプリ起動時）

1. PWAShell(C-08)がインストール状態を検知。未インストールならFR-SYS-002のオンボーディングを表示
2. AuthService(C-01)がFirebase Auth状態を確認。未ログインならログイン画面へ
3. LocalStore(C-10)からローカルデータ（予定・チェックリスト・プロフィール等）を読み込みUIを描画（オフラインでも即座に表示可能）
4. オンラインの場合、SyncEngine(C-09)がバックグラウンドでFirestoreと差分同期
5. ScheduleManager(C-04)が見逃し予定を抽出しキャッチアップ表示（FR-NTF-003）

### Push通知フロー（サーバーサイド、クライアントと独立）

1. GitHub Actions（CW-01 NotificationCheckJob）がscheduleトリガー（**5分間隔**、Round3改訂）で起動
2. Firestoreの`schedules`コレクションを`datetime <= now`かつ`notified == false`で検索
3. 該当予定ごとにVAPID Push通知を送信し、`notified = true`に更新
4. クライアント側はService Worker（C-07が登録）がPushイベントを受信し`showNotification()`を呼ぶ

### 並行処理

- 本人・介護者が同時に同一データを編集する可能性がある → SyncEngineは`最終更新時刻(updatedAt)`が新しい方を優先する楽観的ロック方式（FR-SYS-004例外条件）
- Push送信はGitHub Actions側で1予定1回のみ（`notified`フラグによる冪等性担保、CC-05）

### エラーハンドリングフロー

- Firestore書き込み失敗（オフライン等） → IndexedDBのoutboxキューに保持 → オンライン復帰時に最大3回リトライ（CC-01）
- Push送信失敗（購読期限切れ等） → CW-01はエラーログを出力し当該予定はキャッチアップ表示（FR-NTF-003）に委ねる
- 認証エラー → ログイン画面へリダイレクト、ローカルデータの閲覧は継続可能（読み取り専用モード）

---

## 3. データビュー（モデル/ER）

### データモデル

| エンティティ | 属性 | 型 | 制約 |
|---|---|---|---|
| User | userId, role, linkedUserId, email, createdAt | string, enum(本人/介護者), string\|null, string, datetime | role必須、介護者はlinkedUserId必須 |
| Schedule | scheduleId, userId, datetime, title, type, completed, notified, updatedAt | string, string(FK), datetime, string, enum(一般/服薬), boolean, boolean, datetime | title 1文字以上 |
| ChecklistItem | itemId, userId, title, frequency, updatedAt | string, string(FK), string, enum(毎日/曜日指定) | title 1文字以上 |
| ChecklistLog | logId, itemId, completedAt, undone | string, string(FK), datetime, boolean | - |
| ~~DisabilityProfile~~ | 【Round2廃止】要配慮個人情報を収集しないため削除 | - | - |
| ~~TrainingRecord~~ | 【Round2廃止】難易度自動調整廃止に伴い削除。訓練メニューは`trainingMenus.json`の静的データのみ | - | - |
| ProxyLog | logId, actorUserId, targetUserId, action, diff, timestamp | string, string(FK), string(FK), string, json, datetime | 90日でTTL削除（最大数十時間の遅延あり、CX-19） |
| PushSubscription【Phase6追加】 | userId(PK), endpoint, keys(p256dh, auth), updatedAt | string(FK), string, object, datetime | ブラウザPush APIの`PushSubscription.toJSON()`をそのまま保存。1ユーザー1台分のみ保持（再購読で上書き、MVPスコープ） |

### ER関係

```
User(本人) 1───N Schedule
User(本人) 1───N ChecklistItem ──1───N ChecklistLog
User(介護者) N───1 User(本人)  [linkedUserId]
ProxyLog N───1 User(actor)
ProxyLog N───1 User(target)
User 1───1 PushSubscription [userId]（トップレベルコレクション、schedules/checklistItemsと同様にuserIdで対応付け。ドキュメントIDはuserId自体）

（TrainingMenuはDBエンティティではなくsrc/data/trainingMenus.jsonの静的データ。Userとの関連なし）
```

### 保存方式

- ローカル: Dexie.js（IndexedDB）。テーブル名はエンティティ名の複数形（schedules, checklistItems等）
- クラウド: Firestore。コレクション構成はローカルDexieテーブルと1:1対応させ同期ロジックを単純化する
- 認証情報: Firebase Authentication（パスワードは自前保存しない）

### データライフサイクル

- Schedule/ChecklistItem: アカウント削除まで無期限保持
- ProxyLog: 90日でTTL削除（Firestore TTLポリシー機能を利用、追加コストなし）。**【Round1修正 CX-19】Firestore TTLは即時実行を保証せず、実際の削除まで最大数十時間の遅延がある仕様のため、「90日+遅延あり」として扱う**
- **【Round2修正】DisabilityProfileの同意管理は不要となったため、CX-16のwrite-once制約は対象データ自体がなくなり適用対象外となる**
- **【Phase6追加・設計ギャップ補完】** CW-01がFR-NTF-002のPush送信対象を特定するための購読情報保存先がSDD初版で未定義だった（スペックドリフト）。`pushSubscriptions`コレクション（ドキュメントID=userId）として定義し補完する。クライアント（C-07 NotificationClient経由）は自分のuidに対してのみ書込可、CW-01はfirebase-admin SDK経由で全件読取可（Security Rulesをバイパスするサーバー側処理のため）

---

## 4. 物理ビュー（デプロイ構成）

### 実行環境【Round3改訂】

- クライアント: モバイルブラウザ（iOS Safari 16.4+ / Android Chrome最新2バージョン）、PWAとしてホーム画面にインストール
- ビルド: Node.js 18+（GitHub Actions runnerはNode.js 20）、Vite 5+
- サーバーサイド: GitHub Actions（scheduleトリガー、5分間隔、無料枠）

### デプロイ方法【Round3改訂】

- フロントエンド: `.github/workflows/deploy-pages.yml`により、mainブランチへのpush時に`npm run build` → GitHub Pagesへ自動デプロイ（追加コストなし）
- NotificationCheckJob: `.github/workflows/notification-check.yml`によりGitHub Actions上で`scripts/checkNotifications.ts`を5分間隔実行

### C4モデル: Container図【Round3改訂】

| Container | 技術 | 責務 |
|---|---|---|
| PWA Client | React + Vite + Dexie.js | UI描画、ローカルデータ管理、オフライン動作 |
| GitHub Pages | 静的ホスティング | PWAアセット（HTML/JS/CSS/Manifest）配信 |
| GitHub Actions (NotificationCheckJob) | Node.js 20 + firebase-admin + web-push、scheduleトリガー | 予定監視、VAPID Push送信（5分間隔） |
| Firebase Firestore | NoSQLデータベース（Sparkプラン） | クラウドデータ永続化・同期 |
| Firebase Authentication | 認証基盤 | ユーザー認証 |

### C4モデル: Component図（PWA Client内部）

論理ビューのコンポーネント一覧（C-01〜C-10）と同一。

### ディレクトリ構成

```
kouji-nou-support-app/
├── src/
│   ├── main.tsx                 # エントリポイント
│   ├── App.tsx
│   ├── components/               # UIコンポーネント（画面単位）
│   │   ├── Onboarding/
│   │   ├── Home/
│   │   ├── Schedule/
│   │   ├── Checklist/
│   │   └── Training/
│   ├── services/                 # C-01〜C-09 のロジック実装
│   │   ├── authService.ts
│   │   ├── proxyAccessManager.ts
│   │   ├── scheduleManager.ts
│   │   ├── checklistManager.ts
│   │   ├── trainingEngine.ts
│   │   ├── notificationClient.ts
│   │   ├── pwaShell.ts
│   │   └── syncEngine.ts
│   ├── store/
│   │   └── localStore.ts         # C-10 Dexie.jsラッパー
│   ├── adapters/                 # 外部サービスアダプター（DRY_RUN対応）
│   │   ├── firestoreAdapter.ts
│   │   └── pushAdapter.ts
│   ├── data/
│   │   └── trainingMenus.json    # 公的ガイドライン準拠の訓練メニュー定義（静的データ）
│   └── config.ts                 # 環境変数の一元管理
├── scripts/                       # NotificationCheckJob (CW-01, GitHub Actions実行)【Round3改訂】
│   ├── checkNotifications.ts
│   └── runCheckNotifications.ts   # エントリポイント
├── .github/workflows/
│   ├── notification-check.yml     # scheduleトリガー(5分間隔)
│   └── deploy-pages.yml           # GitHub Pagesへのデプロイ
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   └── manifest.webmanifest
├── docs/
│   ├── SRS.md / SDD.md / TEST_PLAN.md / E2E_SCENARIOS.md
├── harness/
│   └── HARNESS.md 他
├── CLAUDE.md
├── CONSTRAINTS.md
└── PROGRESS.md
```

---

## 5. ADR（Architecture Decision Record）

### ADR-001: フロントエンドフレームワークにReact + Viteを採用
- **状態**: 承認
- **決定**: React 18 + Vite 5 + TypeScriptで実装する
- **理由**: vite-plugin-pwaによるゼロコンフィグPWA対応、エコシステムの充実（research_v1.md A1参照）
- **代替案**: | Next.js | SSR対応 | サーバー実行環境が必要でコストゼロ制約と相性が悪い | 不採用（静的配信のみで完結するVite構成を優先） |
- **変更禁止レベル**: L3-柔軟
- **影響を受ける要件**: 全FR

### ADR-002: ローカルDBにDexie.js(IndexedDB)を採用
- **状態**: 承認
- **決定**: オフラインデータ永続化にDexie.jsを採用する
- **理由**: research_v1.md C1でStar 14.5k・活発なメンテナンスを確認済み、オフラインファースト設計に最適
- **代替案**: | 素のIndexedDB API | 依存ゼロ | ボイラープレートが多く保守性が低い | 不採用 |
- **変更禁止レベル**: L2-慎重
- **影響を受ける要件**: FR-SYS-003, NFR-REL-001

### ADR-003: ホスティングにGitHub Pagesを採用【Round3改訂 2026-07-14】
- **状態**: 承認（Cloudflare Pagesから変更）
- **決定**: 静的アセット配信にGitHub Pagesを採用する
- **理由**: 社長要望により、インフラをGitHubに統一する。GitHub Pagesは商用主目的サイトを禁止しているが、本アプリは非商用の個人向け生活支援アプリであり該当しない。帯域は月100GB(ソフト上限)で本アプリの想定トラフィックには十分。GitHub Actionsによるビルド・デプロイと合わせてGitHubエコシステムに一本化できる
- **旧決定（廃止）**: Cloudflare Pages（ADR-003旧版、Round1で承認）。Round3で社長の要望によりGitHubへ統一するため置き換え
- **代替案**: | Cloudflare Pages | 帯域実質無制限・レイテンシ良好 | GitHubと管理エコシステムが分かれる、社長の希望と不一致 | 不採用（Round3） | Vercel Hobby | DXが良い | 非商用限定規約 | 不採用 |
- **変更禁止レベル**: L2-慎重（社長要望により変更履歴あり）
- **影響を受ける要件**: 全FR（配信基盤）、制約条件「運用コストゼロ」

### ADR-004: Push通知基盤にGitHub Actions（スケジュール実行）+ web-pushライブラリを採用【Round3改訂 2026-07-14】
- **状態**: 承認（Cloudflare Workersから変更）
- **決定**: Push送信はGitHub Actionsのscheduleトリガー（5分間隔）で起動するNode.jsスクリプト（`scripts/checkNotifications.ts`）で行い、VAPID送信には実装が枯れたOSS `web-push` ライブラリ(research_v1.md B2参照)を使用する
- **理由**: 社長要望によりCloudflareを使わずGitHubに統一。GitHub Actionsは無料枠内（パブリックリポジトリは無制限分、プライベートは月2,000分）でスケジュール実行が可能
- **旧決定（廃止）**: Cloudflare Workers + VAPID自前実装（ADR-004旧版）。GitHub Actionsは実Node.js環境で動作するため、Cloudflare Workers(V8 isolate)向けに自前実装したWebCrypto JWT署名（ADR-009旧版）が不要になり、公式`firebase-admin` SDKをそのまま使える
- **重大な制約（要注意）**: GitHub Actionsのscheduleトリガーは**最短5分間隔**（Cloudflare Workersの1分間隔より粗い）。高負荷時は数分〜それ以上遅延する場合がある（GitHub公式ドキュメント確認済み）。またパブリックリポジトリでは**60日間リポジトリに活動がないとスケジュール実行が自動的に無効化される**
- **対策**: ①NFR-PERF-002の目標値を「60秒以内」から「15分以内(目標)」に修正 ②60日間無効化対策として`workflow_dispatch`トリガーを併設し、月次確認作業(PROGRESS.md参照)の一環で手動実行するか、リポジトリの定期的な活動で自動無効化を防ぐ
- **代替案**: | Cloudflare Workers | 1分間隔、低レイテンシ | 社長の希望と不一致 | 不採用（Round3） | Firebase Cloud Functions | メッセージ配信に強い | Blazeプラン必須で予算制約(ADR-005)と矛盾 | 不採用 |
- **変更禁止レベル**: L2-慎重
- **影響を受ける要件**: FR-NTF-002, NFR-PERF-002

### ADR-005: クラウドDBにFirebase Firestore Sparkプラン固定を採用
- **状態**: 承認
- **決定**: Firestoreを採用するが、**Blazeプランへは意図的にアップグレードしない**運用ルールを設計に組み込む
- **理由**: Sparkプランの無料枠超過時の挙動は「ブロックのみ（自動課金なし）」と確認済み（research_v2.md）。Blaze誘導機能（電話番号認証等）は使用しない
- **代替案**: | Supabase | 容量に余裕 | 7日間無操作でプロジェクト自動休止、生活支援アプリの利用パターンと相性が悪い | 不採用 |
- **変更禁止レベル**: L1-不変（予算制約に直結、CONSTRAINTS.mdに反映）
- **影響を受ける要件**: FR-DATA全般、制約条件「運用コストゼロ」

### ADR-006: 訓練メニューは静的JSON管理とし、独自アルゴリズムによる自由生成は行わない
- **状態**: 承認
- **決定**: 訓練メニューコンテンツは`src/data/trainingMenus.json`に公的ガイドライン（国立障害者リハビリテーションセンター等）準拠の内容を静的定義し、AIによる動的生成は行わない
- **理由**: SaMD該当性判定（research_v2.md）において、フローチャート③C「利用者への情報提供のみ」のYES条件を維持するため。独自アルゴリズムでの疾病候補判定はSaMD-3制約により禁止
- **代替案**: | LLMによる動的メニュー生成 | 柔軟性が高い | 誤った訓練提案リスク、SaMD該当性リスクが高まる | 不採用（Q3-a確定事項） |
- **変更禁止レベル**: L1-不変（法令遵守に直結）
- **影響を受ける要件**: FR-TRN-001, FR-TRN-005

### ADR-007: 難易度調整に階段関数（2U1D方式）を採用
- **状態**: **廃止（Round2見直し 2026-07-14）** — 訓練提案のパーソナライズ自体を廃止したため、本ADRで決定した難易度調整ロジックは実装しない。設計判断の記録としては保持する
- **決定**: TrainingEngineの難易度調整は「2回連続完了で難易度+1、1回未完了で難易度-1」の機械的ルールで実装する
- **理由**: research_v1.md C12で確認した階段関数（2U1D）はリハビリ分野で実証された代表的手法。AIによる推論ベースの調整より説明可能性が高く、SaMD-6制約（医学的評価を行わない）にも合致する
- **代替案**: | AI/強化学習による適応 | 個人最適化の精度が高い可能性 | ブラックボックス化しSaMD該当性リスクが高まる、実装コストも増大 | 不採用 |
- **変更禁止レベル**: L2-慎重
- **影響を受ける要件**: FR-TRN-003

### ADR-008: 認証はFirebase Authenticationのメール/パスワード方式のみ採用
- **状態**: 承認
- **決定**: 認証方式はメール/パスワードのみとし、電話番号認証等のBlazeプラン誘導機能は使用しない
- **理由**: ADR-005のSparkプラン固定方針と整合させるため
- **代替案**: | 電話番号認証 | 本人確認の信頼性が高い | Blazeプランへの誘導リスク | 不採用 |
- **変更禁止レベル**: L1-不変（予算制約に直結）
- **影響を受ける要件**: FR-AUTH-001

### ADR-009: 【廃止・Round3】CW-01のFirestoreアクセスはFirestore REST API + サービスアカウントJWT方式を採用
- **状態**: **廃止（Round3見直し 2026-07-14）** — Cloudflare Workers(V8 isolate)からGitHub Actions(実Node.js環境)へ移行したため、本ADRのWebCrypto自前JWT実装は不要になった。後継はADR-010
- 設計判断の記録としては保持する

### ADR-010: NotificationCheckJobはGitHub Actions上でfirebase-admin SDKを直接使用する【Round3新規 2026-07-14】
- **状態**: 承認
- **決定**: `scripts/checkNotifications.ts`は、GitHub Actionsランナー（実Node.js環境）上で公式`firebase-admin`パッケージを使い、Firestoreへ直接アクセスする
- **理由**: ADR-004の変更に伴い実行環境がV8 isolate(Cloudflare Workers)から実Node.js(GitHub Actions)になったため、Admin SDKがそのまま利用可能になり、ADR-009の自前JWT実装より大幅に単純化・低リスク化できる
- **セキュリティ**: サービスアカウントの認証情報（JSON鍵）はGitHub Actions Secrets（`FIREBASE_SERVICE_ACCOUNT_JSON`）で管理し、コードやリポジトリに含めない。Firestoreのみへの最小権限ロールを付与し、年1回を目安にローテーションする（CX-18の考え方を踏襲）
- **冪等性**: Firestoreの`runTransaction`を用いた`claimAndSend`で、`notified`フラグを前提条件とした排他制御を行う（CX-03と同じ設計思想）
- **変更禁止レベル**: L2-慎重
- **影響を受ける要件**: FR-NTF-002

---

## 6. 横断的ルール（Cross-Cutting Concerns）

| # | ルール | 内容 | 適用範囲 |
|---|---|---|---|
| CC-01 | エラーハンドリング | 全外部呼び出し(Firestore/Push)にtry-catch、リトライ最大3回。失敗時はIndexedDB outboxキューに保持 | C-09, CW-01 |
| CC-02 | ログ出力 | 処理開始/終了/エラーをログ出力。パスワード等の機密情報は含めない | 全コンポーネント |
| CC-03 | 設定値管理 | クライアント側Firebase設定・VAPID公開鍵は`.env`(gitignore対象)。**NotificationCheckJobのサービスアカウント鍵・VAPID秘密鍵はGitHub Actions Secretsで管理し.envやリポジトリに含めない**（CX-18、Round3改訂） | config.ts, .github/workflows/*.yml |
| CC-04 | 入力バリデーション | 全フォーム入力をクライアント側とFirestore Security Rulesの両方で検証 | 境界コンポーネント(C-01〜C-06) |
| CC-05 | 冪等性 | チェックリスト完了操作はトグル型で冪等。Push送信は`notified`フラグに対するFirestoreトランザクション条件付き更新（claimAndSend）で重複送信を防止（CX-03） | C-05, CW-01 |

---

## 7. アダプターパターン + DRY_RUN設計

```typescript
// src/adapters/pushAdapter.ts の構造例（クライアント側、Vite/ブラウザ実行）
class PushAdapter {
  async send(subscription: PushSubscription, payload: NotificationPayload) {
    if (import.meta.env.VITE_DRY_RUN === "true") {
      console.log("[DRY_RUN] Push would be sent:", payload);
      return { success: true, dryRun: true };
    }
    return this._realSend(subscription, payload);
  }
}
```

```typescript
// scripts/checkNotifications.ts の構造例（GitHub Actions実行、Node.js環境）【Round3改訂】
// クライアントのVITE_DRY_RUNとは別経路。GitHub Actions Secrets/Variablesで注入されるprocess.env.DRY_RUNを使用する
export async function run(env: JobEnv) {
  if (env.DRY_RUN === "true") {
    console.log("[DRY_RUN] NotificationCheckJob would scan Firestore and send push notifications");
    return;
  }
  // 実際のfirebase-admin経由のFirestoreアクセス・web-push送信
}
```

- **PushAdapter（クライアント）**: `VITE_DRY_RUN=true`でモックログのみ出力、実際のPush送信を行わない
- **NotificationCheckJob（GitHub Actions）**: `DRY_RUN=true`（リポジトリVariablesとして設定、デフォルト値）でFirestoreスキャン・Push送信をスキップしログのみ出力
- **FirestoreAdapter**: テスト環境ではFirebase Local Emulator Suite（無料）を使用し、本番Firestoreに書き込まない
- APIキー・VAPID鍵が未設定でもDRY_RUNモードでアプリが起動・テスト可能（キーオプショナル設計）

---

## 8. トレーサビリティマトリクス

→ `docs/traceability_matrix.md` 参照
