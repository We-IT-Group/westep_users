import { useState } from "react";
import { motion } from "framer-motion";
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    History,
    Loader2,
    Trophy,
    Clock,
    XCircle,
} from "lucide-react";
import { useGetGlobalQuizHistory } from "../../api/quizHistory/useQuizHistory.ts";
import { QuizHistoryDetailModal } from "../quizHistory/QuizHistoryDetailModal.tsx";

function formatDate(dateString?: string | null) {
    if (!dateString) return "Noma'lum";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Noma'lum";

    return date.toLocaleDateString("uz-UZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatSpentSeconds(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) return `${seconds} soniya`;
    return `${minutes} daqiqa ${seconds} soniya`;
}

export function ProfileQuizHistory() {
    const { data: results = [], isPending: loading } = useGetGlobalQuizHistory();
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="flex w-full items-center justify-center rounded-[32px] border border-slate-100 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="rounded-2xl border border-slate-100 bg-white px-5 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                        {results.length} ta test
                    </div>
                </div>
            </div>

            {results.length === 0 ? (
                <div className="space-y-6 rounded-[40px] border border-dashed border-slate-100 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 sm:p-20">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[32px] bg-slate-50 text-slate-300 dark:bg-slate-800">
                        <History className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">
                            Hali natijalar yo'q
                        </h3>
                        <p className="text-sm font-bold italic text-slate-400">
                            Siz hali birorta lesson quiz ishlamagansiz.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {results.map((result, idx) => (
                        <motion.div
                            key={result.sessionId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedSessionId(result.sessionId)}
                            className="flex w-full cursor-pointer flex-col gap-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center sm:p-6"
                        >
                            <div className="flex min-w-[200px] flex-col gap-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(result.finishedAt || result.endsAt)}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                                        {Math.round(result.percentage)}%
                                    </span>
                                    <span
                                        className={`rounded-md border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                                            result.percentage < 50
                                                ? "border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                : result.percentage < 80
                                                  ? "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                  : "border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        }`}
                                    >
                                        Natija
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <span>Vaqt: {formatSpentSeconds(result.spentSeconds || 0)}</span>
                                </div>
                            </div>

                            <div className="grid flex-1 grid-cols-3 gap-3">
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-green-100 bg-green-50/50 p-4 text-center dark:border-green-900/30 dark:bg-green-900/10">
                                    <CheckCircle2 className="mb-1 h-5 w-5 text-green-500" />
                                    <span className="text-xl font-black leading-none text-green-600 dark:text-green-400">
                                        {result.correct}
                                    </span>
                                    <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-green-700/60 dark:text-green-500/60">
                                        To'g'ri
                                    </span>
                                </div>

                                <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-4 text-center dark:border-red-900/30 dark:bg-red-900/10">
                                    <XCircle className="mb-1 h-5 w-5 text-red-500" />
                                    <span className="text-xl font-black leading-none text-red-600 dark:text-red-400">
                                        {result.wrong}
                                    </span>
                                    <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-red-700/60 dark:text-red-500/60">
                                        Xato
                                    </span>
                                </div>

                                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center dark:border-slate-800 dark:bg-slate-800/50">
                                    <AlertCircle className="mb-1 h-5 w-5 text-slate-400" />
                                    <span className="text-xl font-black leading-none text-slate-600 dark:text-slate-300">
                                        {result.unanswered}
                                    </span>
                                    <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                        Belgilanmagan
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2 md:pt-0">
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedSessionId(result.sessionId);
                                    }}
                                    className="h-12 w-full rounded-[18px] bg-blue-50 px-6 text-xs font-extrabold uppercase tracking-widest text-blue-600 shadow-sm transition-all hover:bg-blue-600 hover:text-white dark:bg-blue-900/20 dark:text-blue-400 md:w-auto"
                                >
                                    Aniqroq ko'rish
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {selectedSessionId && (
                <QuizHistoryDetailModal
                    sessionId={selectedSessionId}
                    onClose={() => setSelectedSessionId(null)}
                />
            )}
        </div>
    );
}
