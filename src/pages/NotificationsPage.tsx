import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
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
  NotificationType,
  useGetNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "../api/notification/useNotification.ts";
import { buildNotificationLink, getNotificationHeadline, getNotificationMessage, getNotificationRoleLabel, isDiscussionReplyNotification } from "../api/notification/notificationPresentation.ts";

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}, ${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
};

const getNotificationVisual = (type: NotificationType) => {
  switch (type) {
    case "TEACHER_REPLIED":
      return { icon: <MessageCircle className="h-5 w-5" />, iconWrap: "bg-primary-50 text-primary-500" };
    case "HOMEWORK_GRADED":
      return { icon: <CheckCircle2 className="h-5 w-5" />, iconWrap: "bg-emerald-50 text-emerald-600" };
    case "HOMEWORK_REVISION_REQUESTED":
      return { icon: <RotateCcw className="h-5 w-5" />, iconWrap: "bg-amber-50 text-amber-600" };
    case "MODULE_COMPLETED":
    case "CERTIFICATE_GENERATED":
      return { icon: <Trophy className="h-5 w-5" />, iconWrap: "bg-amber-50 text-amber-600" };
    case "COURSE_PURCHASED":
      return { icon: <ShoppingCart className="h-5 w-5" />, iconWrap: "bg-teal-50 text-teal-600" };
    case "ADMIN_BROADCAST":
      return { icon: <Megaphone className="h-5 w-5" />, iconWrap: "bg-rose-50 text-rose-500" };
    case "NEW_LESSON_UNLOCKED":
      return { icon: <BookOpen className="h-5 w-5" />, iconWrap: "bg-primary-50 text-primary-500" };
    default:
      return { icon: <Bell className="h-5 w-5" />, iconWrap: "bg-[#e8eefb] text-[color:var(--hint)]" };
  }
};

const tabClass = (active: boolean) =>
  `rounded-xl px-4 py-2 text-sm font-extrabold transition-colors ${
    active ? "bg-white text-primary-500 shadow-[0_8px_18px_rgba(12,36,97,0.1)]" : "text-[color:var(--hint)] hover:text-[color:var(--ink)]"
  }`;

const roleChip =
  "inline-flex rounded-full bg-primary-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-primary-500";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const { data, isPending, isError } = useGetNotifications(0, 100);
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
        getNotificationHeadline(item).toLowerCase().includes(q) ||
        getNotificationMessage(item).toLowerCase().includes(q);
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

  const selectedHeadline = selectedNotification ? getNotificationHeadline(selectedNotification) : "";
  const selectedMessage = selectedNotification ? getNotificationMessage(selectedNotification) : "";
  const selectedRoleLabel = selectedNotification ? getNotificationRoleLabel(selectedNotification) : "";
  const selectedLink = selectedNotification ? buildNotificationLink(selectedNotification) : null;

  return (
    <div className="academy-stats academy-dash">
      <div className="academy-dash-head">
        <div className="academy-stats-head">
          <h2>Bildirishnomalar</h2>
          <p>Ustoz javoblari, baholar va yangi darslar</p>
        </div>
        <div className="flex w-max max-w-full items-center gap-1 rounded-2xl bg-[#e8eefb] p-1">
          <button type="button" onClick={() => setActiveTab("all")} className={tabClass(activeTab === "all")}>
            Barchasi
          </button>
          <button type="button" onClick={() => setActiveTab("unread")} className={tabClass(activeTab === "unread")}>
            O'qilmaganlar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="academy-card !p-6 sm:!p-8 min-h-[320px] lg:min-h-[420px]">
          {isError ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="h-12 w-12 text-rose-300" />
              <h3 className="font-fredoka text-xl font-semibold">Bildirishnomalarni yuklab bo'lmadi</h3>
              <p className="academy-quiet">Sahifani yangilab qayta urinib ko'ring.</p>
            </div>
          ) : !selectedNotification ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
              <Bell className="h-12 w-12 text-primary-200" />
              <h3 className="font-fredoka text-xl font-semibold">Bildirishnoma tanlanmagan</h3>
              <p className="academy-quiet">Ro'yxatdan xabar tanlang.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${getNotificationVisual(selectedNotification.type).iconWrap}`}>
                    {getNotificationVisual(selectedNotification.type).icon}
                  </div>
                  <div className="space-y-1.5">
                    <h1 className="font-fredoka text-2xl font-semibold leading-tight sm:text-3xl">{selectedHeadline}</h1>
                    {isDiscussionReplyNotification(selectedNotification) && selectedRoleLabel ? (
                      <div className={roleChip}>{selectedRoleLabel}</div>
                    ) : null}
                    <p className="academy-quiet text-sm">{formatDateTime(selectedNotification.createdAt)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/notifications")}
                  aria-label="Yopish"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[color:var(--hint)] transition-colors hover:bg-[#e8eefb] hover:text-[color:var(--ink)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <p className="max-w-3xl text-lg font-semibold leading-relaxed">{selectedMessage}</p>

                <div className="flex flex-wrap gap-3">
                  {!selectedNotification.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(selectedNotification.id)}
                      className="rounded-2xl bg-[#e8eefb] px-5 py-3 text-sm font-extrabold text-primary-500 transition-colors hover:bg-[#d7e3fb]"
                    >
                      O'qildi deb belgilash
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedLink) {
                        navigate(selectedLink);
                      }
                    }}
                    disabled={!selectedLink}
                    className="academy-cta academy-cta-brand academy-cta-compact"
                  >
                    Bog'liq sahifaga o'tish
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="academy-card overflow-hidden !p-0">
          <div className="flex items-center gap-3 border-b border-[#e8eefb] p-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--hint)]" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Bildirishnomani qidirish"
                className="h-11 w-full rounded-2xl border border-[#d7e3fb] bg-[#f4f8ff] pl-10 pr-4 text-sm font-bold outline-none transition-all placeholder:text-[color:var(--hint)] focus:border-primary-500 focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={isMarkingAll || notifications.every((item) => item.isRead)}
              aria-label="Hammasini o'qilgan deb belgilash"
              title="Hammasini o'qilgan deb belgilash"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8eefb] text-primary-500 transition-colors hover:bg-[#d7e3fb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isMarkingAll ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCheck className="h-5 w-5" />}
            </button>
          </div>

          <div className="max-h-[calc(100dvh-300px)] min-h-[200px] overflow-y-auto">
            {isPending ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <Bell className="h-10 w-10 text-primary-200" />
                <p className="academy-quiet">Bildirishnomalar topilmadi</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const visual = getNotificationVisual(notification.type);
                const isActive = selectedNotification?.id === notification.id;
                const headline = getNotificationHeadline(notification);
                const message = getNotificationMessage(notification);
                const roleLabel = getNotificationRoleLabel(notification);

                return (
                  <Link
                    key={notification.id}
                    to={`/notifications/${notification.id}`}
                    className={`flex items-start gap-3 border-b border-[#eef3fd] px-4 py-4 transition-colors last:border-b-0 ${
                      isActive ? "bg-[#f0f6ff]" : "hover:bg-[#f7faff]"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${visual.iconWrap}`}>
                      {visual.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className={`line-clamp-1 text-base ${notification.isRead ? "font-bold" : "font-extrabold"}`}>
                          {headline}
                        </h3>
                        <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-[color:var(--hint)]">
                          {formatDateTime(notification.createdAt).split(", ")[1] || ""}
                          {!notification.isRead ? <span className="h-2.5 w-2.5 rounded-full bg-primary-500" /> : null}
                        </span>
                      </div>
                      {isDiscussionReplyNotification(notification) && roleLabel ? (
                        <div className={`${roleChip} mt-1 !px-2.5 !py-0.5 !text-[10px]`}>{roleLabel}</div>
                      ) : null}
                      <p className="line-clamp-2 text-sm font-semibold text-[color:var(--hint)]">{message}</p>
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
