import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import os from "node:os";
import path from "node:path";

// SDD.md §4 C4 Container図: GitHub Pages配信（ADR-003改訂）、Web App Manifest提供(FR-SYS-001)
// GitHub Pagesはリポジトリ名のサブパス配信になるため、環境変数 VITE_BASE_PATH で調整する
// （カスタムドメイン or <username>.github.ioのユーザーページの場合は "/" のままでよい）
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  // プロジェクトがOneDrive同期フォルダ内にあると、node_modules/.vite への書き込みが
  // OneDriveのファイルロックと衝突し "Access is denied" でdev serverが起動できないことがある。
  // 依存関係の事前バンドルキャッシュはOneDrive管理外のOS一時フォルダに退避する。
  cacheDir: path.join(os.tmpdir(), "kouji-nou-support-app-vite-cache"),
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "高次脳機能障害者生活支援アプリ",
        short_name: "生活支援アプリ",
        description: "予定・服薬リマインド、日課チェックリスト、訓練メニュー情報の提供",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2c7a7b",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Windows環境でfirebase-admin等の重い依存を含むテストが並列実行時にworkerクラッシュすることがあるため無効化
    fileParallelism: false,
    coverage: {
      // Round1修正 CX-10: カバレッジ対象はsrc/services限定（UIはE2Eで担保）。Round3改訂でworker/src→scripts/に変更
      include: ["src/services/**", "scripts/**"],
      // runCheckNotifications.tsはimport時に即実行するエントリポイント（src/main.tsxと同様の位置づけ）のため対象外
      exclude: ["scripts/runCheckNotifications.ts"],
      thresholds: { lines: 80 },
    },
  },
});
