import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Lock,
    Play,
    ChevronRight,
    Sparkles,
    Target,
    Clock,
    BookOpen,
    Zap,
    Briefcase,
    GraduationCap,
    Lightbulb,
    Flame,
    Check,
    X,
} from "lucide-react";
import { getCoursePurchaseUrl } from "../../utils/coursePurchase.ts";
import { useMyRoadmaps, useCompleteRoadmapItem } from "../../api/professions/useProfessions.ts";
import type { RoadmapItemViewDto, StudentRoadmapDto } from "../../api/professions/types.ts";

function trackOf(item: RoadmapItemViewDto): "SUBJECT" | "SKILL" | "EXPERIENCE" {
    if (item.track === "SUBJECT" || item.track === "SKILL" || item.track === "EXPERIENCE") return item.track;
    if (item.itemType === "COURSE") return "SUBJECT";
    if (item.itemType === "EXTERNAL") return "EXPERIENCE";
    return "SKILL";
}

function remainingLabel(months: number | undefined) {
    if (!months || months <= 0) return "Bu bosqich deyarli tayyor!";
    if (months >= 12) {
        const y = Math.floor(months / 12);
        const m = months % 12;
        return m > 0 ? `Qoldi ~${y} yil ${m} oy` : `Qoldi ~${y} yil`;
    }
    return `Qoldi ~${months} oy`;
}

function ItemStatusBadge({ status }: { status: RoadmapItemViewDto["status"] }) {
    if (status === "DONE") {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                <CheckCircle2 size={11} />
                <span>Bajarildi</span>
            </span>
        );
    }
    if (status === "IN_PROGRESS") {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                <Play size={10} className="fill-current" />
                <span>O‘rganilmoqda</span>
            </span>
        );
    }
    if (status === "AVAILABLE") {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                <Sparkles size={10} />
                <span>Ochiq</span>
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider">
            <Lock size={10} />
            <span>Qulflangan</span>
        </span>
    );
}

/** SVG Radial Circular Progress Indicator */
function ClosenessRing({ percent, label = "Maqsadga yaqinlik" }: { percent: number; label?: string }) {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    const radius = 38;
    const circumference = 2 * Math.PI * radius; // ~238.76
    const strokeDashoffset = circumference - (circumference * clamped) / 100;

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        className="stroke-white/20 dark:stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        className="stroke-amber-300 dark:stroke-amber-400 transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="font-fredoka text-2xl font-bold leading-none">{clamped}%</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-blue-100/90 mt-0.5">
                        Progress
                    </span>
                </div>
            </div>
            <span className="text-[11px] font-bold text-white/90 mt-1.5">{label}</span>
        </div>
    );
}

export default function RoadmapPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const wantedSlug = searchParams.get("slug");

    const roadmapsQuery = useMyRoadmaps();
    const completeItemMutation = useCompleteRoadmapItem();
    const roadmaps = roadmapsQuery.data ?? [];

    // Active roadmap selection
    const activeRoadmap: StudentRoadmapDto | undefined = wantedSlug
        ? roadmaps.find((r) => r.professionSlug === wantedSlug) || roadmaps[0]
        : roadmaps.find((r) => r.status === "ACTIVE") || roadmaps[0];

    // Selected stage filter or null for all
    const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(null);
    const [activeTabFilter, setActiveTabFilter] = useState<"ALL" | "SUBJECT" | "SKILL" | "EXPERIENCE">("ALL");

    // Modal state for manual completion confirmation
    const [confirmingItem, setConfirmingItem] = useState<RoadmapItemViewDto | null>(null);

    const handleSelectRoadmap = (slug: string) => {
        setSearchParams({ slug });
        setSelectedStageIndex(null);
    };

    if (roadmapsQuery.isLoading) {
        return (
            <div className="space-y-6 pb-12 max-w-5xl mx-auto">
                <div className="h-6 w-44 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-56 rounded-3xl bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
                <div className="h-72 rounded-3xl bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
            </div>
        );
    }

    if (roadmaps.length === 0 || !activeRoadmap) {
        return (
            <div className="space-y-6 pb-12 max-w-4xl mx-auto">
                <button
                    type="button"
                    onClick={() => navigate("/kasblar/mening")}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={16} />
                    <span>Mening kasblarimga qaytish</span>
                </button>

                <div className="academy-card py-16 px-6 text-center space-y-4 border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto text-4xl shadow-inner">
                        🗺️
                    </div>
                    <h3 className="text-2xl font-bold font-fredoka text-slate-900 dark:text-white">
                        Hali yo‘l xaritangiz shakllanmagan
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                        Qiziqishlaringizga mos kasbni tanlang. Biz siz uchun yoshingizga mos, bosqichma-bosqich o‘quv fanlari va ko‘nikmalar yo‘l xaritasini tayyorlaymiz!
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/kasblar/test")}
                            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                        >
                            <Sparkles size={16} />
                            <span>Qiziqish testini topshirish</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/kasblar")}
                            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all"
                        >
                            Kasblar katalogi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculation & metrics
    const closeness = activeRoadmap.closeness;
    const stages = activeRoadmap.stages ?? [];

    const currentStageIdx =
        closeness?.currentStageIndex != null
            ? closeness.currentStageIndex
            : stages.findIndex((s) => s.current) >= 0
            ? stages.findIndex((s) => s.current)
            : stages.findIndex((s) => !s.completed) >= 0
            ? stages.findIndex((s) => !s.completed)
            : 0;

    const currentStage = stages[currentStageIdx] || stages[0];

    // Compute track metrics
    const allItems = stages.flatMap((s) => s.items);
    const subjectItems = allItems.filter((i) => trackOf(i) === "SUBJECT");
    const skillItems = allItems.filter((i) => trackOf(i) === "SKILL");
    const experienceItems = allItems.filter((i) => trackOf(i) === "EXPERIENCE");

    const subjectsPercent =
        closeness?.subjectsPercent != null
            ? closeness.subjectsPercent
            : subjectItems.length > 0
            ? Math.round((subjectItems.filter((i) => i.status === "DONE").length / subjectItems.length) * 100)
            : 0;

    const skillsPercent =
        closeness?.skillsPercent != null
            ? closeness.skillsPercent
            : skillItems.length > 0
            ? Math.round((skillItems.filter((i) => i.status === "DONE").length / skillItems.length) * 100)
            : 0;

    const experiencePercent =
        closeness?.experiencePercent != null
            ? closeness.experiencePercent
            : experienceItems.length > 0
            ? Math.round((experienceItems.filter((i) => i.status === "DONE").length / experienceItems.length) * 100)
            : 0;

    const studentAge = closeness?.studentAge ?? 14;
    const targetReadyAge = closeness?.targetReadyAge ?? (stages[stages.length - 1]?.ageTo || 18);
    const remainingYears = closeness?.remainingYears ?? Math.max(1, targetReadyAge - studentAge);
    const stageRemainingMonths = closeness?.stageRemainingMonths ?? Math.max(1, Math.round((remainingYears * 12) / Math.max(1, stages.length)));

    // Next action
    const nextAction =
        closeness?.nextAction ??
        (() => {
            const firstInProg =
                currentStage?.items.find((i) => i.status === "IN_PROGRESS" || i.status === "AVAILABLE") ||
                allItems.find((i) => i.status === "IN_PROGRESS" || i.status === "AVAILABLE");
            if (!firstInProg) return null;
            return {
                itemId: firstInProg.id,
                title: firstInProg.title,
                itemType: firstInProg.itemType,
                courseId: firstInProg.courseId,
                estimatedMinutes: 25,
            };
        })();

    const handleItemClick = (item: RoadmapItemViewDto) => {
        if (item.status === "LOCKED") return;

        if (item.itemType === "COURSE" && item.courseId) {
            navigate(getCoursePurchaseUrl({ id: item.courseId }));
            return;
        }

        // For non-course skills/projects, prompt to mark as complete
        if (item.status === "AVAILABLE" || item.status === "IN_PROGRESS") {
            setConfirmingItem(item);
        }
    };

    const confirmCompletion = () => {
        if (!confirmingItem) return;
        completeItemMutation.mutate(confirmingItem.id, {
            onSettled: () => setConfirmingItem(null),
        });
    };

    // Filter displayed stages if user clicked on specific stage
    const displayedStages =
        selectedStageIndex != null
            ? stages.filter((_, idx) => idx === selectedStageIndex)
            : stages;

    return (
        <div className="space-y-7 pb-16 max-w-5xl mx-auto">
            {/* Top Bar: Back button & Profession switcher tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/kasblar/mening")}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors w-fit"
                >
                    <ArrowLeft size={16} />
                    <span>Mening kasblarimga qaytish</span>
                </button>

                {/* Multiple roadmaps switcher */}
                {roadmaps.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            Kasb:
                        </span>
                        {roadmaps.map((r) => {
                            const isSelected = r.id === activeRoadmap.id;
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => handleSelectRoadmap(r.professionSlug)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                        isSelected
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-100 dark:border-slate-800"
                                    }`}
                                >
                                    <span>{r.professionEmoji || "💼"}</span>
                                    <span>{r.professionTitle}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                            isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                                        }`}
                                    >
                                        {r.overallProgressPercent}%
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 🌟 HERO HORIZON DASHBOARD: Maqsadga yetish yo'li va qancha qolgani */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl border border-blue-500/20">
                {/* Background decorative glowing circles */}
                <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left & Middle Info */}
                    <div className="lg:col-span-8 space-y-5">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider">
                                <Target size={12} className="text-amber-300" />
                                <span>Kasb maqsadi yo‘l xaritasi</span>
                            </span>
                            {closeness?.directionLabel && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/40 text-indigo-100 text-[11px] font-bold">
                                    {closeness.directionLabel}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-bold">
                                <Flame size={12} className="text-amber-300" />
                                <span>{studentAge} yoshdasan</span>
                            </span>
                        </div>

                        {/* Title & Emoji */}
                        <div className="flex items-center gap-3">
                            <span className="text-4xl sm:text-5xl shrink-0 p-2 rounded-2xl bg-white/10 backdrop-blur-md">
                                {activeRoadmap.professionEmoji || "🚀"}
                            </span>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-fredoka font-bold leading-tight">
                                    {activeRoadmap.professionTitle}
                                </h1>
                                <p className="text-xs sm:text-sm text-blue-100/90 font-medium mt-1">
                                    {targetReadyAge} yoshda professional kasb egasi bo‘lish sari shaxsiy o‘quv marshruti
                                </p>
                            </div>
                        </div>

                        {/* ⏱️ MAQSADGA YETISHGA QANCHA QOLGANI: KPI kartochkalari */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-black uppercase tracking-wider">
                                    <Clock size={12} className="text-amber-300" />
                                    <span>Kasbgacha ufq</span>
                                </div>
                                <div className="font-fredoka text-xl sm:text-2xl font-bold mt-1 text-white">
                                    ~{remainingYears} yil
                                </div>
                                <div className="text-[10px] text-white/70 font-semibold mt-0.5">
                                    {targetReadyAge} yoshda to‘liq tayyor
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-black uppercase tracking-wider">
                                    <GraduationCap size={12} className="text-emerald-300" />
                                    <span>Hozirgi bosqich</span>
                                </div>
                                <div className="font-fredoka text-xl sm:text-2xl font-bold mt-1 text-white">
                                    {currentStageIdx + 1} / {stages.length}
                                </div>
                                <div className="text-[10px] text-white/70 font-semibold mt-0.5 truncate">
                                    {currentStage?.name || "Boshlang‘ich"}
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-black uppercase tracking-wider">
                                    <Sparkles size={12} className="text-amber-300" />
                                    <span>Bosqich muddati</span>
                                </div>
                                <div className="font-fredoka text-xl sm:text-2xl font-bold mt-1 text-white">
                                    ~{stageRemainingMonths} oy
                                </div>
                                <div className="text-[10px] text-white/70 font-semibold mt-0.5">
                                    Keyingi bosqich sari
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Circular Progress Ring */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
                        <ClosenessRing
                            percent={closeness?.stagePercent ?? activeRoadmap.overallProgressPercent}
                            label="Hozirgi bosqich o‘zlashtirilishi"
                        />
                        <div className="mt-3 text-center">
                            <span className="text-[11px] font-bold text-blue-100">
                                Jami {allItems.length} ta dars & topshiriq
                            </span>
                            <div className="text-[10px] text-blue-200/80">
                                {allItems.filter((i) => i.status === "DONE").length} tasi to‘liq yakunlandi
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📚 FANLAR, KO'NIKMALAR VA TAJRIBA PROGRESI */}
                <div className="relative z-10 mt-6 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Fanlar */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-1.5 text-white">
                                <BookOpen size={14} className="text-blue-300" />
                                <span>Nazariy & Fanlar</span>
                            </span>
                            <span className="font-fredoka text-amber-300">{subjectsPercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-300 transition-all duration-700"
                                style={{ width: `${subjectsPercent}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-blue-200 block">
                            {subjectItems.length} ta fan va o‘quv kurslari
                        </span>
                    </div>

                    {/* Ko'nikmalar */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-1.5 text-white">
                                <Zap size={14} className="text-amber-300" />
                                <span>Amaliy ko‘nikmalar</span>
                            </span>
                            <span className="font-fredoka text-amber-300">{skillsPercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700"
                                style={{ width: `${skillsPercent}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-blue-200 block">
                            {skillItems.length} ta asosiy malaka
                        </span>
                    </div>

                    {/* Tajriba */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-1.5 text-white">
                                <Briefcase size={14} className="text-emerald-300" />
                                <span>Tajriba & Loyihalar</span>
                            </span>
                            <span className="font-fredoka text-amber-300">{experiencePercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700"
                                style={{ width: `${experiencePercent}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-blue-200 block">
                            {experienceItems.length} ta amaliy keyslar
                        </span>
                    </div>
                </div>
            </div>

            {/* ⚡ BUGUNGI QADAM SPOTLIGHT (Next Action) */}
            {nextAction && (
                <div className="academy-card p-5 sm:p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 border-2 border-blue-200/80 dark:border-blue-800/50 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 shadow-lg shadow-blue-500/30">
                                <Play size={22} className="fill-current ml-0.5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-0.5 rounded-full">
                                        ⚡ Bugungi qadamingiz
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                        <Clock size={11} />
                                        <span>{nextAction.estimatedMinutes} daqiqa</span>
                                    </span>
                                </div>
                                <h3 className="font-fredoka text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    {nextAction.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Ushbu qadamni yakunlash maqsad sari yana bitta mustahkam zinapoyani zabt etish demakdir!
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (nextAction.courseId) {
                                    navigate(getCoursePurchaseUrl({ id: nextAction.courseId }));
                                } else {
                                    const it = allItems.find((i) => i.id === nextAction.itemId);
                                    if (it) handleItemClick(it);
                                }
                            }}
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
                        >
                            <span>Darsni boshlash</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* 🗺️ BOSQICHLAR ZANJIRI (Interactive Stage Stepper Journey) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-fredoka text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Bosqichma-bosqich o‘sish marshruti</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Yoshingiz va tayyorgarligingizga mos zanjir
                        </p>
                    </div>

                    {selectedStageIndex != null && (
                        <button
                            type="button"
                            onClick={() => setSelectedStageIndex(null)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Barcha bosqichlarni ko‘rish
                        </button>
                    )}
                </div>

                {/* Horizontal Step Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stages.map((stage, sIdx) => {
                        const isCurrent = sIdx === currentStageIdx;
                        const isDone = stage.completed;
                        const isSelected = selectedStageIndex === sIdx;
                        const ageLabel =
                            stage.ageFrom && stage.ageTo
                                ? `${stage.ageFrom}–${stage.ageTo} yosh`
                                : `Bosqich ${sIdx + 1}`;

                        return (
                            <button
                                key={`pill-${stage.orderIndex}`}
                                type="button"
                                onClick={() =>
                                    setSelectedStageIndex(selectedStageIndex === sIdx ? null : sIdx)
                                }
                                className={`text-left p-3.5 rounded-2xl transition-all border ${
                                    isSelected
                                        ? "ring-2 ring-blue-500 bg-white dark:bg-slate-900 shadow-md border-blue-500"
                                        : isCurrent
                                        ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50"
                                        : isDone
                                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-70 hover:opacity-100"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                    <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                                            isDone
                                                ? "bg-emerald-500 text-white"
                                                : isCurrent
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        }`}
                                    >
                                        {isDone ? "✓" : sIdx + 1}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {ageLabel}
                                    </span>
                                </div>
                                <div className="font-fredoka text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {stage.name}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isDone ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Yakunlangan</span>
                                    ) : isCurrent ? (
                                        <span className="text-blue-600 dark:text-blue-400 font-bold">📍 Hozir shu yerda</span>
                                    ) : (
                                        <span>🔒 Navbatdagi</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stage filter pills (All / Fanlar / Ko'nikma / Tajriba) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                    { key: "ALL", label: "Hammasi", count: allItems.length },
                    { key: "SUBJECT", label: "📚 Fanlar & Kurslar", count: subjectItems.length },
                    { key: "SKILL", label: "⚡ Ko‘nikmalar", count: skillItems.length },
                    { key: "EXPERIENCE", label: "💼 Tajriba", count: experienceItems.length },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTabFilter(tab.key as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                            activeTabFilter === tab.key
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-100 dark:border-slate-800"
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className="text-[10px] opacity-70">({tab.count})</span>
                    </button>
                ))}
            </div>

            {/* 📋 DETAILED STAGE NODES & ITEMS */}
            <div className="space-y-8">
                {displayedStages.map((stage, stageIndex) => {
                    const isCurrent = stage.orderIndex === currentStage.orderIndex;
                    const isDone = stage.completed;

                    // Filter items based on activeTabFilter
                    const filteredItems = stage.items.filter((item) => {
                        if (activeTabFilter === "ALL") return true;
                        return trackOf(item) === activeTabFilter;
                    });

                    return (
                        <div
                            key={`${activeRoadmap.id}-${stage.orderIndex}`}
                            className={`rounded-3xl p-6 sm:p-7 border transition-all ${
                                isCurrent
                                    ? "bg-white dark:bg-slate-900 border-blue-400 dark:border-blue-700 shadow-lg ring-1 ring-blue-400/30"
                                    : isDone
                                    ? "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/40 shadow-sm"
                                    : "bg-white/80 dark:bg-slate-900/80 border-slate-100 dark:border-slate-800 shadow-sm opacity-90"
                            }`}
                        >
                            {/* Stage Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-fredoka text-base font-bold shadow-sm shrink-0 ${
                                            isDone
                                                ? "bg-emerald-500 text-white"
                                                : isCurrent
                                                ? "bg-blue-600 text-white shadow-blue-500/30"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                        }`}
                                    >
                                        {isDone ? <Check size={20} /> : stageIndex + 1}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-fredoka text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                                {stage.name}
                                            </h3>
                                            {isCurrent && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                                                    Hozirgi bosqich
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {stage.ageFrom && stage.ageTo
                                                ? `${stage.ageFrom}–${stage.ageTo} yosh oralig‘ida tavsiya etiladi`
                                                : "Bosqich vazifalari"}
                                            {isCurrent && ` · ${remainingLabel(stageRemainingMonths)}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <span className="text-xs font-bold text-slate-400">
                                        {stage.items.filter((i) => i.status === "DONE").length} / {stage.items.length} bajarildi
                                    </span>
                                </div>
                            </div>

                            {/* Stage Items List */}
                            {filteredItems.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                                    Bu bo‘limda ushbu filter bo‘yicha topshiriqlar mavjud emas
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-5">
                                    {filteredItems.map((item) => {
                                        const locked = item.status === "LOCKED";
                                        const isCourse = item.itemType === "COURSE" && Boolean(item.courseId);
                                        const trackType = trackOf(item);

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleItemClick(item)}
                                                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                                    locked
                                                        ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 opacity-60 cursor-not-allowed"
                                                        : "bg-white dark:bg-slate-850 hover:bg-slate-50/80 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md cursor-pointer"
                                                }`}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs shrink-0">
                                                                {trackType === "SUBJECT" ? "📚" : trackType === "SKILL" ? "⚡" : "💼"}
                                                            </span>
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                                {trackType === "SUBJECT"
                                                                    ? "O‘quv fani"
                                                                    : trackType === "SKILL"
                                                                    ? "Ko‘nikma"
                                                                    : "Amaliyot"}
                                                            </span>
                                                            {!item.required && (
                                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                                    ixtiyoriy
                                                                </span>
                                                            )}
                                                        </div>
                                                        <ItemStatusBadge status={item.status} />
                                                    </div>

                                                    <h4 className="font-fredoka text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                                        {item.title}
                                                    </h4>

                                                    {item.description && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Bottom action row */}
                                                <div className="pt-2 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold">
                                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                                        <span>O‘zlashtirish:</span>
                                                        <span className="font-fredoka text-slate-700 dark:text-slate-200">
                                                            {item.progressPercent}%
                                                        </span>
                                                    </div>

                                                    {!locked && (
                                                        <span className="text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 text-[11px] font-bold">
                                                            <span>{isCourse ? "Kursga kirish" : "Ko‘rish"}</span>
                                                            <ChevronRight size={13} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 💡 Pedagogik maslahat / Motivatsiya bloki */}
            <div className="rounded-3xl p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-xl shadow-md shadow-amber-500/20">
                    <Lightbulb size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                        Westep murabbiylari tavsiyasi
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Har kuni atigi 30 daqiqa o‘quv fanlari va topshiriqlarni izchil bajarish orqali siz <strong>{activeRoadmap.professionTitle}</strong> kasbi bo‘yicha hozirgi bosqichni <strong>{stageRemainingMonths} oy</strong> ichida to‘liq tamomlaysiz va orzungizdagi kasb sari 25% ga yaqinlashasiz!
                    </p>
                </div>
            </div>

            {/* Confirmation Modal for non-course tasks */}
            {confirmingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="academy-card max-w-md w-full p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                                Qadamni yakunlash
                            </span>
                            <button
                                type="button"
                                onClick={() => setConfirmingItem(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-fredoka text-lg font-bold text-slate-900 dark:text-white">
                                "{confirmingItem.title}"
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Siz ushbu amaliy vazifa yoki ko‘nikmani to‘liq o‘rganib bajardingizmi? Bajarilgan deb tasdiqlasangiz, umumiy progress va kasbga yaqinlik foizingiz oshadi!
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmingItem(null)}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="button"
                                onClick={confirmCompletion}
                                disabled={completeItemMutation.isPending}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                            >
                                <Check size={14} />
                                <span>{completeItemMutation.isPending ? "Saqlanmoqda..." : "Ha, bajarildi"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
