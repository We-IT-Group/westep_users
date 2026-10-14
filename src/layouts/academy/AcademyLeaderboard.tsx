import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyProfessions } from "../../api/professions/useProfessions.ts";
import { useLeaderboard, useStreak } from "../../api/rewards/useRewards.ts";
import {
    withMeOnBoard,
    type LeaderboardMetric,
    type LeaderboardPeriod,
    type LeaderboardScope,
} from "../../api/rewards/rewardsApi.ts";
import AcademyStatsNav from "./AcademyStatsNav.tsx";

const MEDALS = ["🥇", "🥈", "🥉"];
const AVATAR_COLORS = ["#0A5EFA", "#12B76A", "#F79009", "#7A5AF8", "#EE46BC", "#0E9384", "#0843B8"];
const WEEKDAY_SHORT = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

function nameInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function todayIso() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function streakCopy(current: number, longest: number, atRisk?: boolean) {
    if (atRisk && current > 0) {
        return {
            title: "Fitil o‘chmoqchi",
            sub: `Bugun 1 dars — ${current} kunlik olov saqlanadi.`,
            emoji: "🔥",
        };
    }
    if (current > 0) {
        return {
            title: "Olov ushlab turibdi",
            sub: `${current} kun ketma-ket. Fitil uzilmasin.`,
            emoji: "🔥",
        };
    }
    return {
        title: "Cho‘g‘ so‘ngan",
        sub: longest > 0 ? `Bugun qayta yoq — rekord ${longest} kun.` : "Bugun yoqib yubor — seriya yonadi.",
        emoji: "✨",
    };
}

export default function AcademyLeaderboard() {
    const [scope, setScope] = useState<LeaderboardScope>("GLOBAL");
    const [period, setPeriod] = useState<LeaderboardPeriod>("WEEKLY");
    const [metric, setMetric] = useState<LeaderboardMetric>("RATING");

    const myProfessionsQuery = useMyProfessions();
    const confirmedProfession = (myProfessionsQuery.data ?? []).find(
        (item) => item.status === "CONFIRMED" || item.status === "UNDER_REVIEW",
    );
    const professionId = scope === "PROFESSION" ? confirmedProfession?.professionId : undefined;
    const professionBlocked = scope === "PROFESSION" && !confirmedProfession;

    const streakQuery = useStreak();
    const leaderboardQuery = useLeaderboard(scope, period, professionId, metric);
    const board = leaderboardQuery.data ? withMeOnBoard(leaderboardQuery.data, "Sen") : undefined;
    const streak = streakQuery.data;
    const copy = streakCopy(streak?.currentDays ?? 0, streak?.longestDays ?? 0, streak?.atRisk);
    const isXp = metric === "XP";
    const pointsUnit = isXp ? "XP" : "ball";
    const scopeLabel = scope === "GLOBAL" ? "Umumiy" : scope === "AGE_GROUP" ? "Tengdosh" : "Kasbim";
    const periodLabel = period === "WEEKLY" ? "shu hafta" : "shu oy";

    return (
        <div className="academy-stats academy-dash">
            <div className="academy-dash-head">
                <div className="academy-stats-head">
                    <h2>⭐ Reyting</h2>
                    <p>{isXp ? "Ko‘proq XP — yuqoriroq o‘rin" : "Ko‘proq ball — yuqoriroq o‘rin"}</p>
                </div>
            </div>

            <AcademyStatsNav />

            <div className="academy-lb">
                <aside className="academy-lb-side">
                    <div className="academy-streak">
                        <div className="academy-streak-hero">
                            <span>{copy.emoji}</span>
                            <div>
                                <b>{copy.title}</b>
                                <p>{copy.sub}</p>
                            </div>
                            <strong>{streak?.currentDays ?? 0}</strong>
                        </div>
                        {streak?.last7Days?.length ? (
                            <div className="academy-streak-days">
                                {streak.last7Days.map((day) => {
                                    const date = new Date(`${day.date}T12:00:00`);
                                    const label = Number.isNaN(date.getTime()) ? "·" : WEEKDAY_SHORT[date.getDay()];
                                    const isToday = day.date === todayIso();
                                    return (
                                        <div
                                            key={day.date}
                                            className={`academy-streak-day${day.active ? " on" : ""}${isToday ? " today" : ""}`}
                                        >
                                            <small>{label}</small>
                                            <i />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                        <Link to="/" className="academy-cta academy-cta-brand academy-cta-compact">
                            Bugun yoqib yuborish
                        </Link>
                    </div>

                    <div className="academy-me-card">
                        <div>
                            <b>#{board?.myRank ?? "—"}</b>
                            <small>
                                Sen · {scopeLabel} · {periodLabel}
                            </small>
                        </div>
                        <div className="academy-me-pts">
                            <strong>{(board?.myPoints ?? 0).toLocaleString("uz-UZ")}</strong>
                            <small>{pointsUnit}</small>
                        </div>
                    </div>
                </aside>

                <div className="academy-card academy-lb-board">
                    <div className="academy-lb-toolbar">
                        <div className="academy-seg">
                            {(
                                [
                                    ["GLOBAL", "Umumiy"],
                                    ["AGE_GROUP", "Tengdosh"],
                                    ["PROFESSION", "Kasbim"],
                                ] as const
                            ).map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    className={scope === id ? "on" : ""}
                                    onClick={() => setScope(id)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="academy-board-controls">
                            <div className="academy-pills">
                                <button
                                    type="button"
                                    className={period === "WEEKLY" ? "on" : ""}
                                    onClick={() => setPeriod("WEEKLY")}
                                >
                                    Hafta
                                </button>
                                <button
                                    type="button"
                                    className={period === "MONTHLY" ? "on" : ""}
                                    onClick={() => setPeriod("MONTHLY")}
                                >
                                    Oy
                                </button>
                            </div>
                            <div className="academy-metric-seg">
                                <button
                                    type="button"
                                    className={!isXp ? "on" : ""}
                                    onClick={() => setMetric("RATING")}
                                >
                                    Ball
                                </button>
                                <button
                                    type="button"
                                    className={isXp ? "on" : ""}
                                    onClick={() => setMetric("XP")}
                                >
                                    XP
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="academy-legend">
                        {isXp
                            ? "Xatolar ustida ishlash +3 · kuniga 50 gacha"
                            : "Dars +10 · O‘yin +2/+5 · Seriya +2"}
                    </p>

                    {professionBlocked ? (
                        <div className="academy-empty-inline">
                            <b>Avval kasb tanla</b>
                            <p>Kasbing bo‘yicha reytingda qatnashish uchun kasb tanlagan bo‘lishing kerak.</p>
                            <Link to="/kasblar" className="academy-cta academy-cta-brand academy-cta-compact">
                                Kasblarni ko‘rish
                            </Link>
                        </div>
                    ) : leaderboardQuery.isPending ? (
                        <div className="academy-stats-skeleton" />
                    ) : leaderboardQuery.isError ? (
                        <p className="academy-quiet">{leaderboardQuery.error.message}</p>
                    ) : !board || board.items.length === 0 ? (
                        <div className="academy-empty-inline">
                            <b>Hozircha reyting bo‘sh</b>
                            <p>Birinchi bo‘lib dars qilib ball to‘plagan sen bo‘l.</p>
                        </div>
                    ) : (
                        <div className="academy-board">
                            {board.items.map((item, index) => (
                                <div
                                    key={`${item.rank}-${item.displayName}`}
                                    className={`academy-board-row${item.me ? " me" : ""}`}
                                >
                                    <em>{item.rank <= 3 ? MEDALS[item.rank - 1] : item.rank}</em>
                                    <span
                                        className="academy-ava"
                                        style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                                    >
                                        {nameInitials(item.displayName)}
                                    </span>
                                    <div>
                                        <b>{item.displayName}</b>
                                        <small>{item.me ? "Sen" : item.rank <= 3 ? `${item.rank}-o‘rin` : " "}</small>
                                    </div>
                                    <strong>
                                        {item.points.toLocaleString("uz-UZ")}
                                        <small>{pointsUnit}</small>
                                    </strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
