import { Link, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { useGetUnreadCount } from "../../api/notification/useNotification";

export function NotificationDropdown() {
    const location = useLocation();
    const { data: unreadData } = useGetUnreadCount();
    const unreadCount = unreadData?.unreadCount || 0;
    const isActive = location.pathname.startsWith("/notifications");

    return (
        <div className="relative flex items-center gap-1">
            <Link
                to="/notifications"
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent transition-all sm:h-11 sm:w-11 ${
                    isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                        : "text-slate-500 hover:bg-slate-50 dark:text-blue-400 dark:hover:bg-slate-800"
                }`}
            >
                <Bell className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-blue-600 dark:text-blue-400"}`} />
                {unreadCount > 0 && (
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
                )}
            </Link>
        </div>
    );
}
