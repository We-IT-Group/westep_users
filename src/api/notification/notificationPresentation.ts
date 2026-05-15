import { NotificationItem, DiscussionReplyNotificationData } from "./useNotification";

const roleLabelMap: Record<string, string> = {
    TEACHER: "Teacher",
    STUDENT: "Student",
    ADMIN: "Admin",
    SUPER_ADMIN: "Admin",
};

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return null;
    }

    return value as Record<string, unknown>;
}

function normalizeRole(role: string) {
    return roleLabelMap[role] || role.split("_").join(" ");
}

function getStringField(record: Record<string, unknown>, key: string) {
    const value = record[key];
    return isNonEmptyString(value) ? value.trim() : "";
}

export function isDiscussionReplyNotification(
    notification: NotificationItem,
): notification is NotificationItem<DiscussionReplyNotificationData> {
    return notification.type === "TEACHER_REPLIED" && getDiscussionReplyNotificationData(notification) !== null;
}

export function getDiscussionReplyNotificationData(
    notification: NotificationItem,
): DiscussionReplyNotificationData | null {
    if (notification.type !== "TEACHER_REPLIED") {
        return null;
    }

    const payload = asRecord(notification.data);
    if (!payload) {
        return null;
    }

    const courseId = getStringField(payload, "courseId");
    const studentCourseId = getStringField(payload, "studentCourseId");
    const moduleId = getStringField(payload, "moduleId");
    const lessonId = getStringField(payload, "lessonId");
    const discussionId = getStringField(payload, "discussionId");
    const commentId = getStringField(payload, "commentId");
    const replyId = getStringField(payload, "replyId");
    const replierName = getStringField(payload, "replierName");
    const replierRole = getStringField(payload, "replierRole");
    const replyContent = getStringField(payload, "replyContent");

    if (
        !courseId ||
        !studentCourseId ||
        !moduleId ||
        !lessonId ||
        !discussionId ||
        !commentId ||
        !replyId
    ) {
        return null;
    }

    return {
        courseId,
        studentCourseId,
        moduleId,
        lessonId,
        discussionId,
        commentId,
        replyId,
        replierName,
        replierRole,
        replyContent,
    };
}

export function getNotificationHeadline(notification: NotificationItem) {
    if (!isDiscussionReplyNotification(notification)) {
        return notification.title || "Bildirishnoma";
    }

    const { replierName, replierRole } = notification.data;

    if (!replierName) {
        return "Muhokamaga yangi javob keldi";
    }

    if (!replierRole) {
        return `${replierName} javob yozdi`;
    }

    return `${replierName} (${normalizeRole(replierRole)}) javob yozdi`;
}

export function getNotificationMessage(notification: NotificationItem) {
    if (!isDiscussionReplyNotification(notification)) {
        return notification.body || "Muhokamaga yangi javob keldi";
    }

    return notification.data.replyContent || "Muhokamaga yangi javob keldi";
}

export function getNotificationRoleLabel(notification: NotificationItem) {
    if (!isDiscussionReplyNotification(notification)) {
        return "";
    }

    return notification.data.replierRole ? normalizeRole(notification.data.replierRole) : "";
}

export function buildNotificationLink(notification: NotificationItem) {
    if (isDiscussionReplyNotification(notification)) {
        const { courseId, studentCourseId, moduleId, lessonId, discussionId } = notification.data;
        return `/courses/${courseId}/${studentCourseId}/${moduleId}/${lessonId}/questions?discussion=${discussionId}`;
    }

    const payload = asRecord(notification.data);
    if (!payload) {
        return null;
    }

    const courseId = getStringField(payload, "courseId");
    const studentCourseId = getStringField(payload, "studentCourseId");
    const moduleId = getStringField(payload, "moduleId");
    const lessonId = getStringField(payload, "lessonId");
    const certificateId = getStringField(payload, "certificateId");

    switch (notification.type) {
        case "HOMEWORK_GRADED":
        case "HOMEWORK_REVISION_REQUESTED":
        case "NEW_LESSON_UNLOCKED":
            return courseId && studentCourseId && moduleId && lessonId
                ? `/courses/${courseId}/${studentCourseId}/${moduleId}/${lessonId}/questions`
                : null;
        case "MODULE_COMPLETED":
            return courseId ? `/buy-course/${courseId}` : null;
        case "COURSE_PURCHASED":
            if (courseId && studentCourseId) {
                return `/courses/${courseId}/${studentCourseId}`;
            }
            return courseId ? `/course-purchase/${courseId}` : null;
        case "ADMIN_BROADCAST":
            return courseId ? `/course-purchase/${courseId}` : null;
        case "CERTIFICATE_GENERATED":
            return certificateId ? `/certificates/${certificateId}` : null;
        default:
            return null;
    }
}
