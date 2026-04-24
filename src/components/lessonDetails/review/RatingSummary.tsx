import { Star } from "lucide-react";
import { LessonRatingSummaryResponse } from "../../../api/review/useReview";

interface RatingSummaryProps {
    summary: LessonRatingSummaryResponse | undefined;
}

export function RatingSummary({ summary }: RatingSummaryProps) {
    const averageRating = summary?.averageRating || 0;
    const ratingsCount = summary?.ratingsCount || 0;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm">
            <div className="flex items-center gap-4">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                    {averageRating.toFixed(1)}
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                    star <= Math.round(averageRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-slate-100 text-slate-100 dark:fill-slate-800 dark:text-slate-800"
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                        Dars reytingi
                    </span>
                </div>
            </div>
            
            <div className="hidden sm:block w-px h-12 bg-slate-100 dark:bg-slate-800"></div>
            
            <div className="flex flex-col gap-0.5">
                <span className="text-lg font-black text-slate-700 dark:text-slate-200">
                    {ratingsCount} ta
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    O'quvchilar bahosi
                </span>
            </div>
        </div>
    );
}
