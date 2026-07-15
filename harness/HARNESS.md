# HARNESS（安全ハーネス仕様） — kouji-nou-support-app

**【Round3見直し 2026-07-14】** インフラをCloudflare(Pages/Workers)からGitHub(Pages/Actions)へ移行。詳細はSDD.md ADR-003, ADR-004, ADR-010参照。

## H1: DRY_RUN
- **環境変数はクライアントとNotificationCheckJobで別経路**: クライアント(Vite)は`VITE_DRY_RUN`、NotificationCheckJob(GitHub Actions)は`DRY_RUN`（リポジトリVariables `vars.DRY_RUN`、本番は`false`に変更）
- デフォルト: 両方とも`true`
- 切り替え: クライアントは`.env`で`VITE_DRY_RUN=false`、NotificationCheckJobはGitHubリポジトリのSettings > Secrets and variables > Actions > Variablesで`DRY_RUN=false`を明示的に設定（本番デプロイ時のみ）
- 対象: PushAdapter/NotificationCheckJob（実際のPush送信をしない）、FirestoreAdapter（本番Firestoreへの書き込みをせずFirebase Local Emulator Suiteを使用）

## H2: 承認ゲート
- 対象操作: Firebase Blazeプランへのアップグレードにつながりうる設定変更、本番Firestore Security Rulesのデプロイ、GitHub Actions Secretsの変更、`DRY_RUN=false`への切替
- 未承認時の動作: これらの操作はCLAUDE.md PART D「絶対禁止事項」に基づき、実行前に必ず人間の確認を得る（自動実行しない）

## H3: 冪等性
- **Push送信**: `Schedule.notified`フラグの単純な事前チェックだけでは、GitHub Actionsの重複実行や手動`workflow_dispatch`との重なりで二重送信するリスクがある。そのため`claimAndSend(scheduleId)`（SDD.md §1, ADR-010参照）でFirestoreの`runTransaction`による条件付き更新（`notified==false`を前提条件として`notified=true`に更新、失敗したら送信しない）を用いて排他制御する
- チェックリスト完了: トグル型実装のため、同じ操作を2回実行しても最終状態は決定的（FR-DATA-004のUndo含む）
- 招待コード紐付け: 既に紐付け済みの介護者が同じコードを再入力した場合、エラーではなく現状維持を返す

## H4: キルスイッチ
- 開発時: Ctrl+C（SIGINT）でVite dev serverをグレースフル停止
- 本番: GitHub Pagesは`.github/workflows/deploy-pages.yml`の再実行（前コミットへのrevert push）でロールバック可能（デプロイ履歴はGit履歴そのもの、追加コストなし）
- NotificationCheckJob: GitHub Actionsのリポジトリ設定からワークフロー自体を無効化（Disable workflow）することで即座に停止可能
- Firestore: 異常な書き込み急増を検知した場合、Firestore Security Rulesで書き込みを一時的に全拒否する緊急ルールを用意（Phase6で実装、平常時は無効）

## H5: 監査ログ
- ProxyLog: 介護者の代理操作を90日間記録（アクター・対象・操作内容・日時、FR-ADM-002）。Firestore TTLポリシーで自動削除（追加コストなし）。TTL削除は即時実行を保証せず最大数十時間の遅延がある仕様のため「90日+遅延あり」として扱う
- NotificationCheckJobログ: GitHub Actionsの実行ログ（Actionsタブから確認可能、標準保持期間90日）にPush送信の成功/失敗を記録
- **サービスアカウント鍵の管理**: NotificationCheckJob（ADR-010）が使用するFirebaseサービスアカウントJSON鍵はGitHub Actions Secrets（`FIREBASE_SERVICE_ACCOUNT_JSON`）で暗号化保存し、リポジトリ・`.env`には含めない。Firestoreに対する最小権限ロールのみ付与する。年1回を目安に鍵をローテーションし、ローテーション実施日をPROGRESS.mdに記録する
- ローテーション: ProxyLogは90日、GitHub Actionsログは標準保持期間90日に従う（無料プランのため長期保管はしない）

## H6: スケジュール実行の可用性維持【Round3新規】
- **リスク**: GitHub Actionsのscheduleトリガーは、パブリックリポジトリで60日間リポジトリへの活動（push, PR等）がないと自動的に無効化される（GitHub公式ドキュメント確認済み）
- **対策**: `.github/workflows/notification-check.yml`に`workflow_dispatch`トリガーを併設。月次確認作業（PROGRESS.md「運用責任者」欄参照）の一環として、60日以内に必ず1回はリポジトリへのpushまたは手動実行(workflow_dispatch)を行う運用ルールとする

---

## DRY_RUNの動作仕様

```
VITE_DRY_RUN=true（デフォルト、クライアント）:
  - Push通知は実際に送信しない（コンソールに[DRY_RUN]ログのみ出力）
  - Firestoreへの書き込みはFirebase Local Emulator Suiteに対して行う
  - UIの動作は本番と同一（モックデータで全機能を確認可能）

VITE_DRY_RUN=false（クライアント、本番のみ）:
  - 実際のPush購読・本番Firestoreへの書き込みが発生

DRY_RUN=true（デフォルト、GitHub Actions/NotificationCheckJob）:
  - Firestoreスキャン・Push送信を行わずログのみ出力

DRY_RUN=false（GitHub Actions、本番のみ）:
  - 実際のFirestoreスキャン・web-push送信が発生
  - 明示的にリポジトリVariablesで設定しない限りfalseにならない
```
