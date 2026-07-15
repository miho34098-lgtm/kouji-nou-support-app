# 要件ID台帳

## 【Round2見直し 2026-07-14】訓練提案のパーソナライズ廃止に伴う改訂
FR-DATA-001, FR-DATA-002, FR-TRN-002, FR-TRN-003 を廃止（欠番、番号再利用しない）。詳細は`docs/SRS.md`の該当セクション、`PROGRESS.md`決定事項ログを参照。

| ID | タイトル | 優先度 | 状態 | 設計ID | テストID |
|---|---|---|---|---|---|
| FR-USR-001 | ロール選択によるアカウント作成 | Must | 確定 | - | TC-USR-001 |
| FR-USR-002 | 介護者の代理アクセス権限取得 | Must | 確定 | - | TC-USR-002 |
| FR-AUTH-001 | メール/パスワード認証 | Must | 確定 | - | TC-AUTH-001 |
| ~~FR-DATA-001~~ | ~~要配慮個人情報の個別同意取得~~ | - | **廃止(Round2)** | - | - |
| ~~FR-DATA-002~~ | ~~障害プロフィール入力~~ | - | **廃止(Round2)** | - | - |
| FR-DATA-003 | チェックリスト項目登録 | Must | 確定 | - | TC-DATA-003 |
| FR-DATA-004 | チェックリスト完了記録 | Must | 確定 | - | TC-DATA-004 |
| FR-NTF-001 | 予定・服薬登録 | Must | 確定 | - | TC-NTF-001 |
| FR-NTF-002 | Push通知送信 | Must | 確定 | - | TC-NTF-002 |
| FR-NTF-003 | キャッチアップ表示 | Must | 確定 | - | TC-NTF-003 |
| FR-NTF-004 | 音声読み上げ通知 | Should | 確定 | - | TC-NTF-004 |
| FR-ADM-001 | 代理登録・編集 | Must | 確定 | - | TC-ADM-001 |
| FR-ADM-002 | 代理操作ログ記録 | Should | 確定 | - | TC-ADM-002 |
| FR-TRN-001 | 公知情報ベースの訓練メニュー一覧表示（**Round2: 全ユーザー共通・パーソナライズなし**） | Must | 確定（簡略化） | - | TC-TRN-001 |
| ~~FR-TRN-002~~ | ~~プロフィールに基づく絞り込み~~ | - | **廃止(Round2)** | - | - |
| ~~FR-TRN-003~~ | ~~実施結果に基づく難易度自動調整~~ | - | **廃止(Round2)** | - | - |
| FR-TRN-004 | 免責表示 | Must | 確定 | - | TC-TRN-004 |
| FR-TRN-005 | 疾病候補・重症度判定の非表示 | Must | 確定 | - | TC-TRN-005 |
| FR-TRN-006 | AI自由生成訓練コンテンツ（対象外） | Won't | 確定 | - | - |
| FR-SYS-001 | PWAインストール対応 | Must | 確定 | - | TC-SYS-001 |
| FR-SYS-002 | インストール誘導オンボーディング | Must | 確定 | - | TC-SYS-002 |
| FR-SYS-003 | オフライン時のローカル機能継続 | Must | 確定 | - | TC-SYS-003 |
| FR-SYS-004 | オンライン復帰時の自動同期 | Should | 確定 | - | TC-SYS-004 |
| NFR-FUNC-001 | 機能適合性（Must要件充足率100%） | Must | 確定 | - | TC-NFR-001 |
| NFR-PERF-001 | 初回画面表示3秒以内 | Must | 確定 | - | TC-NFR-002 |
| NFR-PERF-002 | Push通知配信60秒以内 | Must | 確定 | - | TC-NFR-003 |
| NFR-COMP-001 | 対応ブラウザ環境 | Must | 確定 | - | TC-NFR-004 |
| NFR-USE-001 | 初回予定登録5ステップ以内 | Must | 確定 | - | TC-NFR-005 |
| NFR-USE-002 | タップ領域44x44px以上 | Must | 確定 | - | TC-NFR-006 |
| NFR-USE-003 | 文字サイズ18px以上 | Must | 確定 | - | TC-NFR-007 |
| NFR-REL-001 | オフライン時コア機能継続率100% | Must | 確定 | - | TC-NFR-008 |
| NFR-SEC-001 | 認証必須・パスワード強度 | Must | 確定 | - | TC-NFR-009 |
| NFR-SEC-002 | 全通信HTTPS化 | Must | 確定 | - | TC-NFR-010 |
| ~~NFR-SEC-003~~ | ~~要配慮個人情報同意フロー~~ | - | **廃止(Round2)** | - | - |
| NFR-MAINT-001 | 単体テストカバレッジ80%以上（src/services限定） | Should | 確定 | - | TC-NFR-012 |
| NFR-PORT-001 | 開発環境構築容易性 | Should | 確定 | - | TC-NFR-013 |
| NFR-EXT-001 | 訓練メニューカテゴリ拡張容易性 | Could | 確定 | - | TC-NFR-014 |

**集計（Round2改訂後）**: Must 23件 / Should 6件 / Could 1件 / Won't 1件 / 廃止 5件（FR-DATA-001,002 / FR-TRN-002,003 / NFR-SEC-003）
**Must比率**: 23/31 ≈ 74%

設計ID・テストIDはPhase 3（SDD）・Phase 4（TEST_PLAN）の改訂後に更新する。
