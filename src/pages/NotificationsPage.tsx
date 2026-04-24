import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CheckCheck,
  CheckCircle2,
  Loader2,
  Megaphone,
  MessageCircle,
  RotateCcw,
  Search,
  ShoppingCart,
  Trophy,
  X,
} from "lucide-react";
import {
  NotificationItem,
  NotificationType,
  useGetNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "../api/notification/useNotification.ts";

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}, ${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
};

const getNotificationVisual = (type: NotificationType) => {
  switch (type) {
    case "TEACHER_REPLIED":
      return {
        icon: <MessageCircle className="h-5 w-5" />,
        iconWrap: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      };
    case "HOMEWORK_GRADED":
      return {
        icon: <CheckCircle2 className="h-5 w-5" />,
        iconWrap: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      };
    case "HOMEWORK_REVISION_REQUESTED":
      return {
        icon: <RotateCcw className="h-5 w-5" />,
        iconWrap: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      };
    case "MODULE_COMPLETED":
    case "CERTIFICATE_GENERATED":
      return {
        icon: <Trophy className="h-5 w-5" />,
        iconWrap: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      };
    case "COURSE_PURCHASED":
      return {
        icon: <ShoppingCart className="h-5 w-5" />,
        iconWrap: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
      };
    case "ADMIN_BROADCAST":
      return {
        icon: <Megaphone className="h-5 w-5" />,
        iconWrap: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      };
    case "NEW_LESSON_UNLOCKED":
      return {
        icon: <BookOpen className="h-5 w-5" />,
        iconWrap: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
      };
    default:
      return {
        icon: <Bell className="h-5 w-5" />,
        iconWrap: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      };
  }
};

const navigateByNotification = (navigate: ReturnType<typeof useNavigate>, notification: NotificationItem) => {
  const { type, data } = notification;

  switch (type) {
    case "TEACHER_REPLIED":
      if (data?.courseId && data?.studentCourseId && data?.moduleId && data?.lessonId) {
        navigate(`/courses/${data.courseId}/${data.studentCourseId}/${data.moduleId}/${data.lessonId}/questions`);
      }
      break;
    case "HOMEWORK_GRADED":
    case "HOMEWORK_REVISION_REQUESTED":
      if (data?.courseId && data?.studentCourseId && data?.moduleId && data?.lessonId) {
        navigate(`/courses/${data.courseId}/${data.studentCourseId}/${data.moduleId}/${data.lessonId}/questions`);
      }
      break;
    case "MODULE_COMPLETED":
      if (data?.courseId) navigate(`/roadmap/${data.courseId}`);
      break;
    case "COURSE_PURCHASED":
      if (data?.courseId && data?.studentCourseId) {
        navigate(`/courses/${data.courseId}/${data.studentCourseId}`);
      } else if (data?.courseId) {
        navigate(`/course-purchase/${data.courseId}`);
      }
      break;
    case "ADMIN_BROADCAST":
      if (data?.courseId) navigate(`/course-purchase/${data.courseId}`);
      break;
    case "NEW_LESSON_UNLOCKED":
      if (data?.courseId && data?.studentCourseId && data?.moduleId && data?.lessonId) {
        navigate(`/courses/${data.courseId}/${data.studentCourseId}/${data.moduleId}/${data.lessonId}/questions`);
      }
      break;
    default:
      break;
  }
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const { data, isPending } = useGetNotifications(0, 100);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  const notifications = data?.notifications || [];
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesTab = activeTab === "all" ? true : !item.isRead;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [notifications, activeTab, search]);

  const selectedNotification = useMemo(() => {
    if (notificationId) {
      return notifications.find((item) => item.id === notificationId) || filteredNotifications[0];
    }
    return filteredNotifications[0];
  }, [notificationId, notifications, filteredNotifications]);

  useEffect(() => {
    if (!notificationId && filteredNotifications[0]) {
      navigate(`/notifications/${filteredNotifications[0].id}`, { replace: true });
    }
  }, [filteredNotifications, navigate, notificationId]);

  useEffect(() => {
    if (selectedNotification && !selectedNotification.isRead) {
      markAsRead(selectedNotification.id);
    }
  }, [selectedNotification, markAsRead]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 pb-8 pt-6 dark:bg-slate-950 sm:px-6 sm:pt-8">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-h-[70vh] rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {!selectedNotification ? (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
              <Bell className="h-12 w-12 text-slate-200 dark:text-slate-700" />
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bildirishnoma tanlanmagan</h2>
                <p className="text-sm font-semibold text-slate-400">O'ng tomondagi ro'yxatdan xabar tanlang.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${getNotificationVisual(selectedNotification.type).iconWrap}`}>
                    {getNotificationVisual(selectedNotification.type).icon}
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                      {selectedNotification.title}
                    </h1>
                    <p className="text-sm font-semibold text-slate-400">
                      {formatDateTime(selectedNotification.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/notifications")}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-8 space-y-6">
                <p className="max-w-4xl text-[28px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedNotification.body}
                </p>

                <div className="flex flex-wrap gap-3 pt-4">
                  {!selectedNotification.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(selectedNotification.id)}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-black text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                      O'qildi deb belgilash
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigateByNotification(navigate, selectedNotification)}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    Bog'liq sahifaga o'tish
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`text-base font-black transition-colors ${activeTab === "all" ? "text-blue-600" : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"}`}
              >
                Barchasi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={`text-base font-black transition-colors ${activeTab === "unread" ? "text-blue-600" : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"}`}
              >
                O'qilmaganlar
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={isMarkingAll || notifications.every((item) => item.isRead)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {isMarkingAll ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCheck className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Bildirishnomani qidirish"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
            {isPending ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                <Bell className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-400">Bildirishnomalar topilmadi</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const visual = getNotificationVisual(notification.type);
                const isActive = selectedNotification?.id === notification.id;

                return (
                  <Link
                    key={notification.id}
                    to={`/notifications/${notification.id}`}
                    className={`flex items-start gap-4 border-b border-slate-100 px-5 py-5 transition-colors dark:border-slate-800 sm:px-6 ${
                      isActive
                        ? "bg-blue-50/60 dark:bg-blue-900/10"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="pt-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${visual.iconWrap}`}>
                        {visual.icon}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 text-lg font-black text-slate-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <span className="shrink-0 text-sm font-semibold text-slate-400">
                          {formatDateTime(notification.createdAt).split(", ")[1] || ""}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {notification.body}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
