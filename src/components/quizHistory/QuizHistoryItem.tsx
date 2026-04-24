import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from "lucide-react";
import moment from "moment";
import 'moment/locale/uz-latn';
import type { LessonQuizResultSummary } from "../../api/quizHistory/useQuizHistory";

// Format functions
function formatSpentSeconds(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) return `${seconds} soniya`;
    return `${minutes} daqiqa ${seconds} soniya`;
}

interface QuizHistoryItemProps {
    summary: LessonQuizResultSummary;
    onClickViewDetail: (id: string) => void;
}

export function QuizHistoryItem({ summary, onClickViewDetail }: QuizHistoryItemProps) {
    
    // Determine badge color based on score
    let badgeColor = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    if (summary.percentage < 50) {
        badgeColor = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    } else if (summary.percentage < 80) {
        badgeColor = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md flex flex-col md:flex-row gap-5 md:items-center w-full">
            
            {/* Left Block: Date & Score Card */}
            <div className="flex flex-col gap-3 min-w-[200px]">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {moment(summary.finishedAt || summary.endsAt).locale('uz-latn').format("DD MMM YYYY, HH:mm")}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                        {Math.round(summary.percentage)}%
                    </span>
                    <span className={`px-2.5 py-1 uppercase font-black text-[9px] tracking-widest rounded-md border ${badgeColor}`}>
                        Natija
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[13px]">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Vaqt: {formatSpentSeconds(summary.spentSeconds)}</span>
                </div>
            </div>

            {/* Middle Block: General Stats Grid */}
            <div className="flex-1 grid grid-cols-3 gap-3">
                <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                    <span className="text-green-600 dark:text-green-400 font-black text-xl leading-none">{summary.correct}</span>
                    <span className="text-green-700/60 dark:text-green-500/60 font-bold uppercase tracking-widest text-[9px] mt-1">To'g'ri</span>
                </div>

                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <XCircle className="w-5 h-5 text-red-500 mb-1" />
                    <span className="text-red-600 dark:text-red-400 font-black text-xl leading-none">{summary.wrong}</span>
                    <span className="text-red-700/60 dark:text-red-500/60 font-bold uppercase tracking-widest text-[9px] mt-1">Xato</span>
                </div>

                <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-slate-600 dark:text-slate-300 font-black text-xl leading-none">{summary.unanswered}</span>
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-1">Belgilanmagan</span>
                </div>
            </div>

            {/* Right Block: Actions */}
            <div className="flex justify-end pt-2 md:pt-0">
                <button
                    type="button"
                    onClick={() => onClickViewDetail(summary.sessionId)}
                    className="h-12 w-full md:w-auto px-6 rounded-[18px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white border border-transparent transition-all shadow-sm font-extrabold text-xs uppercase tracking-widest"
                >
                    Aniqroq ko'rish
                </button>
            </div>
            
        </div>
    );
}
