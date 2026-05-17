import type { Course } from "../types/types.ts";
import { isSafeInternalRedirect } from "./postAuthRedirect.ts";

function appendRefToUrl(url: string, ref?: string | null) {
    if (!ref) return url;

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}ref=${encodeURIComponent(ref)}`;
}

function getSafeInternalPath(url: string) {
    if (isSafeInternalRedirect(url)) {
        return url;
    }

    if (typeof window === "undefined") {
        return null;
    }

    try {
        const parsedUrl = new URL(url, window.location.origin);
        if (parsedUrl.origin !== window.location.origin) {
            return null;
        }

        const internalPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
        return isSafeInternalRedirect(internalPath) ? internalPath : null;
    } catch {
        return null;
    }
}

export function getCoursePurchaseUrl(
    course: Pick<Course, "id" | "buyCourseUrl"> & { attributionCode?: string | null },
    ref?: string | null,
) {
    const safeBuyCourseUrl = course.buyCourseUrl ? getSafeInternalPath(course.buyCourseUrl) : null;
    const effectiveRef = ref || course.attributionCode || null;

    if (safeBuyCourseUrl) {
        return appendRefToUrl(safeBuyCourseUrl, effectiveRef);
    }

    const encodedCourseId = encodeURIComponent(course.id);
    const defaultUrl = `/buy-course?courseId=${encodedCourseId}`;
    return appendRefToUrl(defaultUrl, effectiveRef);
}
