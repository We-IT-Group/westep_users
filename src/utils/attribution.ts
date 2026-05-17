export function getCookieValue(name: string) {
    if (typeof document === "undefined") {
        return null;
    }

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));

    if (!match?.[1]) {
        return null;
    }

    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}

export function getPreferredAttributionRef(
    urlRef?: string | null,
    responseRef?: string | null,
    cookieName = "ref",
) {
    return responseRef || urlRef || getCookieValue(cookieName) || null;
}
