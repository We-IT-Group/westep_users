import { getItem, setItem } from "./utils.ts";

const DEVICE_ID_STORAGE_KEY = "deviceId";

function fallbackDeviceId() {
    return `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function detectPlatform(userAgent: string) {
    const normalized = userAgent.toLowerCase();

    if (normalized.includes("iphone")) return "iOS";
    if (normalized.includes("ipad")) return "iPadOS";
    if (normalized.includes("android")) return "Android";
    if (normalized.includes("windows")) return "Windows";
    if (normalized.includes("mac os") || normalized.includes("macintosh")) return "macOS";
    if (normalized.includes("linux")) return "Linux";

    return "Unknown";
}

function detectBrowser(userAgent: string) {
    const normalized = userAgent.toLowerCase();

    if (normalized.includes("edg/")) return "Edge";
    if (normalized.includes("opr/") || normalized.includes("opera")) return "Opera";
    if (normalized.includes("chrome/") && !normalized.includes("edg/")) return "Chrome";
    if (normalized.includes("firefox/")) return "Firefox";
    if (normalized.includes("safari/") && !normalized.includes("chrome/")) return "Safari";

    return "Browser";
}

export function getOrCreateDeviceId() {
    const existingDeviceId = getItem<string>(DEVICE_ID_STORAGE_KEY);
    if (existingDeviceId) {
        return existingDeviceId;
    }

    const generatedId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : fallbackDeviceId();

    setItem(DEVICE_ID_STORAGE_KEY, generatedId);
    return generatedId;
}

export function getCurrentDeviceName() {
    if (typeof navigator === "undefined") {
        return "Unknown Device";
    }

    const platform = detectPlatform(navigator.userAgent);
    const browser = detectBrowser(navigator.userAgent);
    return `${platform} ${browser}`;
}
