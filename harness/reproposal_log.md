# 再提案ログ

## Round 1 再提案（2026-07-14）

### 修正事項

| 指摘ID | 修正前 | 修正後 | 影響範囲 |
|---|---|---|---|
| CX-01 | CW-01がFirestoreへのアクセス手段未定義（Admin SDK前提で実装不能） | Firestore REST API + サービスアカウントJWT(WebCrypto署名)方式に変更、ADR-009として記録 | docs/SDD.md §1, §5 |
| CX-02 | SDD内で「読取専用」と書込フローが矛盾 | 「notifiedフラグの更新権限を持つ」旨に訂正 | docs/SDD.md §1 |
| CX-03 | Push二重送信を防ぐ排他制御なし | Firestoreトランザクションによる`claimAndSend()`条件付き更新を追加 | docs/SDD.md §1, harness/HARNESS.md H3 |
| CX-04 | Worker側`import.meta.env.VITE_DRY_RUN`は技術的に不成立 | Worker側は`env.DRY_RUN`（wrangler管理）に分離 | docs/SDD.md §7, harness/HARNESS.md H1 |
| CX-05 | Sparkプランで実装不能な「5回失敗で60秒ロック」 | Firebase Authentication標準の指数バックオフに要件を修正 | docs/SRS.md FR-AUTH-001 |
| CX-06 | 招待コード6桁・レート制限なしで総当たり攻撃面 | 8桁化、期限72h→24h短縮、5回失敗で1時間ブロックを追加 | docs/SRS.md FR-USR-002 |
| CX-09 | Must件数の不整合（SRS「19件」vs 台帳「30件」） | SRSをrequirements_ledger.md基準（Must30/Should6/Could1/Won't1）に統一 | docs/SRS.md Phase2完了チェックリスト |
| CX-10 | カバレッジ80%の対象範囲未定義 | src/services/とworker/src/に限定と明記 | docs/TEST_PLAN.md §5 |
| CX-11 | npm audit HIGH0件のコミット毎ハードゲート | 週次実行をハードゲート、PR時は警告のみに変更 | docs/TEST_PLAN.md 決定論的センサー |
| CX-12 | Playwright E2Eの非決定性（Push許可ダイアログ等） | `@manual`タグで決定論的シナリオと分離 | docs/TEST_PLAN.md 決定論的センサー |
| CX-15 | NFR-EXT-001「コード変更不要」とTrainingRecord.category固定enumの矛盾 | categoryをJSON定義参照の文字列型（実行時バリデーション）に変更 | docs/SDD.md §3 |
| CX-16 | 要配慮個人情報も含め最終更新優先でサイレント消失リスク | 同意関連フィールドをwrite-once制約（Security Rules）に変更 | docs/SDD.md §3 |
| CX-18 | サービスアカウント鍵の管理方針未記載 | wrangler secret管理・最小権限・年1回ローテーションを明記 | docs/SDD.md ADR-009, harness/HARNESS.md H5, CONSTRAINTS.md |
| CX-19 | ProxyLog TTL「90日厳守」が実運用とずれる | 「90日+遅延あり」に表現修正 | docs/SDD.md §3, harness/HARNESS.md H5 |
| CX-20 | MoSCoW集計「Won't 1件」の実体が本文にない | FR-TRN-006をWont要件として明記 | docs/SRS.md §7.7 |
| OPUS-001 | CLAUDE.mdとPROGRESS.mdのフェーズ記述矛盾 | PROGRESS.mdを一次情報源とし両ファイルを同期 | CLAUDE.md, PROGRESS.md |
| OPUS-002 | グレードB(87点)のまま社長承認なしに進行 | PROGRESS.mdに承認マトリクスを追加し委任範囲を明記 | PROGRESS.md |
| OPUS-003 | 当初想定(2〜4週間)と最終スコープの乖離未検証 | PROGRESS.mdにスケジュール再見積りと優先順位を追記 | PROGRESS.md |
| OPUS-004 | SaMD非該当性の外部専門家相談が未実施 | exit_criteria.md/risk_register.mdに人間タスクとして明記 | docs/exit_criteria.md, docs/risk_register.md |
| OPUS-005 | 個人情報漏洩時の報告・通知フロー未策定 | SRS §11に5ステップの具体的フローを追記 | docs/SRS.md §11 |
| OPUS-006/007 | Blaze誤切替防止が人的ルールのみ、運用責任者未定義 | 月次確認手順とPROGRESS.mdの運用責任者欄を追加 | CONSTRAINTS.md, PROGRESS.md |
| OPUS-008 | FR-ADM-002がscope_table.mdに未記載 | scope_table.mdのIN SCOPEに追記 | research/scope_table.md |
| OPUS-009 | ユーザビリティ検証が未計画 | exit_criteria.mdに追加 | docs/exit_criteria.md |
| OPUS-010/011 | 優先順位・承認ポイントの一元化不足 | PROGRESS.mdに優先順位・承認マトリクスを追加 | PROGRESS.md |

### 再テスト結果
本ラウンドはドキュメントフェーズ（Phase0-5）のレビューであり、実装コードが存在しないためUnit/Lint等の自動テスト再実行は対象外。修正内容は全てPhase 6実装時の設計指針として反映される。

### Later/Should扱いとして記録した項目（今回は未修正、Phase6以降で対応）
- CX-13: 本番実送信経路(_realSend等)のcontractテスト → Phase6テスト実装時に追加
- CX-14: タップ領域/文字サイズの自動DOM計測アサーション化 → Phase6で追加
- CX-17: 同期競合・音声読み上げのE2E/統合テスト → Should要件のためPhase6バックログに登録
