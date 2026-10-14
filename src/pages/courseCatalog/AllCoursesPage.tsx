import { useState, useMemo, useEffect } from "react";
import { 
    Search, 
    Sparkles, 
    X,
    BookOpen,
    Clock,
    CheckCircle2,
    Play,
    ArrowRight,
    Star,
    SlidersHorizontal,
    Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetCourses } from "../../api/courses/useCourse.ts";
import type { Course } from "../../types/types.ts";
import { getCoursePurchaseUrl } from "../../utils/coursePurchase.ts";
import { baseUrlImage } from "../../api/apiClient.ts";

interface Category {
    id: string;
    label: string;
}

type SortOption = "newest" | "popular";

const categories: Category[] = [
    { id: "all", label: "⚡ Barcha kurslar" },
    { id: "enrolled", label: "✓ Yozilganlarim" }
];

const ageFilters: Category[] = [
    { id: "all", label: "Barcha yoshlar" },
    { id: "KIDS_5_8", label: "5–8 yosh" },
    { id: "JUNIOR_9_12", label: "9–12 yosh" },
    { id: "TEEN_13_17", label: "13–17 yosh" },
];

function getSubjectTheme(name: string) {
    const n = name.toLowerCase();
    if (n.includes("fizik")) {
        return {
            gradient: "from-blue-600 via-indigo-600 to-sky-700",
            glow: "bg-blue-400/30",
            emoji: "⚛",
            badge: "⚡ FIZIKA",
            accentText: "text-blue-600 dark:text-blue-400",
            accentBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60",
            defaultDesc: "Mexanika, kinematika, dinamika, elektr va optika bo‘yicha to‘liq DTM kursi va amaliy masalalar.",
            hours: "48+ soat",
        };
    }
    if (n.includes("kimyo") || n.includes("chem")) {
        return {
            gradient: "from-teal-600 via-emerald-600 to-cyan-700",
            glow: "bg-teal-400/30",
            emoji: "⚗",
            badge: "🧪 KIMYO",
            accentText: "text-emerald-600 dark:text-emerald-400",
            accentBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60",
            defaultDesc: "Anorganik va organik kimyo, reaksiyalar, davriy jadval va DTM imtihon masalalari tahlili.",
            hours: "42+ soat",
        };
    }
    if (n.includes("matemat")) {
        return {
            gradient: "from-amber-500 via-orange-500 to-amber-600",
            glow: "bg-amber-400/30",
            emoji: "∑",
            badge: "📐 MATEMATIKA",
            accentText: "text-amber-600 dark:text-amber-400",
            accentBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60",
            defaultDesc: "0 dan DTM darajasigacha: algebra, geometriya, trigonometriya, tenglamalar va testlar to‘plami.",
            hours: "56+ soat",
        };
    }
    if (n.includes("ingliz") || n.includes("english")) {
        return {
            gradient: "from-rose-500 via-pink-600 to-purple-600",
            glow: "bg-rose-400/30",
            emoji: "Aa",
            badge: "🇬🇧 INGLIZ TILI",
            accentText: "text-rose-600 dark:text-rose-400",
            accentBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60",
            defaultDesc: "Grammatika, so‘z boyligi, o‘qish va tinglash. A0 boshlang‘ichdan DTM va CEFR darajasigacha.",
            hours: "36+ soat",
        };
    }
    return {
        gradient: "from-indigo-600 via-blue-600 to-cyan-600",
        glow: "bg-indigo-400/30",
        emoji: "📘",
        badge: "📚 FAN DASTURI",
        accentText: "text-blue-600 dark:text-blue-400",
        accentBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60",
        defaultDesc: "Maktab va DTM imtihonlariga tayyorlanish uchun chuqurlashtirilgan interaktiv kurs.",
        hours: "30+ soat",
    };
}

export default function AllCoursesPage() {
    const navigate = useNavigate();
    const { data: allCourses = [], isPending } = useGetCourses();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [ageFilter, setAgeFilter] = useState("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const filteredCourses = useMemo(() => {
        let filtered = (allCourses as Course[]).filter((course) => {
            const description = course.description || course.shortDescription || "";
            const matchesSearch =
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                activeCategory === "all" ||
                (activeCategory === "enrolled" && course.purchased);
            const matchesAge =
                ageFilter === "all" ||
                (course.targetAgeGroups || []).includes(ageFilter);
            return matchesSearch && matchesCategory && matchesAge;
        });

        return filtered.sort((a, b) => {
            if (sortBy === "popular") return (b.studentsCount || 0) - (a.studentsCount || 0);
            return 0;
        });
    }, [allCourses, searchQuery, activeCategory, ageFilter, sortBy]);

    const handleCourseClick = (course: Course) => {
        navigate(getCoursePurchaseUrl(course));
    };

    const hasActiveFilters = searchQuery !== "" || activeCategory !== "all" || ageFilter !== "all" || sortBy !== "newest";

    const clearAllFilters = () => {
        setSearchQuery("");
        setActiveCategory("all");
        setAgeFilter("all");
        setSortBy("newest");
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Top Hero Banner & Search */}
            <div className="academy-card p-6 sm:p-8 relative overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Title & Info */}
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/50 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 font-black text-[11px] uppercase tracking-wider">
                            <Sparkles size={13} />
                            <span>Kurslar & Fanlar Katalogi</span>
                        </div>
                        <h1 className="font-fredoka text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                            Bilimingizni <span className="text-blue-600">Boyiting</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                            DTM standarti, interaktiv video darslar, amaliy masalalar va testlar. O‘zingizga mos fanni tanlang!
                        </p>
                    </div>

                    {/* Integrated Search Box */}
                    <div className="w-full lg:max-w-md space-y-2">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Fanni qidirish (masalan: Fizika, Matematika)..."
                                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                    <X size={15} />
                                </button>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
                            <span>Topilgan fanlar: <b className="text-blue-600">{filteredCourses.length} ta</b></span>
                            <span>Barcha darslar ochiq</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Web Filter Toolbar */}
            <div className="academy-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Direction / Category Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                                    activeCategory === cat.id
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Age Filters */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                        {ageFilters.map((age) => (
                            <button
                                key={age.id}
                                type="button"
                                onClick={() => setAgeFilter(age.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                    ageFilter === age.id
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                {age.label}
                            </button>
                        ))}
                    </div>

                    {/* Clear button if filtered */}
                    {hasActiveFilters ? (
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                            <X size={14} />
                            <span>Tozalash</span>
                        </button>
                    ) : null}
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <SlidersHorizontal size={14} className="text-slate-400" />
                    <span>Tartib:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-black text-slate-800 dark:text-white outline-none cursor-pointer focus:border-blue-500 transition-colors"
                    >
                        <option value="newest">Yangi qo‘shilganlar</option>
                        <option value="popular">Eng mashhurlar</option>
                    </select>
                </div>
            </div>

            {/* Course Cards Grid */}
            <div>
                {isPending ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-96 rounded-[32px] border border-slate-200 bg-white animate-pulse dark:border-slate-800 dark:bg-slate-900"
                            />
                        ))}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="academy-card py-16 px-6 text-center space-y-4 border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
                            <BookOpen size={30} />
                        </div>
                        <h3 className="text-xl font-bold font-fredoka text-slate-900 dark:text-white">
                            Hech qanday fan topilmadi
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                            Qidiruv so‘rovingiz yoki tanlangan yosh guruhiga mos dars topilmadi. Filtrlarni tozalab ko‘ring.
                        </p>
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
                        >
                            Barcha fanlarni ko‘rish
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course) => {
                            const theme = getSubjectTheme(course.name);
                            const imgUrl = course.attachmentUrl
                                ? `${baseUrlImage}${course.attachmentUrl}`
                                : null;

                            return (
                                <div
                                    key={course.id}
                                    onClick={() => handleCourseClick(course)}
                                    className="group academy-card !p-0 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-slate-100 dark:border-slate-800"
                                >
                                    {/* Card Visual Banner */}
                                    <div className={`relative h-44 w-full bg-gradient-to-br ${theme.gradient} overflow-hidden flex flex-col justify-between p-5 text-white`}>
                                        {/* Optional Real Image background if available */}
                                        {imgUrl ? (
                                            <img
                                                src={imgUrl}
                                                alt={course.name}
                                                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : null}

                                        {/* Decorative radial glow */}
                                        <div className={`absolute -right-8 -top-8 w-40 h-40 rounded-full ${theme.glow} blur-2xl pointer-events-none`} />

                                        {/* Top Badges */}
                                        <div className="relative z-10 flex items-center justify-between gap-2">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                                                <span>{theme.badge}</span>
                                            </div>

                                            {course.purchased ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white font-black text-[10px] shadow-sm backdrop-blur-md">
                                                    <CheckCircle2 size={11} />
                                                    <span>Yozilgansiz</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white font-black text-[10px] backdrop-blur-md border border-white/20">
                                                    <span>DTM Standarti</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Giant Floating Emoji */}
                                        <div className="relative z-10 flex items-end justify-between">
                                            <span className="text-4xl drop-shadow-md">{theme.emoji}</span>
                                            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                                <Play size={18} className="fill-current ml-0.5" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 sm:p-6 space-y-3.5 flex-1 flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <h3 className="font-fredoka text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {course.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                {course.shortDescription || course.description || theme.defaultDesc}
                                            </p>
                                        </div>

                                        {/* Key Stats Chips */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                                <BookOpen size={12} className="text-blue-500" />
                                                {course.lessonsCount || 120} ta dars
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                                <Clock size={12} className="text-amber-500" />
                                                {theme.hours}
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                                4.9
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Action Footer */}
                                    <div className="px-5 sm:px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
                                        <div className="text-xs font-black text-slate-400">
                                            {course.purchased ? (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Faol o‘qish</span>
                                            ) : (
                                                <span>Barcha darslar ochiq</span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs transition-all shadow-sm ${
                                                course.purchased
                                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                                            }`}
                                        >
                                            <span>{course.purchased ? "Davom ettirish" : "Kursga kirish"}</span>
                                            <ArrowRight size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Academy Motivation Banner */}
            <div className="academy-card p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl border border-white/10">
                <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <Award size={15} />
                        <span>O‘rganing va yutuqlarga erishing</span>
                    </div>
                    <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-white leading-snug">
                        Har bir darsni tugatib, musobaqalarda ishtirok eting!
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
                        Har bir yechilgan test va ko‘rilgan video dars sizga XP hamda reyting ballari beradi.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/musobaqa")}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-400/20 whitespace-nowrap active:scale-95"
                >
                    <span>🏆 Musobaqalarga o‘tish</span>
                    <ArrowRight size={15} />
                </button>
            </div>
        </div>
    );
}
