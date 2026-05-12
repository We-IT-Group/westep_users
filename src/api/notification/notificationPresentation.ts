import { NotificationItem } from "./useNotification";

const roleLabelMap: Record<string, string> = {
    TEACHER: "Teacher",
    STUDENT: "Student",
    ADMIN: "Admin",
    SUPER_ADMIN: "Admin",
};

function pickString(...values: unknown[]) {
    const found = values.find((value) => typeof value === "string" && value.trim().length > 0);
    return typeof found === "string" ? found.trim() : "";
}

function normalizeRole(role: string) {
    return roleLabelMap[role] || role.split("_").join(" ");
}

export function getNotificationHeadline(notification: NotificationItem) {
    if (notification.type !== "TEACHER_REPLIED") {
        return notification.title;
    }

    const actorName = pickString(
        notification.data?.replierName,
        notification.data?.authorName,
        notification.data?.fullName,
        notification.data?.userName,
        notification.data?.teacherName,
    );

    const actorRole = pickString(
        notification.data?.replierRole,
        notification.data?.authorRole,
        notification.data?.role,
        notification.data?.userRole,
    );

    if (!actorName) {
        return notification.title;
    }

    return actorRole ? `${actorName} • ${normalizeRole(actorRole)}` : actorName;
}

export function getNotificationMessage(notification: NotificationItem) {
    if (notification.type !== "TEACHER_REPLIED") {
        return notification.body;
    }

    const replyContent = pickString(
        notification.data?.replyContent,
        notification.data?.content,
        notification.data?.message,
        notification.data?.comment,
        notification.data?.body,
    );

    return replyContent || notification.body;
}
