import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, Map, Briefcase, CheckCircle2, Clock, AlertCircle, Trash2 } from "lucide-react";
import { useAbandonProfession, useMyProfessions } from "../../api/professions/useProfessions.ts";
import type { StudentProfessionDto } from "../../api/professions/types.ts";

const STATUS_META: Record<
    StudentProfessionDto["status"],
    { label: string; className: string; icon: React.ReactNode }
> = {
    UNDER_REVIEW: { 
        label: "Ko‘rib chiqilmoqda", 
        className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200/60",
        icon: <Clock size={12} className="text-amber-600" />
    },
    CONFIRMED: { 
        label: "Tasdiqlangan", 
        className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200/60",
        icon: <CheckCircle2 size={12} className="text-emerald-600" />
    },
    RESELECTING: { 
        label: "Qayta tanlash tavsiya etildi", 
        className: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-200/60",
        icon: <AlertCircle size={12} className="text-purple-600" />
    },
    COMPLETED: { 
        label: "Yakunlangan", 
        className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200/60",
        icon: <CheckCircle2 size={12} className="text-blue-600" />
    },
    ABANDONED: { 
        label: "Voz kechilgan", 
        className: "bg-slate-100 text-slate-500 border-slate-200",
        icon: <Trash2 size={12} className="text-slate-400" />
    },
};

export default function MeningKasblarPage() {
    const navigate = useNavigate();
    const myQuery = useMyProfessions();
    const abandonMutation = useAbandonProfession();
    const items = (myQuery.data ?? []).filter((item) => item.status !== "ABANDONED");

    return (
        <div className="space-y-6 pb-12 max-w-4xl mx-auto">
            {/* Back button */}
            <button
                type="button"
                onClick={() => navigate("/kasblar")}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
                <ArrowLeft size={16} />
                <span>Kasblar katalogiga qaytish</span>
            </button>

            {/* Header Card */}
            <div className="academy-card p-6 sm:p-8 relative overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 text-amber-700 dark:text-amber-300 font-black text-[11px] uppercase tracking-wider">
                        <span>⭐ Tanlangan yo‘nalishlar</span>
                    </div>
                    <h1 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        Mening Kasblarim
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Siz tanlagan kasblar ro‘yxati, holati va o‘rganish yo‘l xaritalari shu yerda aks etadi.
                    </p>
                </div>
            </div>

            {/* Content List */}
            {myQuery.isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-36 rounded-3xl bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="academy-card py-16 px-6 text-center space-y-4 border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
                        <Briefcase size={30} />
                    </div>
                    <h3 className="text-xl font-bold font-fredoka text-slate-900 dark:text-white">
                        Hali birorta kasb tanlamagansiz
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                        O‘zingizga mos kasbni topish uchun avval 5 daqiqalik qiziqish testidan o‘ting yoki kasblar katalogini ko‘ring.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <Link
                            to="/kasblar/test"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
                        >
                            <Compass size={14} />
                            <span>Qiziqish testidan o‘tish</span>
                        </Link>
                        <Link
                            to="/kasblar"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            <span>Kasblar katalogi</span>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const meta = STATUS_META[item.status];
                        const canRoadmap = item.status === "CONFIRMED" || item.status === "COMPLETED";

                        return (
                            <div
                                key={item.id}
                                className="academy-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
                                        {item.emoji || "💼"}
                                    </div>
                                    <div className="space-y-1.5">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/kasblar/${item.slug}`)}
                                            className="font-fredoka text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 text-left block transition-colors"
                                        >
                                            {item.title}
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${meta.className}`}>
                                                {meta.icon}
                                                <span>{meta.label}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                                    {canRoadmap ? (
                                        <Link
                                            to="/kasblar/roadmap"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-md shadow-blue-500/20 active:scale-95"
                                        >
                                            <Map size={14} />
                                            <span>Yo‘l xaritasi</span>
                                        </Link>
                                    ) : null}

                                    {item.status === "UNDER_REVIEW" || item.status === "CONFIRMED" || item.status === "RESELECTING" ? (
                                        <button
                                            type="button"
                                            disabled={abandonMutation.isPending}
                                            onClick={() => abandonMutation.mutate(item.id)}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                        >
                                            Voz kechish
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}

                    <div className="pt-2 text-center">
                        <Link
                            to="/kasblar/test"
                            className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 hover:underline"
                        >
                            <Compass size={14} />
                            <span>Boshqa soha bo‘yicha qiziqish testini qayta topshirish</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
