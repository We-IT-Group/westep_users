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
            <div className="academy-card !p-6 sm:!p-8 relative overflow-hidden border border-slate-100">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Title & Info */}
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 font-black text-[11px] uppercase tracking-wider">
                            <Briefcase size={13} />
                            <span>Kasb Yo‘li & Kelajak Maqsadi</span>
                        </div>
                        <h1 className="font-fredoka text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                            Kelajak Kasbingizni <span className="text-blue-600">Tanlang</span>
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
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
                                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                            />
                            {q ? (
                                <button
                                    type="button"
                                    onClick={() => setQ("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
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
                    className="academy-card !p-5 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-200/80 hover:border-blue-300"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <Compass size={22} />
                        </div>
                        <div>
                            <h4 className="font-fredoka text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                Qiziqish testi
                            </h4>
                            <p className="text-xs text-slate-500">Qaysi kasb sizga mos? (RIASEC)</p>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    to="/kasblar/mening"
                    className="academy-card !p-5 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-200/80 hover:border-amber-300"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                            <Star size={22} />
                        </div>
                        <div>
                            <h4 className="font-fredoka text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
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
                    className="academy-card !p-5 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-200/80 hover:border-emerald-300"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                            <Map size={22} />
                        </div>
                        <div>
                            <h4 className="font-fredoka text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                Yo‘l xaritasi
                            </h4>
                            <p className="text-xs text-slate-500">Bosqichma-bosqich o‘rganish</p>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* Field Filter Chips Bar */}
            <div className="academy-card !p-3 sm:!p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                    {chips.map((chip) => {
                        const active = field === chip.key;
                        return (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() => setField(chip.key)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    active
                                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                                        : "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-transparent"
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                        >
                            <X size={14} />
                            <span>Tozalash</span>
                        </button>
                    ) : null}
                </div>

                <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start md:self-auto shrink-0">
                    Mavjud: <span className="text-blue-600">{items.length} ta kasb</span>
                </div>
            </div>

            {/* Professions Grid */}
            <div>
                {listQuery.isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-64 rounded-3xl bg-white animate-pulse border border-slate-200/80" />
                        ))}
                    </div>
                ) : listQuery.isError ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-sm font-bold text-rose-500 border border-dashed border-rose-200">
                        {listQuery.error instanceof Error ? listQuery.error.message : "Kasblarni yuklab bo‘lmadi."}
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-3xl py-16 px-6 text-center space-y-4 border border-dashed border-slate-200">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                            <Briefcase size={30} />
                        </div>
                        <h3 className="text-xl font-bold font-fredoka text-slate-900">
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
                                    className="group bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(10,94,250,0.12)] hover:border-blue-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                                >
                                    {/* Card Header & Content */}
                                    <div>
                                        {/* Top badges & Emoji */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-105 duration-300 shrink-0"
                                                style={{
                                                    background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                                                }}
                                            >
                                                <span>{p.emoji || "💼"}</span>
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 whitespace-nowrap">
                                                    {p.fieldLabel}
                                                </span>
                                                {p.demand ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
                                                        <TrendingUp size={11} className="text-emerald-600" />
                                                        <span>{p.demand}</span>
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Title & Tagline */}
                                        <h3 className="font-fredoka text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug mb-1.5">
                                            {p.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 min-h-[38px] mb-4">
                                            {p.tagline}
                                        </p>

                                        {/* Metrics Strip */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1 mb-2 text-xs font-bold text-slate-600">
                                            <span className="inline-flex items-center gap-1.5 bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-xl">
                                                <BookOpen size={13} className="text-blue-600" />
                                                <span>{p.courseCount} ta kurs</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-xl">
                                                <CheckCircle2 size={13} className="text-emerald-600" />
                                                <span>Yo‘l xaritasi</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer Action */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                                            Batafsil ko‘rish
                                        </span>
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Scientific RIASEC Quiz Promotion Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl border border-white/10">
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
