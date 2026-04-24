import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useGetQuizResultDetail } from "../../api/quizHistory/useQuizHistory";

interface QuizHistoryDetailModalProps {
    sessionId: string;
    onClose: () => void;
}

export function QuizHistoryDetailModal({ sessionId, onClose }: QuizHistoryDetailModalProps) {
    const { data: detailData, isPending } = useGetQuizResultDetail(sessionId);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    useEffect(() => {
        setActiveQuestionIndex(0);
    }, [sessionId]);

    const questions = detailData?.questions || [];
    const activeQuestion = questions[activeQuestionIndex];

    const questionStateList = useMemo(
        () =>
            questions.map((question) => {
                if (!question.selectedOption) return "unanswered" as const;
                return question.correct ? ("correct" as const) : ("wrong" as const);
            }),
        [questions],
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 !m-0">
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="relative flex max-h-full w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl animate-in zoom-in-95 duration-300 dark:border-slate-800 dark:bg-slate-950">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                            <h2 className="text-lg font-black italic tracking-wide uppercase text-slate-800 dark:text-white">
                                Test Natijasi
                            </h2>
                            {detailData ? (
                                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    {detailData.summary.correct} to'g'ri · {detailData.summary.wrong} xato · {Math.round(detailData.summary.percentage)}%
                                </p>
                            ) : null}
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-200/50 text-slate-500 transition-colors hover:text-slate-700 dark:bg-slate-800 dark:hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="max-h-[calc(100vh-140px)] overflow-y-auto bg-slate-50/30 p-4 sm:p-6 dark:bg-slate-950">
                        {isPending ? (
                            <div className="flex h-40 items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            </div>
                        ) : detailData && activeQuestion ? (
                            <div className="space-y-6">
                                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                {activeQuestion.orderIndex}
                                            </span>
                                            <div className="space-y-3">
                                                <p className="text-lg font-bold leading-relaxed text-slate-800 dark:text-slate-200 sm:text-xl">
                                                    {activeQuestion.questionText}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeQuestion.correct ? (
                                                        <span className="rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                                            To'g'ri belgilangan
                                                        </span>
                                                    ) : activeQuestion.selectedOption ? (
                                                        <span className="rounded-lg bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-700 dark:bg-red-900/40 dark:text-red-400">
                                                            Noto'g'ri belgilangan
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                            Belgilanmagan
                                                        </span>
                                                    )}

                                                    {activeQuestion.selectedOption ? (
                                                        <span className="rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                            Siz tanlagan: {activeQuestion.selectedOption}
                                                        </span>
                                                    ) : null}

                                                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                        To'g'ri javob: {activeQuestion.correctOption}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {[
                                            { key: "A", text: activeQuestion.optionA },
                                            { key: "B", text: activeQuestion.optionB },
                                            { key: "C", text: activeQuestion.optionC },
                                            { key: "D", text: activeQuestion.optionD },
                                        ].map((opt) => {
                                            const isSelected = activeQuestion.selectedOption === opt.key;
                                            const isActuallyCorrect = activeQuestion.correctOption === opt.key;

                                            let optionStyle =
                                                "border-slate-100 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400";

                                            if (isActuallyCorrect) {
                                                optionStyle =
                                                    "border-green-200 bg-green-50 text-green-700 ring-2 ring-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/30";
                                            } else if (isSelected) {
                                                optionStyle =
                                                    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300";
                                            }

                                            return (
                                                <div
                                                    key={opt.key}
                                                    className={`flex items-start gap-3 rounded-2xl border-2 p-4 transition-all ${optionStyle}`}
                                                >
                                                    <div
                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-black ${
                                                            isActuallyCorrect
                                                                ? "border-green-200 bg-green-200 text-green-800 dark:border-green-800 dark:bg-green-800 dark:text-green-100"
                                                                : isSelected
                                                                  ? "border-red-200 bg-red-200 text-red-800 dark:border-red-800 dark:bg-red-800 dark:text-red-100"
                                                                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                                                        }`}
                                                    >
                                                        {opt.key}
                                                    </div>
                                                    <span className="font-bold text-[14px]">{opt.text}</span>
                                                    {isActuallyCorrect ? (
                                                        <Check className="ml-auto h-5 w-5 shrink-0 text-green-500 dark:text-green-400" />
                                                    ) : isSelected ? (
                                                        <X className="ml-auto h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-40 flex-col items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-400">
                                Natija topilmadi
                            </div>
                        )}
                    </div>
                </div>

                {!isPending && questions.length > 0 ? (
                    <aside className="hidden w-[320px] shrink-0 border-l border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex lg:flex-col">
                        <div className="border-b border-slate-100 bg-slate-50/30 p-6 dark:border-slate-800 dark:bg-slate-900/30">
                            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500">
                                Navigatsiya
                            </h3>
                        </div>
                        <div className="grid grid-cols-4 gap-4 overflow-y-auto p-6">
                            {questions.map((question, index) => {
                                const state = questionStateList[index];
                                const isActive = index === activeQuestionIndex;

                                const stateClasses =
                                    state === "correct"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400"
                                        : state === "wrong"
                                          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400"
                                          : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500";

                                return (
                                    <button
                                        key={question.orderIndex}
                                        type="button"
                                        onClick={() => setActiveQuestionIndex(index)}
                                        className={`flex h-14 w-14 items-center justify-center rounded-full border text-sm font-black transition-all ${
                                            isActive
                                                ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-none"
                                                : stateClasses
                                        }`}
                                    >
                                        {question.orderIndex}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>
                ) : null}
            </div>
        </div>
    );
}
