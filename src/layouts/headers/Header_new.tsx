import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
    Moon,
    Sun,
} from "lucide-react";
import { useUser } from "../../api/auth/useAuth.ts";
import { NotificationDropdown } from "../../components/notification/NotificationDropdown";
import WestepLogo from "../../ui/WestepLogo.tsx";
export function Header() {
    const location = useLocation();
    const { data: user } = useUser();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark");
        setIsDarkMode(isDark);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);
    const userProfile = useMemo(() => {
        const fullName =
            `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() || "Westep User";

        return {
            name: fullName,
            initials: fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((item) => item[0])
                .join("")
                .toUpperCase() || "WU",
            role: user?.roleName || "Student",
        };
    }, [user]);

    return (
        <header className="fixed top-0 left-0 w-full z-50 h-[76px] shrink-0 border-b border-slate-100 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-8">
                <div className="flex items-center gap-4 lg:gap-16">
                    <Link to="/" className="group flex shrink-0 items-center">
                        <WestepLogo className="h-11 w-auto object-contain sm:h-12" />
                    </Link>

                    <nav className="hidden items-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-1 dark:border-white/10 dark:bg-slate-900/50 lg:flex transition-colors">
                        {[
                            { to: "/", label: "Asosiy", end: true },
                            { to: "/courses", label: "Kurslar", isCourses: true },
                        ].map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => {
                                    let isLinkActive = isActive;

                                    return `rounded-xl px-5 py-2 text-sm font-extrabold transition-all outline-none ${isLinkActive
                                            ? "!bg-white !text-blue-600 shadow-sm dark:!bg-slate-700 dark:!text-blue-400"
                                            : "text-slate-500 hover:text-blue-600 dark:!text-white dark:hover:text-blue-400"
                                        }`;
                                }}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2 sm:gap-5">
                    <div className="relative flex items-center gap-1">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-slate-500 transition-all hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 sm:h-11 sm:w-11"
                            type="button"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        <NotificationDropdown />
                    </div>

                    <Link
                        to="/profile"
                        className="group ml-1 flex items-center gap-3 transition-all sm:ml-2 sm:border-l sm:border-slate-100 sm:pl-5 dark:sm:border-slate-700"
                    >
                        <div className="hidden text-right md:block">
                            <p className={`mb-1 text-[13px] font-black uppercase leading-none tracking-tight transition-colors ${location.pathname === "/profile"
                                    ? "!text-blue-600 dark:!text-blue-400"
                                    : "text-slate-900 group-hover:text-blue-600 dark:!text-white"
                                }`}>
                                {userProfile.name}
                            </p>
                            <div className="flex justify-end">
                                <span className="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    {userProfile.role}
                                </span>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-900 text-[10px] font-black uppercase text-white shadow-lg transition-colors group-hover:bg-blue-600 dark:bg-blue-600 dark:group-hover:bg-blue-500 sm:h-11 sm:w-11 sm:rounded-[16px] sm:text-xs">
                            {userProfile.initials}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
