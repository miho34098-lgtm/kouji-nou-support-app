// C-08 PWAShell: SDD.md §1。Web App Manifest、インストール検知、オンボーディング制御

/** FR-SYS-002: 未インストール状態かどうかを判定する（iOSはnavigator.standalone、その他はdisplay-mode） */
export function isInstalledAsPwa(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
  const displayModeStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  return iosStandalone || displayModeStandalone;
}

/** FR-SYS-002: オンボーディング画面を表示すべきか判定する */
export function shouldShowInstallOnboarding(): boolean {
  return !isInstalledAsPwa();
}
