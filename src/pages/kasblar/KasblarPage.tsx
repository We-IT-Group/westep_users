import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Briefcase, 
    Compass, 
    Search, 
    Sparkles, 
    Star, 
    X, 
    ArrowRight, 
    Map, 
    BookOpen,
    TrendingUp,
    CheckCircle2
} from "lucide-react";
import { useProfessionFields, useProfessionsList, useMyProfessions } from "../../api/professions/useProfessions.ts";

function useDebouncedValue<T>(value: T, delayMs = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(id);
    }, [value, delayMs]);
    return debounced;
}

export default function KasblarPage() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [field, setField] = useState("all");
    const debouncedQ = useDebouncedValue(q);

    const fieldsQuery = useProfessionFields();
    const listQuery = useProfessionsList({ field, q: debouncedQ });
    const myProfessionsQuery = useMyProfessions();

    const confirmedCount = (myProfessionsQuery.data ?? []).filter(
        (p) => p.status === "CONFIRMED" || p.status === "UNDER_REVIEW"
    ).length;

    const chips = useMemo(() => {
        const fromApi = fieldsQuery.data?.fields ?? [];
        return [{ key: "all", label: "⚡ Barcha sohalar" }, ...fromApi];
    }, [fieldsQuery.data]);

    const items = listQuery.data?.items ?? [];

    const clearFilters = () => {
        setQ("");
        setField("all");
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Top Hero Banner & Navigation */}
            <div className="academy-card p-6 sm:p-8 relative overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Title & Info */}
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/50 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 font-black text-[11px] uppercase tracking-wider">
                            <Briefcase size={13} />
                            <span>Kasb Yo‘li & Kelajak Maqsadi</span>
                        </div>
                        <h1 className="font-fredoka text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                            Kelajak Kasbingizni <span className="text-blue-600">Tanlang</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                            O‘zingizga mos sohani kashf eting, bosqichma-bosqich yo‘l xaritasini oling va kasbga yetaklovchi darslarni boshlang.
                        </p>
                    </div>

                    {/* Integrated Search Box */}
                    <div className="w-full lg:max-w-md space-y-2">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                            <input 
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Kasb nomini qidirish (Frontend, Dizayner)..."
                                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                            />
                            {q ? (
                                <button
                                    type="button"
                                    onClick={() => setQ("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                    <X size={15} />
                                </button>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
                            <span>Mavjud kasblar: <b className="text-blue-600">{items.length} ta</b></span>
                            <span>Barcha sohalar qamrab olingan</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action Navigation Grid (Qiziqish testi, Mening kasblarim, Yo'l xaritasi) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    to="/kasblar/test"
                    className="academy-card p-5 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/60 to-white dark:from-blue-950/20 dark:to-slate-900"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <Compass size={22} />
                        </div>
                        <div>
                            <h4 className="font-fredoka text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                Qiziqish testi
                            </h4>
                            <p className="text-xs text-slate-500">Qaysi kasb sizga mos? (RIASEC)</p>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    to="/kasblar/mening"
                    className="academy-card p-5 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                            <Star size={22} />
                        </div>
                        <div>
                            <h4 className="font-fredoka text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                                Mening kasblarim
                            </h4>
                            <p className="text-xs text-slate-500">
                                {confirmedCount > 0 ? `${confirmedCount} ta kasb tanlangan` : "Tanlangan yo‘nalishlar"}
                            </p>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    to="/kasblar/roadmap"
                    className="academy-card p-5 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                            <Map size={22} />
                        </div>
                        <div>
                            <h4 className="font-fredoka text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                Yo‘l xaritasi
                            </h4>
                            <p className="text-xs text-slate-500">Bosqichma-bosqich o‘rganish</p>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* Field Filter Chips */}
            <div className="academy-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                    {chips.map((chip) => {
                        const active = field === chip.key;
                        return (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() => setField(chip.key)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                    active
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                                        : "bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 border border-slate-200/50 dark:border-slate-700/50"
                                }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}

                    {q || field !== "all" ? (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                            <X size={14} />
                            <span>Tozalash</span>
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Professions Grid */}
            <div>
                {listQuery.isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-64 rounded-[28px] bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
                        ))}
                    </div>
                ) : listQuery.isError ? (
                    <div className="academy-card p-12 text-center text-sm font-bold text-rose-500 border border-dashed border-rose-200 dark:border-rose-900/40">
                        {listQuery.error instanceof Error ? listQuery.error.message : "Kasblarni yuklab bo‘lmadi."}
                    </div>
                ) : items.length === 0 ? (
                    <div className="academy-card py-16 px-6 text-center space-y-4 border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
                            <Briefcase size={30} />
                        </div>
                        <h3 className="text-xl font-bold font-fredoka text-slate-900 dark:text-white">
                            Bu so‘rov bo‘yicha kasb topilmadi
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                            Qidiruv so‘zini o‘zgartirib ko‘ring yoki barcha sohalar bo‘yicha kasblarni ko‘ring.
                        </p>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
                        >
                            Barcha kasblarni ko‘rish
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {items.map((p) => {
                            const gradFrom = p.grad?.from || "#0A5EFA";
                            const gradTo = p.grad?.to || "#0843B8";

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/kasblar/${p.slug}`)}
                                    className="group academy-card !p-0 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-slate-100 dark:border-slate-800"
                                >
                                    {/* Card Header & Visual Icon Container */}
                                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            {/* Top badges & Emoji */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div
                                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-transform group-hover:scale-110 duration-300"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                                                    }}
                                                >
                                                    <span>{p.emoji || "💼"}</span>
                                                </div>

                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50">
                                                        {p.fieldLabel}
                                                    </span>
                                                    {p.demand ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                            <TrendingUp size={11} />
                                                            <span>{p.demand}</span>
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Title & Tagline */}
                                            <div className="space-y-1.5">
                                                <h3 className="font-fredoka text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {p.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                    {p.tagline}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Metrics Strip */}
                                        <div className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-500">
                                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                                <BookOpen size={12} className="text-blue-500" />
                                                {p.courseCount} ta kurs
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                Yo‘l xaritasi
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer Action */}
                                    <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 group-hover:underline">
                                            Batafsil ko‘rish
                                        </span>
                                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Scientific RIASEC Quiz Promotion Card */}
            <div className="academy-card p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl border border-white/10">
                <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <Sparkles size={15} />
                        <span>Qaysi soha sizga eng mos?</span>
                    </div>
                    <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-white leading-snug">
                        5 daqiqalik qiziqish testidan o‘ting va o‘zingizga mos kasbni toping!
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
                        Holland (RIASEC) metodikasi asosida shaxsiy qobiliyatlaringiz va qiziqishlaringiz tahlil qilinadi.
                    </p>
                </div>

                <Link
                    to="/kasblar/test"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-400/20 whitespace-nowrap active:scale-95"
                >
                    <Compass size={16} />
                    <span>Testni boshlash</span>
                    <ArrowRight size={15} />
                </Link>
            </div>
        </div>
    );
}
