import React from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useGetGlobalQuizHistory } from "../../api/quizHistory/useQuizHistory";
import { QuizHistoryItem } from "../../components/quizHistory/QuizHistoryItem";
import { QuizHistoryDetailModal } from "../../components/quizHistory/QuizHistoryDetailModal";
import { useNavigate } from "react-router-dom";

export function QuizHistoryPage() {
    const navigate = useNavigate();
    const { data: historyItems, isPending } = useGetGlobalQuizHistory();
    const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white">
                            TEST NATIJALAR TATIXI
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
                            Barcha urinishlaringiz ro'yxati
                        </p>
                    </div>
                </div>

                {/* List Container */}
                {isPending ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                ) : historyItems && historyItems.length > 0 ? (
                    <div className="flex flex-col gap-5">
                        {historyItems.map(summary => (
                            <QuizHistoryItem 
                                key={summary.sessionId} 
                                summary={summary} 
                                onClickViewDetail={setSelectedSessionId} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                            <span className="text-3xl font-black text-slate-300">0</span>
                        </div>
                        <h3 className="text-lg font-black uppercase text-slate-800 dark:text-slate-200">
                            TESTLAR TOPILMADI
                        </h3>
                        <p className="text-sm font-bold text-slate-500 mt-2 text-center max-w-sm">
                            Hali hech qanday quiz ishlaganingiz yo'q. Birinchi testni boshlash uchun darslarga o'ting!
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedSessionId && (
                <QuizHistoryDetailModal 
                    sessionId={selectedSessionId} 
                    onClose={() => setSelectedSessionId(null)} 
                />
            )}
        </div>
    );
}

export default QuizHistoryPage;
