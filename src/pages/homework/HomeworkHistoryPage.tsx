import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetMyHomeworkSubmissions } from "../../api/lesson-homework/useLessonHomework.ts";
import HomeworkSubmissionHistory from "../../components/homework/HomeworkSubmissionHistory.tsx";

function HomeworkHistoryPage() {
    const navigate = useNavigate();
    const {
        data: submissions = [],
        isPending,
        error,
    } = useGetMyHomeworkSubmissions();

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 font-sans dark:bg-slate-950 sm:p-8">
            <div className="mx-auto max-w-5xl space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:hover:text-white"
                        type="button"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            HOMEWORK HISTORY
                        </h1>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                            Barcha yuborilgan topshiriqlar, baholar va feedbacklar
                        </p>
                    </div>
                </div>

                <HomeworkSubmissionHistory
                    submissions={submissions}
                    isLoading={isPending}
                    errorMessage={error instanceof Error ? error.message : null}
                    emptyTitle="Homework submissionlar topilmadi"
                    emptyDescription="Dars ichidagi homework bo'limidan birinchi submissionni yuboring."
                    showLessonName
                />
            </div>
        </div>
    );
}

export default HomeworkHistoryPage;
