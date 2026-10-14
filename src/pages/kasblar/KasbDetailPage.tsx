import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, Layers, TrendingUp, BookOpen, Star, Sparkles, Map } from "lucide-react";
import { getCoursePurchaseUrl } from "../../utils/coursePurchase.ts";
import {
    useMyProfessions,
    useProfessionDetail,
    useSelectProfession,
} from "../../api/professions/useProfessions.ts";

export default function KasbDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const detailQuery = useProfessionDetail(slug);
    const myQuery = useMyProfessions();
    const selectMutation = useSelectProfession();

    const profession = detailQuery.data;
    const mine = (myQuery.data ?? []).find(
        (item) => item.professionId === profession?.id && item.status !== "ABANDONED",
    );

    if (detailQuery.isLoading) {
        return (
            <div className="py-24 text-center text-sm font-bold text-slate-500">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Kasb ma’lumotlari yuklanmoqda...</span>
            </div>
        );
    }

    if (!profession || detailQuery.isError) {
        return (
            <div className="academy-card mx-auto max-w-lg p-10 text-center space-y-4 my-12 border border-slate-200 dark:border-slate-800">
                <p className="text-lg font-black text-slate-900 dark:text-white">
                    {detailQuery.error instanceof Error ? detailQuery.error.message : "Kasb topilmadi"}
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/kasblar")}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs"
                >
                    Kasblar katalogiga qaytish
                </button>
            </div>
        );
    }

    const gradFrom = profession.grad?.from || "#0A5EFA";
    const gradTo = profession.grad?.to || "#0843B8";

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

            {/* Hero Card */}
            <div className="academy-card p-6 sm:p-8 space-y-6 relative overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                    <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl text-white shadow-xl shrink-0"
                        style={{
                            background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                        }}
                    >
                        {profession.emoji || "💼"}
                    </div>

                    <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50">
                                {profession.fieldLabel}
                            </span>
                            {profession.demand ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    <TrendingUp size={12} />
                                    <span>{profession.demand}</span>
                                </span>
                            ) : null}
                        </div>

                        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                            {profession.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {profession.tagline}
                        </p>
                    </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <small className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Clock size={12} className="text-blue-500" />
                            O‘rganish vaqti
                        </small>
                        <b className="text-sm font-black text-slate-900 dark:text-white mt-1 block">
                            {profession.duration || "6–12 oy"}
                        </b>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <small className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Layers size={12} className="text-amber-500" />
                            Talab etiladigan daraja
                        </small>
                        <b className="text-sm font-black text-slate-900 dark:text-white mt-1 block">
                            {profession.level || "Boshlang‘ich"}
                        </b>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                        <small className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <BookOpen size={12} className="text-emerald-500" />
                            Bog‘langan kurslar
                        </small>
                        <b className="text-sm font-black text-slate-900 dark:text-white mt-1 block">
                            {profession.courses?.length || 0} ta kurs
                        </b>
                    </div>
                </div>

                {/* Main Action (Select or View Status) */}
                <div className="pt-2">
                    {mine ? (
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <Link
                                to="/kasblar/mening"
                                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 text-emerald-800 dark:text-emerald-200 font-black text-xs sm:text-sm text-center flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                <span>
                                    {mine.status === "CONFIRMED"
                                        ? "Bu kasb sizda tasdiqlangan"
                                        : mine.status === "RESELECTING"
                                          ? "Qayta tanlash tavsiya etilgan"
                                          : "Kasb tanlangan — ko‘rib chiqilmoqda"}
                                </span>
                            </Link>

                            {mine.status === "CONFIRMED" || mine.status === "COMPLETED" ? (
                                <Link
                                    to="/kasblar/roadmap"
                                    className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    <Map size={16} />
                                    <span>Yo‘l xaritasini ko‘rish</span>
                                </Link>
                            ) : null}
                        </div>
                    ) : (
                        <button
                            type="button"
                            disabled={selectMutation.isPending}
                            onClick={() => selectMutation.mutate({ professionId: profession.id, source: "FREE" })}
                            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow-xl shadow-blue-500/25 active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            <Sparkles size={16} />
                            <span>{selectMutation.isPending ? "Saqlanmoqda..." : "Ushbu kasbni tanlayman"}</span>
                        </button>
                    )}

                    {selectMutation.isError ? (
                        <p className="mt-2 text-center text-xs font-bold text-rose-500">
                            {selectMutation.error instanceof Error
                                ? selectMutation.error.message
                                : "Kasbni tanlab bo‘lmadi"}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* Description Section */}
            <div className="academy-card p-6 sm:p-8 space-y-3 border border-slate-100 dark:border-slate-800">
                <h3 className="font-fredoka text-lg font-bold text-slate-900 dark:text-white">
                    Kasb haqida batafsil
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {profession.description}
                </p>
            </div>

            {/* Skills & Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills */}
                {profession.skills?.length > 0 ? (
                    <div className="academy-card p-6 space-y-3 border border-slate-100 dark:border-slate-800">
                        <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                            Kerakli ko‘nikmalar
                        </h3>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {profession.skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Daily Roles */}
                {profession.roles?.length > 0 ? (
                    <div className="academy-card p-6 space-y-3 border border-slate-100 dark:border-slate-800">
                        <h3 className="font-fredoka text-base font-bold text-slate-900 dark:text-white">
                            Kundalik vazifalar
                        </h3>
                        <ul className="space-y-2 pt-1">
                            {profession.roles.map((role) => (
                                <li key={role} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                                    <span>{role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>

            {/* Recommended Courses for this Profession */}
            {profession.courses?.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="font-fredoka text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen size={18} className="text-blue-600" />
                        <span>Kasbga yo‘naltiruvchi maxsus kurslar</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profession.courses.map((course) => (
                            <Link
                                key={course.id}
                                to={getCoursePurchaseUrl({ id: course.id })}
                                className="academy-card p-5 flex items-center justify-between gap-4 group hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800"
                            >
                                <div className="space-y-1">
                                    <div className="font-fredoka text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                        {course.name}
                                    </div>
                                    <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
                                        <span>{course.categoryLabel}</span>
                                        {course.teacherFullName ? (
                                            <>
                                                <span>·</span>
                                                <span>{course.teacherFullName}</span>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Star size={15} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
