import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, CheckCircle2, RotateCcw, ArrowRight, Sparkles, Award } from "lucide-react";
import { useInterestQuiz, useSubmitInterestQuiz } from "../../api/professions/useProfessions.ts";
import type { InterestQuizResultDto } from "../../api/professions/types.ts";

export default function QiziqishTestPage() {
    const navigate = useNavigate();
    const quizQuery = useInterestQuiz();
    const submitMutation = useSubmitInterestQuiz();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<InterestQuizResultDto | null>(null);

    const questions = useMemo(() => quizQuery.data?.questions ?? [], [quizQuery.data]);
    const current = questions[currentIndex];
    const progress = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

    const handlePick = async (optionId: string) => {
        if (!current) return;
        const nextAnswers = { ...answers, [current.id]: optionId };
        setAnswers(nextAnswers);
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
            return;
        }
        try {
            const submitted = await submitMutation.mutateAsync(
                Object.entries(nextAnswers).map(([questionId, picked]) => ({
                    questionId,
                    optionId: picked,
                })),
            );
            setResult(submitted);
        } catch {
            setCurrentIndex(questions.length - 1);
        }
    };

    return (
        <div className="space-y-6 pb-12 max-w-3xl mx-auto">
            {/* Back button */}
            <button
                type="button"
                onClick={() => navigate("/kasblar")}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
                <ArrowLeft size={16} />
                <span>Kasblar katalogiga qaytish</span>
            </button>

            {quizQuery.isLoading ? (
                <div className="academy-card p-16 text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-500">Qiziqish savollari yuklanmoqda...</p>
                </div>
            ) : quizQuery.isError || questions.length === 0 ? (
                <div className="academy-card p-12 text-center space-y-4 border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <Compass size={28} />
                    </div>
                    <h3 className="font-fredoka text-xl font-bold text-slate-900 dark:text-white">
                        Test hozircha tayyorlanmoqda
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Savollar bazasi yangilanmoqda. Tez orada qiziqish testi ishga tushadi.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/kasblar")}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs"
                    >
                        Kasblarni ko‘rish
                    </button>
                </div>
            ) : result ? (
                /* Results View */
                <div className="space-y-6">
                    <div className="academy-card p-6 sm:p-8 space-y-6 border border-slate-100 dark:border-slate-800 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                            <Award size={32} />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                ✓ Test muvaffaqiyatli topshirildi
                            </span>
                            <h1 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                Shaxsiy Qobiliyat Natijalaringiz
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                                Holland (RIASEC) metodikasi tahliliga ko‘ra, sizda quyidagi yo‘nalishlar bo‘yicha eng yuqori moyillik aniqlandi:
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {(result.fieldScores ?? []).slice(0, 3).map((field, index) => {
                            const isTop = index === 0;

                            return (
                                <div
                                    key={field.fieldKey}
                                    className={`academy-card p-5 sm:p-6 space-y-3 border transition-all ${
                                        isTop
                                            ? "border-blue-300 dark:border-blue-800 shadow-md bg-blue-50/30 dark:bg-blue-950/20"
                                            : "border-slate-100 dark:border-slate-800"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                                                isTop ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                            }`}>
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-fredoka text-lg font-bold text-slate-900 dark:text-white">
                                                    {field.fieldLabel}
                                                </h4>
                                                {isTop ? (
                                                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                                                        Eng mos yo‘nalish
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <b className="font-fredoka text-xl font-bold text-blue-600">
                                                {field.score}%
                                            </b>
                                            <span className="text-[10px] text-slate-400 font-bold block">moslik</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${
                                                isTop ? "bg-blue-600" : "bg-indigo-500"
                                            }`}
                                            style={{ width: `${Math.min(100, field.score)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/kasblar")}
                            className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-98 flex items-center justify-center gap-2"
                        >
                            <span>Mos kasblarni ko‘rish</span>
                            <ArrowRight size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setResult(null);
                                setAnswers({});
                                setCurrentIndex(0);
                            }}
                            className="py-3.5 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <RotateCcw size={14} />
                            <span>Testni qaytadan topshirish</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* Question Stepper View */
                <div className="space-y-6">
                    {/* Progress Header */}
                    <div className="academy-card p-5 space-y-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-1 text-blue-600 font-extrabold">
                                <Sparkles size={14} />
                                <span>Savol {currentIndex + 1} / {questions.length}</span>
                            </span>
                            <span>{progress}% bajarildi</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Statement */}
                    <div className="academy-card p-6 sm:p-8 space-y-4 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Quyidagi holat sizga qanchalik yoqadi?
                        </span>
                        <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                            {current.text}
                        </h2>
                    </div>

                    {/* Option Choices */}
                    <div className="space-y-3">
                        {current.options.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                disabled={submitMutation.isPending}
                                onClick={() => void handlePick(option.id)}
                                className="academy-card !p-4 sm:!p-5 w-full flex items-center justify-between text-left group hover:border-blue-500 hover:shadow-lg transition-all duration-200 border border-slate-100 dark:border-slate-800 active:scale-99"
                            >
                                <div className="flex items-center gap-3.5">
                                    {option.emoji ? (
                                        <span className="text-2xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
                                            {option.emoji}
                                        </span>
                                    ) : null}
                                    <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                        {option.text}
                                    </span>
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-600 group-hover:bg-blue-600 flex items-center justify-center shrink-0 transition-colors">
                                    <CheckCircle2 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
