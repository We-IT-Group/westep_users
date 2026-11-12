const APP_WEB_ORIGIN = "https://app.westep.uz";
const APP_WEB_CALLBACK_PATH = "/telegram-callback";

export function isAllowedTelegramRedirect(raw: string, isDev = false): boolean {
  try {
    const url = new URL(raw);
    const scheme = url.protocol.replace(/:$/, "").toLowerCase();
    if (scheme === "westep") return true;
    if (isDev && (scheme === "exp" || scheme.startsWith("exp+"))) return true;
    if (scheme === "https" && url.origin === APP_WEB_ORIGIN) {
      const path = url.pathname.replace(/\/+$/, "") || "/";
      return path === APP_WEB_CALLBACK_PATH;
    }
    return false;
  } catch {
    return false;
  }
}
