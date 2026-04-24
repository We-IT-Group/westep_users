import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useGetLessonQuizHistory } from "../../api/quizHistory/useQuizHistory";
import { QuizHistoryItem } from "./QuizHistoryItem";
import { QuizHistoryDetailModal } from "./QuizHistoryDetailModal";

interface QuizHistoryListProps {
    lessonId: string;
}

export function QuizHistoryList({ lessonId }: QuizHistoryListProps) {
    const { data: historyItems, isPending } = useGetLessonQuizHistory(lessonId);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {isPending ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : historyItems && historyItems.length > 0 ? (
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-black uppercase italic tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                        Oldingi urinishlaringiz ({historyItems.length})
                    </h3>
                    {historyItems.map(summary => (
                        <QuizHistoryItem 
                            key={summary.sessionId} 
                            summary={summary} 
                            onClickViewDetail={setSelectedSessionId} 
                        />
                    ))}
                </div>
            ) : null}

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
