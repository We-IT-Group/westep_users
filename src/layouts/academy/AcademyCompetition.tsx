import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Trophy,
    Flame,
    Award,
    Clock,
    Users,
    ArrowRight,
    ShieldCheck,
    Sparkles,
    Zap,
    CheckCircle2,
    Gift,
    Medal,
    X,
    ChevronRight,
} from "lucide-react";
import { useUser } from "../../api/auth/useAuth.ts";
import { useLeaderboard, useStreak } from "../../api/rewards/useRewards.ts";
import { withMeOnBoard } from "../../api/rewards/rewardsApi.ts";

export interface CompetitionItem {
    id: string;
    title: string;
    category: "ALL" | "OLYMPIAD" | "DUEL" | "CHALLENGE";
    categoryLabel: string;
    subject: string;
    subjectEmoji: string;
    badge: string;
    badgeTone: "live" | "hot" | "new" | "soon";
    status: "ACTIVE" | "UPCOMING" | "ALWAYS_ON";
    participantsCount: number;
    questionsCount: number;
    durationMinutes: number;
    xpReward: number;
    coinReward: number;
    grandPrize: string;
    prizes: string[];
    description: string;
    timeLeft?: string;
    isFeatured?: boolean;
}

const COMPETITIONS: CompetitionItem[] = [
    {
        id: "westep-grand-math-2026",
        title: "Westep Respublika Matematika va Mantiq Katta Olimpiadasi",
        category: "OLYMPIAD",
        categoryLabel: "Olimpiada",
        subject: "Matematika",
        subjectEmoji: "📐",
        badge: "🔥 JONLI EFIR · 2 KUN QOLDI",
        badgeTone: "live",
        status: "ACTIVE",
        participantsCount: 486,
        questionsCount: 25,
        durationMinutes: 45,
        xpReward: 3500,
        coinReward: 800,
        grandPrize: "Smart Planshet + 1,000 ⭐",
        prizes: [
            "🥇 1-o'rin: Smart Planshet + 1000 ⭐ Yulduz",
            "🥈 2-o'rin: Smart Soat + 500 ⭐ Yulduz",
            "🥉 3-o'rin: Kitoblar to'plami + 300 ⭐ Yulduz",
            "🎖 Top-10: Maxsus Faxriy Diplom va +1000 XP",
        ],
        description:
            "5–9 sinf o'quvchilari o'rtasidagi eng yirik bilimlar jangi. Mantiqiy, amaliy va nostandart masalalarni birinchilar qatorida yechib, respublika yetakchisiga aylan!",
        timeLeft: "2 kun 14 soat",
        isFeatured: true,
    },
    {
        id: "duel-arena-1v1",
        title: "1 vs 1 Tezkor Bilim Ringi (Duel Arena)",
        category: "DUEL",
        categoryLabel: "1 vs 1 Duel",
        subject: "Aralash fanlar",
        subjectEmoji: "⚔️",
        badge: "⚡ 24/7 OCHIQ ARENA",
        badgeTone: "hot",
        status: "ALWAYS_ON",
        participantsCount: 1240,
        questionsCount: 5,
        durationMinutes: 3,
        xpReward: 150,
        coinReward: 50,
        grandPrize: "+150 XP har g'alabaga",
        prizes: [
            "⚔️ G'alaba qozonish: +150 XP va +50 Coin",
            "🔥 3 ta ketma-ket g'alaba: 'Yengilmas' nishoni",
            "🛡️ Olov seriyasiga hisoblanadi",
        ],
        description:
            "Tasodifiy tengdosh bilan 5 ta tezkor savolda bellash. Har bir savolga 15 soniya! Kim chaqqonroq va bilimliroq?",
        timeLeft: "Doimiy",
    },
    {
        id: "english-speed-master",
        title: "Ingliz Tili: Speed Vocabulary & Grammar Clash",
        category: "CHALLENGE",
        categoryLabel: "Challenge",
        subject: "Ingliz tili",
        subjectEmoji: "🇬🇧",
        badge: "✨ BU HAFTALIK",
        badgeTone: "new",
        status: "ACTIVE",
        participantsCount: 312,
        questionsCount: 30,
        durationMinutes: 20,
        xpReward: 2000,
        coinReward: 400,
        grandPrize: "Polyglot Pro Sertifikati + 500 ⭐",
        prizes: [
            "🥇 1-o'rin: 2,000 XP + 500 Coin + Polyglot nishoni",
            "🥈 2-o'rin: 1,500 XP + 300 Coin",
            "🥉 3-o'rin: 1,000 XP + 200 Coin",
        ],
        description:
            "So'z boyligi va grammatika bo'yicha tezkor musobaqa. O'qish, sinonimlar va to'g'ri grammatik konstruktsiyalarni topish.",
        timeLeft: "3 kun qoldi",
    },
    {
        id: "physics-cosmos-quest",
        title: "Fizika & Koinot Qonunlari Turniri",
        category: "OLYMPIAD",
        categoryLabel: "Olimpiada",
        subject: "Fizika",
        subjectEmoji: "🚀",
        badge: "🔭 O'RTA DARAJA",
        badgeTone: "new",
        status: "ACTIVE",
        participantsCount: 224,
        questionsCount: 18,
        durationMinutes: 30,
        xpReward: 2500,
        coinReward: 600,
        grandPrize: "Nyuton Medali + 600 Coin",
        prizes: [
            "🥇 1-o'rin: 2,500 XP + Oltin Fizik medali",
            "🥈 2-o'rin: 1,800 XP + Kumush medal",
            "🥉 3-o'rin: 1,200 XP + Bronza medal",
        ],
        description:
            "Harakat, kuch, gravitatsiya va optika masalalari. Laboratoriya simulyatsiyalari asosidagi vizual savollar.",
        timeLeft: "4 kun qoldi",
    },
    {
        id: "coding-junior-cup",
        title: "Dasturlash va Algoritmlar Junior Ligi",
        category: "CHALLENGE",
        categoryLabel: "Challenge",
        subject: "IT & Algoritm",
        subjectEmoji: "💻",
        badge: "⏰ ERTAGA 18:00 DA",
        badgeTone: "soon",
        status: "UPCOMING",
        participantsCount: 185,
        questionsCount: 15,
        durationMinutes: 35,
        xpReward: 3000,
        coinReward: 700,
        grandPrize: "Westep Junior Dev unvoni",
        prizes: [
            "🥇 1-o'rin: 3,000 XP + 700 Coin + 1 oylik Pro obuna",
            "🥈 2-o'rin: 2,000 XP + 500 Coin",
            "🥉 3-o'rin: 1,500 XP + 300 Coin",
        ],
        description:
            "Mantiqiy algoritmlar, tsikllar, shartlar va blokli kod sinovlari. Yosh dasturchilarning sevimli ligasi!",
        timeLeft: "Ertaga start",
    },
    {
        id: "history-civilizations",
        title: "Tarix Bilimdoni: Buyuk Sivilizatsiyalar",
        category: "CHALLENGE",
        categoryLabel: "Challenge",
        subject: "Tarix",
        subjectEmoji: "🏛️",
        badge: "📜 QIZIQARLI FAKTLAR",
        badgeTone: "new",
        status: "ACTIVE",
        participantsCount: 198,
        questionsCount: 20,
        durationMinutes: 20,
        xpReward: 1600,
        coinReward: 350,
        grandPrize: "Tarixchi Kubogi + 350 Coin",
        prizes: [
            "🥇 1-o'rin: 1,600 XP + 350 Coin",
            "🥈 2-o'rin: 1,200 XP + 250 Coin",
            "🥉 3-o'rin: 900 XP + 150 Coin",
        ],
        description:
            "Qadimgi Sharq, Yunoniston, Rim va Amir Temur saltanati bo'yicha qiziqarli va nodir testlar.",
        timeLeft: "5 kun qoldi",
    },
];

export default function AcademyCompetition() {
    const navigate = useNavigate();
    const { data: user } = useUser();
    const { data: streak } = useStreak();
    const leaderboardQuery = useLeaderboard("GLOBAL", "WEEKLY", undefined, "RATING");
    const board = leaderboardQuery.data ? withMeOnBoard(leaderboardQuery.data, "Sen") : undefined;

    const [activeTab, setActiveTab] = useState<"ALL" | "OLYMPIAD" | "DUEL" | "CHALLENGE">("ALL");
    const [selectedCompetition, setSelectedCompetition] = useState<CompetitionItem | null>(null);

    const filteredCompetitions = COMPETITIONS.filter(
        (c) => activeTab === "ALL" || c.category === activeTab,
    );

    const topThree = (board?.items ?? []).slice(0, 3);
    const myRank = board?.myRank ?? 12;
    const myScore = board?.myPoints ?? 1420;

    const handleStartCompetition = (comp: CompetitionItem) => {
        setSelectedCompetition(null);
        if (comp.category === "DUEL") {
            navigate("/courses");
        } else {
            navigate("/courses");
        }
    };

    return (
        <div className="academy-stats academy-dash academy-competition-page">
            {/* Top Header */}
            <div className="academy-dash-head">
                <div className="academy-stats-head">
                    <div className="inline-flex items-center gap-2 mb-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                        <Trophy size={14} />
                        Musobaqalar & Olimpiadalar Arenasi
                    </div>
                    <h2>🏆 Westep Musobaqalari</h2>
                    <p>
                        Bilimingni sinovdan o‘tkaz, tengdoshlaring bilan bellash va qimmatbaho sovg‘alarni yutib ol!
                    </p>
                </div>

                {/* KPI stats */}
                <div className="academy-dash-kpis">
                    <div className="academy-kpi">
                        <small className="flex items-center gap-1 text-slate-500">
                            <Gift size={13} className="text-amber-500" /> Sovrin fondi
                        </small>
                        <b className="text-amber-600 text-lg">1.5M so‘m</b>
                        <span>+ planshetlar</span>
                    </div>

                    <div className="academy-kpi">
                        <small className="flex items-center gap-1 text-slate-500">
                            <Flame size={13} className="text-orange-500" /> Seriya
                        </small>
                        <b className="text-orange-600 text-lg">{streak?.currentDays ?? 0} kun</b>
                        <span>olov o‘chmasin</span>
                    </div>

                    <div className="academy-kpi">
                        <small className="flex items-center gap-1 text-slate-500">
                            <Medal size={13} className="text-blue-500" /> Sening o‘rning
                        </small>
                        <b className="text-blue-600 text-lg">#{myRank}</b>
                        <span>{myScore} ball</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="academy-dash-tabs" aria-label="Musobaqa toifalari">
                <button
                    type="button"
                    onClick={() => setActiveTab("ALL")}
                    className={activeTab === "ALL" ? "on" : ""}
                >
                    ⚡ Barcha musobaqalar
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("OLYMPIAD")}
                    className={activeTab === "OLYMPIAD" ? "on" : ""}
                >
                    🏆 Katta Olimpiadalar
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("DUEL")}
                    className={activeTab === "DUEL" ? "on" : ""}
                >
                    ⚔️ 1 vs 1 Duel Arena
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("CHALLENGE")}
                    className={activeTab === "CHALLENGE" ? "on" : ""}
                >
                    🌟 Fan Challenge'lari
                </button>
            </nav>

            {/* Featured Hero Banner */}
            {activeTab === "ALL" || activeTab === "OLYMPIAD" ? (
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-900 via-blue-900 to-sky-800 text-white p-6 sm:p-10 shadow-2xl border border-white/10">
                    <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
                    <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="max-w-2xl space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] uppercase tracking-wider shadow-lg">
                                <Sparkles size={13} />
                                <span>Haftalik Bosh Olimpiada · Jonli efir</span>
                            </div>

                            <h3 className="text-2xl sm:text-4xl font-black font-fredoka tracking-tight leading-tight text-white">
                                Westep Respublika Matematika va Mantiq Olimpiadasi
                            </h3>

                            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
                                5–9 sinflar o‘rtasida o‘tkaziladigan respublika darajasidagi katta bilimlar musobaqasi.
                                25 ta masala, 45 daqiqa. G‘oliblarni haqiqiy planshet va qimmatbaho sovrinlar kutmoqda!
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
                                    <Clock size={16} className="text-amber-300" />
                                    <span className="text-xs font-bold">45 daqiqa</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
                                    <Award size={16} className="text-emerald-300" />
                                    <span className="text-xs font-bold">Smart Planshet + 1000 ⭐</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
                                    <Users size={16} className="text-sky-300" />
                                    <span className="text-xs font-bold">486 nafar qatnashmoqda</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
                            <button
                                type="button"
                                onClick={() => setSelectedCompetition(COMPETITIONS[0])}
                                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base transition-all duration-200 shadow-xl shadow-amber-400/25 active:scale-95"
                            >
                                <Zap size={18} />
                                <span>Qatnashish</span>
                            </button>
                            <Link
                                to="/leaderboard"
                                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all duration-200 backdrop-blur-md border border-white/15 text-center"
                            >
                                <span>G‘oliblarni ko‘rish</span>
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Competitions Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-fredoka text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>🔥 Faol musobaqalar</span>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {filteredCompetitions.length} ta
                        </span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500">
                        Har bir natija haftalik reytingga qo‘shiladi
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCompetitions.map((comp) => {
                        return (
                            <div
                                key={comp.id}
                                className="academy-card flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-slate-100 dark:border-slate-800"
                            >
                                <div className="space-y-3.5">
                                    {/* Top badge and category */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{comp.subjectEmoji}</span>
                                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                                                {comp.subject}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50">
                                            {comp.badge}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h4 className="font-fredoka text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                                        {comp.title}
                                    </h4>

                                    {/* Description */}
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                        {comp.description}
                                    </p>

                                    {/* Quick chips */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                            <Clock size={12} className="text-blue-500" />
                                            {comp.durationMinutes} daq
                                        </span>
                                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                            <Award size={12} className="text-amber-500" />
                                            {comp.questionsCount} savol
                                        </span>
                                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                            <Users size={12} className="text-emerald-500" />
                                            {comp.participantsCount}
                                        </span>
                                    </div>

                                    {/* Prize highlight */}
                                    <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-center gap-2">
                                        <Gift size={16} className="text-amber-600 shrink-0" />
                                        <div className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                                            {comp.grandPrize}
                                        </div>
                                    </div>
                                </div>

                                {/* Action button */}
                                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
                                    <div className="text-[11px] font-black text-slate-400">
                                        +{comp.xpReward} XP
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCompetition(comp)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
                                    >
                                        <span>Batafsil / Qatnashish</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Section: Top-3 Podium & Fair Play Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Podium / Leaderboard Teaser */}
                <div className="academy-card lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-fredoka text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>👑 G‘oliblar minbari</span>
                            </h3>
                            <p className="text-xs text-slate-500">
                                Joriy haftadagi eng yuqori natija qayd etgan o‘quvchilar
                            </p>
                        </div>
                        <Link
                            to="/leaderboard"
                            className="text-xs font-extrabold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
                        >
                            <span>To‘liq reyting</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                        {/* 2nd place */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-end">
                            <span className="text-3xl mb-1">🥈</span>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-white truncate max-w-full">
                                {topThree[1]?.displayName || "Jasur B."}
                            </span>
                            <span className="text-[11px] font-black text-blue-600">
                                {topThree[1]?.points ?? 2840} ball
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1">2-o‘rin</span>
                        </div>

                        {/* 1st place */}
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 flex flex-col items-center justify-end shadow-md -translate-y-2">
                            <span className="text-4xl mb-1">🥇</span>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-full">
                                {topThree[0]?.displayName || "Madina K."}
                            </span>
                            <span className="text-[11px] font-black text-amber-600">
                                {topThree[0]?.points ?? 3150} ball
                            </span>
                            <span className="text-[10px] text-amber-600 font-black mt-1 uppercase tracking-wider">
                                Chempion
                            </span>
                        </div>

                        {/* 3rd place */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-end">
                            <span className="text-3xl mb-1">🥉</span>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-white truncate max-w-full">
                                {topThree[2]?.displayName || "Samandar T."}
                            </span>
                            <span className="text-[11px] font-black text-blue-600">
                                {topThree[2]?.points ?? 2610} ball
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1">3-o‘rin</span>
                        </div>
                    </div>

                    {/* My Position Row */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                                #{myRank}
                            </div>
                            <div>
                                <b className="text-xs text-slate-900 dark:text-white block">
                                    {user?.firstname ? `${user.firstname} (Sen)` : "Sening natijang"}
                                </b>
                                <small className="text-[11px] text-slate-500">
                                    Top-10 ga kirish uchun yana 180 ball kerak
                                </small>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                                {myScore} ball
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Jami to‘plandi</span>
                        </div>
                    </div>
                </div>

                {/* Fair Play & Rules */}
                <div className="academy-card flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-fredoka font-bold text-base">
                            <ShieldCheck className="text-emerald-500" size={18} />
                            <span>Adolatli Musobaqa Qoidalari</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Barcha musobaqalar avtomatlashtirilgan anti-cheat va vaqt nazorati tizimi orqali nazorat qilinadi:
                        </p>

                        <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>Har bir savolga belgilangan vaqt ichida mustaqil javob beriladi.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>Teng ball to‘planganda, eng kam vaqt sarflagan o‘quvchi yuqori o‘rinni oladi.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>G‘oliblar yakshanba kuni soat 23:59 da rasman e’lon qilinadi.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500">
                        🎁 Sovrinlar g‘olib o‘quvchining manziliga bepul yetkazib beriladi yoki platforma hisobiga o‘tkaziladi.
                    </div>
                </div>
            </div>

            {/* Modal Dialog for Competition Details & Start */}
            {selectedCompetition ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                        <button
                            type="button"
                            onClick={() => setSelectedCompetition(null)}
                            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3">
                            <span className="text-4xl p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40">
                                {selectedCompetition.subjectEmoji}
                            </span>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    {selectedCompetition.categoryLabel} · {selectedCompetition.subject}
                                </span>
                                <h3 className="text-xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
                                    {selectedCompetition.title}
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {selectedCompetition.description}
                        </p>

                        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block">Vaqt</span>
                                <b className="text-sm font-black text-slate-900 dark:text-white">
                                    {selectedCompetition.durationMinutes} daqiqa
                                </b>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block">Savollar</span>
                                <b className="text-sm font-black text-slate-900 dark:text-white">
                                    {selectedCompetition.questionsCount} ta
                                </b>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block">Mukofot</span>
                                <b className="text-sm font-black text-amber-600">
                                    +{selectedCompetition.xpReward} XP
                                </b>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                🎁 Sovrinlar:
                            </h5>
                            <div className="space-y-1.5">
                                {selectedCompetition.prizes.map((p, idx) => (
                                    <div
                                        key={idx}
                                        className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={13} className="text-amber-500 shrink-0" />
                                        <span>{p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedCompetition(null)}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStartCompetition(selectedCompetition)}
                                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-black text-xs text-white transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-1.5"
                            >
                                <Zap size={15} />
                                <span>Musobaqani boshlash</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
