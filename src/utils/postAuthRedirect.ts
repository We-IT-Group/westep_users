const POST_AUTH_REDIRECT_KEY = "post_auth_redirect";

export function isSafeInternalRedirect(path: string) {
    if (!path) return false;
    if (!path.startsWith("/")) return false;
    if (path.startsWith("//")) return false;

    try {
        const decodedPath = decodeURIComponent(path);
        return !decodedPath.includes("://");
    } catch {
        return false;
    }
}

export function setPostAuthRedirect(path: string) {
    if (typeof window === "undefined") return;
    if (!isSafeInternalRedirect(path)) return;

    sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, path);
}

export function getPostAuthRedirect() {
    if (typeof window === "undefined") return null;

    const value = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
    if (!value || !isSafeInternalRedirect(value)) {
        return null;
    }

    return value;
}

export function clearPostAuthRedirect() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
}
