# リサーチ V1

## 調査日: 2026-07-14
## 対象プロジェクト: 高次脳機能障害者生活支援アプリ（kouji-nou-support-app）

---

### A. ツール/MCP/OSS

| # | 調査項目 | 結果 | ソースURL | 信頼度 |
|---|---|---|---|---|
| A1 | PWA構築: Vite PWA plugin | ゼロコンフィグPWAプラグイン。React対応、Workboxベース。2026-05にv1.3.0リリース、Star 4.2k、活発 | https://github.com/vite-pwa/vite-plugin-pwa / https://vite-pwa-org.netlify.app/ | 高(A) |
| A2 | PWA構築: next-pwa | 最終リリース2022-12、事実上メンテ停止 | https://github.com/shadowwalker/next-pwa | 中(B) |
| A3 | PWA構築: Serwist（next-pwa後継） | Next.js公式ドキュメントが推奨。2026-05時点でも直近リリースあり | https://github.com/serwist/serwist / https://nextjs.org/docs/app/guides/progressive-web-apps | 高(A/B) |
| B1 | 通知: Web Push API | Service Worker経由の標準仕様。スケジューリングはAPI範囲外でバックエンド実装が必要 | https://developer.mozilla.org/en-US/docs/Web/API/Push_API | 高(A) |
| B2 | 通知: web-push (Node.js) | 標準実装ライブラリ。Star 3.5k、最新リリース2023-08で更新やや停滞 | https://github.com/web-push-libs/web-push | 中(B) |
| B3 | 通知スケジューリング | Web Push自体にスケジューリング機能なし。バックエンドジョブ（cron/Alarm）との組合せが一般的 | https://developers.cloudflare.com/agents/communication-channels/webhooks/push-notifications/ | 高(A) |
| C1 | オフラインDB: Dexie.js | IndexedDBラッパー。Star 14.5k、10万以上のサイトで採用、2026-06にv4.4.4リリース | https://github.com/dexie/Dexie.js/ / https://dexie.org/ | 高(A) |
| D1 | アクセシビリティOSS: Radix UI | WAI-ARIA準拠のヘッドレスコンポーネント | https://www.makeuseof.com/react-component-libraries-build-accessible-applications/ | 中(B) |
| D2 | アクセシビリティOSS: Chakra UI | シンプル・アクセシブル、大きなタップ領域を組みやすい | 同上 | 中(B) |
| E1 | 参考実装: Loop Habit Tracker (uhabits) | Android向けOSS習慣トラッカー。Star 10k | https://github.com/iSoron/uhabits | 高(B) |
| E2 | 参考実装: Habitica | ゲーミフィケーション型タスク管理。Star 14k、2026-06更新で活発 | https://github.com/HabitRPG/habitica | 高(B) |
| E3 | 参考実装: DoHabit | ローカルファーストPWA。React+TS+Vite+Zustand+IndexedDBと本プロジェクトに近い構成 | https://github.com/iNikAnn/DoHabit/ | 中(B) |

**未解決・要V2確認（観点A）**
- iOS SafariにおけるWeb Push対応の公式一次情報未確認（優先度高: 利用者のiPhone比率が高い可能性）
- web-push (Node.js) の代替となる活発なライブラリの特定

---

### B. API/ライブラリ/利用規約

| # | 調査項目 | 結果 | ソースURL | 信頼度 |
|---|---|---|---|---|
| B1-1 | Web Push API サポート状況 | Baseline: Widely available（2023-03以降）。許可はユーザージェスチャー起点が必須 | https://developer.mozilla.org/en-US/docs/Web/API/Push_API / https://caniuse.com/push-api | 高(A) |
| B1-2 | iOS Safari Web Push対応 | iOS/iPadOS 16.4以降で対応。**ホーム画面追加（PWAインストール）時のみ動作**、Safariタブ内では不可 | https://batch.com/blog/posts/apple-web-push-ios16-4 | 中(B・要一次情報確認) |
| B1-3 | Notifications API | HTTPS必須。モバイルでは`Notification()`直接呼び出し不可、Service Worker経由の`showNotification()`必須 | https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API | 高(A) |
| B2-1/2 | Service Worker / Web App Manifest 仕様 | W3C標準。インストール可能PWAにはname/icons/start_url/display等が必須 | https://www.w3.org/TR/service-workers/ / https://www.w3.org/TR/appmanifest/ | 高(A) |
| B3-1 | 要配慮個人情報の定義 | 個人情報保護法第2条3項。病歴・障害の事実等を含む。本アプリのデータは該当する可能性が高い | https://elaws.e-gov.go.jp/document?lawid=415AC0000000057 / https://www.ppc.go.jp/all_faq_index/faq4-q011/ | 高(A) |
| B3-2 | 要配慮個人情報の取扱ルール | 取得に本人の個別同意必須（オプトアウト不可）。漏洩時はPPC報告・本人通知が法的義務 | https://www.ppc.go.jp/all_faq_index/faq4-q011/ | 高(A) |
| B3-3 | 医療・介護分野ガイダンス | PPC・厚労省共同「医療・介護関係事業者における個人情報の適切な取扱いのためのガイダンス」 | https://www.ppc.go.jp/personalinfo/legal/iryoukaigo_guidance/ | 高(A) |
| B4-1 | 高次脳機能障害リハビリ一次情報源 | 国立障害者リハビリテーションセンター「高次脳機能障害情報・支援センター」。厚労省「高次脳機能障害支援普及事業」中核 | https://www.rehab.go.jp/brain_fukyu/about/ | 高(A) |
| B4-2 | 訓練の4本柱 | ①認知機能改善 ②代償手段獲得 ③自己認識向上 ④環境調整。実生活に即した目標設定重視 | https://www.rehab.go.jp/brain_fukyu/how04/rehab/training/ | 高(A) |
| B5-1 | プログラム医療機器(SaMD)該当性基準 | 厚労省ガイドライン（令和3年制定/令和5年改正）。「生命健康への影響」の有無が核心基準 | https://www.pmda.go.jp/files/000240233.pdf | 高(A・PDF未精読) |
| B5-2 | データ表示のみの非該当基準 | 記録・表示・グラフ化のみは非該当。演算による診断値算出は要検討 | 医機連解説書PDF | 中〜高(A/B) |
| B5-3 | 訓練提案アプリ固有リスク | 「訓練メニュー提案」の明示的該当/非該当記載は未確認。治療・診断を標榜しない設計が安全 | 同上 | 低〜中（要V2精読） |

**未解決・要V2確認（観点B）**
- iOS Web Push公式一次情報（Apple Developer Documentation）の確認
- SaMDガイドラインPDF本体の精読（別表フローチャートの当てはめ）
- 介護者代理入力時の「本人同意」の法的整理

**規約・法令上のリスク**
- 要配慮個人情報の取扱いには個別明示同意が必須（設計に反映要）
- 訴求文言（治療・診断・改善保証等）はSaMD該当リスクを高める。情報提示・記録支援ツールとして訴求する方針とする
- iOSでは「PWAインストール必須」という通知機能の前提制約がある

---

### C. アーキテクチャ/コミュニティ

| # | 調査項目 | 結果 | ソースURL | 信頼度 |
|---|---|---|---|---|
| C1 | 海外事例: ApplTree | ABI当事者向けRCT。リマインダー到達率65.5%・遵守率73.7%、紙の手帳より有意に改善 | https://pmc.ncbi.nlm.nih.gov/articles/PMC11166046/ | 高(B・査読論文) |
| C2 | 海外事例: ForgetMeNot/Qcard/CanPlan/Spaced Retrieval Therapy | 視覚的・段階的タスク分解、家族共有型設計が特徴 | https://www.flintrehab.com/best-apps-for-brain-injury-patients/ | 中(C) |
| C3 | UI設計知見: narrow-deep vs broad-shallow | 1画面の情報量を絞る設計の方が認知的負荷が低い | https://strathprints.strath.ac.uk/80081/1/... | 高(B・学術論文) |
| C4 | 国内事例: 「あらた」 | 音声通知（家族の声録音可）、Googleカレンダー連携、日記機能。2014年リリースで情報が古い | https://www.innervision.co.jp/sp/products/release/20141012 | 中(C) |
| C5 | 国内事例: 「リハプリ」「高次脳機能バランサー」 | 専門職(医師/OT/PT)向けiPadアプリが中心、一般利用者向けPWAではない | https://www.netcom-inc.co.jp/product/rehappli | 中(C) |
| C6 | WCAG Cognitive Accessibility Guidance | W3C公式。認知負荷軽減・一貫性・記憶に頼らない設計等8目的 | https://www.w3.org/TR/coga-usable/ | 高(A) |
| C8/C9 | マルチロール設計（RBAC/プロキシアクセス） | 患者・介護者ロール分離、最小権限、時間制限付き委任がベストプラクティス | https://pmc.ncbi.nlm.nih.gov/articles/PMC12674950/ | 高(B) |
| C10 | オフラインファースト設計 | cache-first/network-first戦略の使い分け、Background Sync APIでキューイング | https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation | 高(A) |
| C11 | **オフライン時リマインド通知の技術的制約（重要）** | Push APIはネットワーク必須。ローカルスケジュール通知用「Notification Triggers API」はGoogleが開発中止を公式表明。**PWAでオフライン時に確実なリマインド通知を実現する標準APIは現状存在しない** | https://developer.chrome.com/docs/web-platform/notification-triggers | 高(A・Chrome公式) |
| C12/C13 | アダプティブ難易度調整 | 階段関数（2U1D/1U1D）が代表的手法。RCTでアダプティブ訓練の有効性が実証されている | https://dl.acm.org/doi/10.1145/3476777 / https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5050994/ | 高(B・査読論文) |

**未解決・要V2確認（観点C）**
- iOS PWAでの通知制約の詳細技術検証
- オフライン通知の代替案（ネイティブ併用/TWA化等）の実現可能性

---

## 横断的な重大リスク（V2で最優先対応）

1. **オフライン時リマインド通知の技術的limitation**: 対象ユーザーは記憶障害等でネットワーク接続を意識的に維持できない可能性があり、オフライン時に通知が飛ばない設計は致命的なUX欠陥になりうる（黄金ルール#6関連: Q6失敗したくない点と直結）
2. **iOS PWA通知のインストール必須制約**: ホーム画面追加を促すオンボーディング設計が必須要件になる
3. **SaMD（医療機器プログラム）該当性リスク**: 訓練提案機能の訴求文言・機能範囲によっては薬機法規制対象になりうる。V2でガイドラインPDFを精読し、非該当を維持する設計指針を確定する
4. **要配慮個人情報の同意設計**: 介護者代理入力時の同意取得フローの法的整理が必要
