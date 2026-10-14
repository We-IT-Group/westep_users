import { BarChart3, Briefcase, Home, LayoutGrid, Smile, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../api/auth/useAuth.ts";
import { ageChipLabel } from "./age.ts";

const items = [
    { to: "/", label: "Asosiy", icon: Home, match: (path: string) => path === "/" },
    {
        to: "/courses",
        label: "Fanlar",
        icon: LayoutGrid,
        match: (path: string) =>
            path === "/courses" ||
            path.startsWith("/courses/") ||
            path.startsWith("/buy-course") ||
            path.startsWith("/course-purchase"),
    },
    {
        to: "/musobaqa",
        label: "Musobaqa",
        icon: Trophy,
        match: (path: string) =>
            path === "/musobaqa" ||
            path.startsWith("/musobaqa/"),
    },
    {
        to: "/statistics",
        label: "Statistika",
        icon: BarChart3,
        match: (path: string) =>
            path === "/statistics" ||
            path === "/rewards" ||
            path === "/shop" ||
            path === "/leaderboard",
    },
    {
        to: "/kasblar",
        label: "Kasblar",
        icon: Briefcase,
        match: (path: string) => path.startsWith("/kasblar"),
    },
    {
        to: "/profile",
        label: "Men",
        icon: Smile,
        match: (path: string) =>
            path === "/profile" || path === "/subscription" || path.startsWith("/notifications"),
    },
];

export default function AcademyRail() {
    const location = useLocation();
    const { data: user } = useUser();

    return (
        <aside className="academy-rail">
            <Link to="/" className="academy-rail-logo" aria-label="Westep bosh sahifa">
                <img src="/academy/westy.png" alt="" />
            </Link>
            {items.map((item) => {
                const Icon = item.icon;
                const active = item.match(location.pathname);
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`academy-nav-btn${active ? " active" : ""}`}
                        aria-current={active ? "page" : undefined}
                    >
                        <div className="ico">
                            <Icon size={18} strokeWidth={2.4} />
                        </div>
                        <span>{item.label}</span>
                    </Link>
                );
            })}
            <div className="academy-rail-spacer" />
            <div className="academy-age-chip">{ageChipLabel(user?.birthDate)}</div>
        </aside>
    );
}
