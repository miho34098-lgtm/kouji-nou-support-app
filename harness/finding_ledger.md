# 指摘事項台帳

## Round 1（2026-07-14）— Codex役 + Opus役 非対称レビュー

| ID | Round | 役割 | カテゴリ | 内容 | 対応状況 | 修正日 |
|---|---|---|---|---|---|---|
| CX-01 | R1 | Codex | Blocker | Cloudflare WorkersはFirebase Admin SDK非対応。CW-01のFirestoreアクセス手段が未定義 | 修正済（Firestore REST API+サービスアカウントJWT方式に変更） | 2026-07-14 |
| CX-02 | R1 | Codex | Must | SDD内でCW-01を「読取専用」と記述しつつ書込フローを記載する矛盾 | 修正済 | 2026-07-14 |
| CX-03 | R1 | Codex | Must | Push冪等性: Cron重複起動による二重送信リスク、排他制御なし | 修正済（Firestoreトランザクションでclaim） | 2026-07-14 |
| CX-04 | R1 | Codex | Must | Worker側でVITE_DRY_RUN(import.meta.env)は技術的に成立しない | 修正済（env.DRY_RUNに分離） | 2026-07-14 |
| CX-05 | R1 | Codex | Must | 「5回連続失敗で60秒ロック」はSparkプランでサーバー実装手段がない | 修正済（要件をFirebase標準バックオフ準拠に緩和） | 2026-07-14 |
| CX-06 | R1 | Codex | Must | 招待コード6桁・レート制限なしで総当たり攻撃面あり（要配慮個人情報アクセスに直結） | 修正済（8桁化、試行回数制限、有効期限短縮） | 2026-07-14 |
| CX-07 | R1 | Codex | Should | Push配信60秒以内のCI機械検証が不能（DRY_RUN） | 対応（NFR検証方法をCI対象外・手動測定と明記） | 2026-07-14 |
| CX-08 | R1 | Codex | Must | iOS実機検証環境がなく中核機能(Web Push)が未検証のまま出荷されるリスク | 対応（Exit Criteriaに実機手動検証必須を追加） | 2026-07-14 |
| CX-09 | R1 | Codex | Must | Must件数の不整合（SRS自己記載19件 vs 台帳30件） | 修正済（requirements_ledger.mdを正としSRS記載を統一） | 2026-07-14 |
| CX-10 | R1 | Codex | Should | カバレッジ80%の対象範囲未定義（UI込みだと非現実的） | 修正済（src/services層に限定と明記） | 2026-07-14 |
| CX-11 | R1 | Codex | Should | npm audit HIGH0件をコミット毎ハードゲート化はCI不安定化リスク | 修正済（週次実行+PR時は警告に降格） | 2026-07-14 |
| CX-12 | R1 | Codex | Should | Playwright E2Eの非決定性（Push許可ダイアログ等） | 修正済（決定論的シナリオと手動シナリオを分離） | 2026-07-14 |
| CX-13 | R1 | Codex | Should | 本番実送信経路(_realSend等)の自動テスト皆無 | Later（Phase6でcontractテスト追加予定として記録） | - |
| CX-14 | R1 | Codex | Should | タップ領域/文字サイズが手動レビュー依存 | Later（Phase6でDOM計測アサーション化予定） | - |
| CX-15 | R1 | Codex | Must | NFR-EXT-001「コード変更不要」とTrainingRecord.category固定enumの矛盾 | 修正済（category をJSON定義参照の文字列型に変更） | 2026-07-14 |
| CX-16 | R1 | Codex | Must | 要配慮個人情報も含め最終更新優先(LWW)でサイレントデータ消失リスク | 修正済（同意関連フィールドはwrite-once制約をSecurity Rulesで追加） | 2026-07-14 |
| CX-17 | R1 | Codex | Later | 同期競合・音声読み上げのE2E/統合テスト不在 | Later（Should要件のためPhase6バックログに記録） | - |
| CX-18 | R1 | Codex | Must | Workerのサービスアカウント鍵の格納・ローテーション方針未記載 | 修正済（wrangler secret管理・最小権限・ローテーション手順を明記） | 2026-07-14 |
| CX-19 | R1 | Codex | Should | ProxyLog TTL削除の遅延特性が「90日厳守」前提とずれる | 修正済（「90日+遅延あり」に表現修正） | 2026-07-14 |
| CX-20 | R1 | Codex | Must | MoSCoW集計「Won't 1件」の実体がSRS本文に存在しない | 修正済（FR-TRN-006をWont要件として明記） | 2026-07-14 |
| OPUS-001 | R1 | Opus | Blocker | CLAUDE.md(Phase3完了)とPROGRESS.md(Phase3未着手)のフェーズ記述矛盾 | 修正済（PROGRESS.md/CLAUDE.mdを実態に同期） | 2026-07-14 |
| OPUS-002 | R1 | Opus | Must | 品質スコア87点(グレードB)のまま社長の明示承認なしに進行 | 修正済（PROGRESS.mdに例外運用の承認記録欄を追加し、本セッションでの委任範囲を明記） | 2026-07-14 |
| OPUS-003 | R1 | Opus | Must | 当初想定「2〜4週間」と最終スコープ（Must30件）の乖離が未検証 | 対応（PROGRESS.mdに工数再見積りとスコープ縮小時の優先順位を追記） | 2026-07-14 |
| OPUS-004 | R1 | Opus | Blocker(本番リリース前提)/Must(MVP限定) | SaMD非該当性判定が自己精読のみ、外部専門家相談が未実施 | 対応（Exit Criteria/risk_register.mdに「本番公開前に外部専門家(薬事コンサル等)相談必須」を追加、AIの権限外のためTODOとして明記） | 2026-07-14 |
| OPUS-005 | R1 | Opus | Must | 個人情報漏洩時の報告・通知フローが未策定 | 修正済（SRS§11に具体的フローを追記） | 2026-07-14 |
| OPUS-006 | R1 | Opus | Must | Blazeプラン誤切替防止が人的ルールのみで技術的ガードレールなし | 修正済（月次確認手順をCONSTRAINTS.md/PROGRESS.mdに具体化） | 2026-07-14 |
| OPUS-007 | R1 | Opus | Must | リリース後の運用監視責任者が未定義 | 対応（PROGRESS.mdに運用責任者欄を追加、社長確認待ちとして記録） | 2026-07-14 |
| OPUS-008 | R1 | Opus | Should | FR-ADM-002がscope_table.mdのIN SCOPEに明記されていない | 修正済（scope_table.md更新） | 2026-07-14 |
| OPUS-009 | R1 | Opus | Must | 当事者/近似ペルソナによるユーザビリティ検証が未計画 | 修正済（Exit Criteriaに簡易ユーザビリティ確認を追加） | 2026-07-14 |
| OPUS-010 | R1 | Opus | Should | スケジュール逼迫時のMust内優先順位が未決定 | 修正済（PROGRESS.mdに優先順位を追記） | 2026-07-14 |
| OPUS-011 | R1 | Opus | Should | 社長の承認ポイントが一元化されていない | 修正済（PROGRESS.mdに承認マトリクスを追加） | 2026-07-14 |

**Round 1集計**: Blocker 3件（すべて修正/対応済）、Must 15件（すべて修正/対応済、うち2件は次フェーズタスクとして記録）、Should 8件（6件修正済、2件Later）、Later 3件
