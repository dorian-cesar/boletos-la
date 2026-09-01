export function isAppWebView(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || window.navigator.vendor || "";
  return /FBAN|FBAV|Instagram|TikTok|musical_ly|ByteLocale|Snapchat/i.test(ua);
}

export function getSystemBrowserUrl(currentUrl: string): string | null {
  if (typeof window === "undefined") return null;

  const isAndroid = /android/i.test(window.navigator.userAgent);
  if (isAndroid) {
    const cleanUrl = currentUrl.replace(/^https?:\/\//, "");
    return `intent://${cleanUrl}#Intent;action=android.intent.action.VIEW;scheme=https;end`;
  }
  return null;
}
