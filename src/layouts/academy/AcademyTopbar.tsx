import { Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../api/auth/useAuth.ts";
import { useGetLearningStats } from "../../api/courses/useCourse.ts";
import { useGetUnreadCount } from "../../api/notification/useNotification.ts";
import { useMyProfessions } from "../../api/professions/useProfessions.ts";
import type { StudentProfessionDto } from "../../api/professions/types.ts";

type LearningStatsResponse = {
    thisMonthActiveDays?: number;
    totalWatchedMinutes?: number;
};

const PROFESSION_PRIORITY: StudentProfessionDto["status"][] = [
    "CONFIRMED",
    "COMPLETED",
    "UNDER_REVIEW",
    "RESELECTING",
];

function pickActiveProfession(items: StudentProfessionDto[]) {
    for (const status of PROFESSION_PRIORITY) {
        const found = items.find((item) => item.status === status);
        if (found) return found;
    }
    return undefined;
}

function professionHref(item: StudentProfessionDto) {
    if (item.status === "CONFIRMED" || item.status === "COMPLETED") return "/kasblar/roadmap";
    return `/kasblar/${item.slug}`;
}

function shortProfessionTitle(title: string) {
    return title.split(" (")[0].trim() || title;
}

export default function AcademyTopbar() {
    const location = useLocation();
    const { data: user } = useUser();
    const { data: unreadData } = useGetUnreadCount();
    const { data: learningStats } = useGetLearningStats();
    const professionsQuery = useMyProfessions();
    const stats = learningStats as LearningStatsResponse | undefined;
    const unreadCount = unreadData?.unreadCount || 0;
    const firstName = user?.firstname?.trim() || "do'stim";
    const streak = stats?.thisMonthActiveDays ?? 0;
    const stars = Math.max(0, Math.round((stats?.totalWatchedMinutes ?? 0) / 5));
    const home = location.pathname === "/";
    const profession = pickActiveProfession(professionsQuery.data ?? []);
    const professionReady = professionsQuery.isSuccess;

    return (
        <header className="academy-topbar">
            <div className="academy-greet">
                <h1>Salom, {firstName}</h1>
                <p>
                    {home && profession
                        ? `Tanlangan kasb · ${profession.title}`
                        : "Bugun yangi dars seni kutmoqda"}
                </p>
            </div>
            <div className="academy-chips">
                {professionReady ? (
                    profession ? (
                        <Link
                            to={professionHref(profession)}
                            className="academy-chip job"
                            aria-label={`Tanlangan kasb: ${profession.title}`}
                        >
                            <span>{profession.emoji || "💼"}</span>
                            <b>{shortProfessionTitle(profession.title)}</b>
                        </Link>
                    ) : home ? (
                        <Link to="/onboarding" className="academy-chip job" aria-label="Kasb tanlash">
                            <span>💼</span>
                            <b>Kasb tanla</b>
                        </Link>
                    ) : null
                ) : null}
                <Link to="/statistics" className="academy-chip fire" aria-label="Seriya">
                    🔥 {streak}
                </Link>
                <Link to="/statistics" className="academy-chip star" aria-label="Yulduz">
                    ⭐ {stars}
                </Link>
                <Link to="/notifications" className="academy-chip bell" aria-label="Bildirishnomalar">
                    <Bell size={18} />
                    {unreadCount > 0 ? <i className="dot" /> : null}
                </Link>
            </div>
        </header>
    );
}
