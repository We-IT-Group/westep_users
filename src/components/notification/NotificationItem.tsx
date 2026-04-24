import moment from "moment";
import "moment/locale/uz-latn";
import {
    MessageCircle,
    CheckCircle2,
    RotateCcw,
    Award,
    ShoppingCart,
    Megaphone,
    BookOpen,
    Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationItem as NotificationTypeItem, useMarkNotificationAsRead } from "../../api/notification/useNotification";

interface NotificationItemProps {
    notification: NotificationTypeItem;
    onCloseDropdown: () => void;
}

export function NotificationItemComponent({ notification, onCloseDropdown }: NotificationItemProps) {
    const navigate = useNavigate();
    const { mutate: markAsRead } = useMarkNotificationAsRead();

    const handleClick = () => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Navigation logic based on type and payload data
        const { type, data } = notification;

        switch (type) {
            case "TEACHER_REPLIED":
                if (data?.courseId && data?.lessonId) {
                    navigate(`/courses/${data.courseId}/${data.lessonId}?discussion=${data.discussionId}`);
                }
                break;
            case "HOMEWORK_GRADED":
            case "HOMEWORK_REVISION_REQUESTED":
                if (data?.courseId && data?.lessonId) {
                    navigate(`/courses/${data.courseId}/${data.lessonId}/homework`);
                }
                break;
            case "MODULE_COMPLETED":
                if (data?.courseId && data?.studentCourseId && data?.moduleId) {
                    navigate(`/courses/${data.courseId}/${data.studentCourseId}/${data.moduleId}`);
                }
                break;
            case "COURSE_PURCHASED":
                if (data?.courseId && data?.studentCourseId) {
                    navigate(`/courses/${data.courseId}/${data.studentCourseId}`);
                } else if (data?.courseId) {
                    navigate(`/course-purchase/${data.courseId}`);
                }
                break;
            case "ADMIN_BROADCAST":
                if (data?.courseId) {
                    navigate(`/course-purchase/${data.courseId}`);
                }
                break;
            case "NEW_LESSON_UNLOCKED":
                if (data?.courseId && data?.moduleId && data?.lessonId) {
                     navigate(`/courses/${data.courseId}/modules/${data.moduleId}/lessons/${data.lessonId}`);
                }
                break;
            case "CERTIFICATE_GENERATED":
                if (data?.certificateId) {
                    navigate(`/certificates/${data.certificateId}`);
                }
                break;
            default:
                break; // Do nothing if unmapped
        }

        onCloseDropdown();
    };

    // Style Configuration based on Type
    const getNotificationStyle = () => {
        switch (notification.type) {
            case "TEACHER_REPLIED":
                return { icon: <MessageCircle className="w-5 h-5" />, bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" };
            case "HOMEWORK_GRADED":
                return { icon: <CheckCircle2 className="w-5 h-5" />, bg: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" };
            case "HOMEWORK_REVISION_REQUESTED":
                return { icon: <RotateCcw className="w-5 h-5" />, bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" };
            case "MODULE_COMPLETED":
                return { icon: <Award className="w-5 h-5" />, bg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" };
            case "COURSE_PURCHASED":
                return { icon: <ShoppingCart className="w-5 h-5" />, bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" };
            case "ADMIN_BROADCAST":
                return { icon: <Megaphone className="w-5 h-5" />, bg: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" };
            case "NEW_LESSON_UNLOCKED":
                return { icon: <BookOpen className="w-5 h-5" />, bg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" };
            case "CERTIFICATE_GENERATED":
                return { icon: <Award className="w-5 h-5" />, bg: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" };
            default:
                return { icon: <Bell className="w-5 h-5" />, bg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" };
        }
    };

    const style = getNotificationStyle();
    const timeAgo = moment(notification.createdAt).locale("uz-latn").fromNow();

    return (
        <button
            onClick={handleClick}
            className={`w-full text-left group flex gap-4 rounded-[24px] p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                !notification.isRead ? "relative bg-blue-50/30 dark:bg-blue-900/10" : ""
            }`}
        >
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.bg} transition-transform group-hover:scale-110`}
            >
                {style.icon}
            </div>
            <div className="flex-1 space-y-1 pr-6">
                <div className="flex items-center justify-between">
                    <h4 className={`text-[13px] sm:text-sm font-black tracking-tight ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {notification.title}
                    </h4>
                </div>
                <p className={`line-clamp-2 text-xs font-bold leading-relaxed ${!notification.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'}`}>
                    {notification.body}
                </p>
                <div className="text-[10px] font-bold uppercase italic text-slate-400 mt-2">
                    {timeAgo}
                </div>
            </div>
            {!notification.isRead && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
            )}
        </button>
    );
}
