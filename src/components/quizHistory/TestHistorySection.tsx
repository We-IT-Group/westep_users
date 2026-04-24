import { QuizHistoryList } from "./QuizHistoryList";

interface TestHistorySectionProps {
    lessonId: string;
}

export function TestHistorySection({ lessonId }: TestHistorySectionProps) {
    return (
        <div className="flex flex-col gap-8 py-8 animate-in fade-in duration-300">
            <QuizHistoryList lessonId={lessonId} />
        </div>
    );
}
