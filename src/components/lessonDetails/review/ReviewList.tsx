import { useEffect, useState } from "react";
import { GraduationCap, Star, Loader2 } from "lucide-react";
import { useGetReviews, LessonReviewResponse } from "../../../api/review/useReview";

interface ReviewListProps {
    lessonId: string;
}

export function ReviewList({ lessonId }: ReviewListProps) {
    const [page, setPage] = useState(0);
    const size = 10;
    
    // In a real infinite scroll, we would use useInfiniteQuery. 
    // Here we use simple pagination with a "Load More" logic if needed, 
    // or just fetch the current page. To accumulate reviews, we can keep local state.
    // However, the backend rule says plain page/size. I'll implement basic load more by accumulating reviews.
    const { data, isLoading, isError } = useGetReviews(lessonId, page, size);
    
    const [accumulatedReviews, setAccumulatedReviews] = useState<LessonReviewResponse[]>([]);

    // Sync when data arrives
    useEffect(() => {
        if (data?.reviews) {
            setAccumulatedReviews(prev => {
                // simple deduping or just replace if page is 0
                if (page === 0) return data.reviews;
                
                const newItems = data.reviews.filter(
                    newRev => !prev.some(oldRev => oldRev.id === newRev.id)
                );
                return [...prev, ...newItems];
            });
        }
    }, [data, page]);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    if (isError) {
        return (
            <div className="py-8 text-center text-red-500 font-bold text-sm">
                Sharhlarni yuklashda xatolik yuz berdi.
            </div>
        );
    }

    if (isLoading && page === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Yuklanmoqda...</span>
            </div>
        );
    }

    if (accumulatedReviews.length === 0) {
        return (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 mt-8">
                <Star className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">Hozircha sharhlar yo'q. Birinchi bo'lib fikr qoldiring!</p>
            </div>
        );
    }

    return (
        <div className="mt-4 flex flex-col gap-6 pb-10">
            {accumulatedReviews.map((review) => {
                const initials = review.author.fullName.slice(0, 2).toUpperCase();
                const isTeacher = review.author.role === "TEACHER";

                return (
                    <div key={review.id} className="flex gap-4 sm:gap-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
                        {/* Avatar Column */}
                        <div className="flex flex-col items-start pt-1">
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full flex items-center justify-center font-black text-sm sm:text-lg border ${
                                isTeacher ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-slate-100 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                            }`}>
                                {isTeacher ? <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" /> : initials}
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 min-w-0">
                            {/* Header: Name + Stars */}
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-[16px] sm:text-[17px] text-slate-900 dark:text-white">
                                        {review.author.fullName}
                                    </span>
                                    {isTeacher && (
                                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-[0.1em] border border-blue-100 dark:border-blue-800">
                                            Ustoz
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-100 dark:fill-slate-800 dark:text-slate-800'}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <p className="font-bold italic text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
                                "{review.comment}"
                            </p>
                        </div>
                    </div>
                );
            })}

            {data && accumulatedReviews.length < data.totalReviews && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all dark:text-slate-300"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yana yuklash"}
                    </button>
                </div>
            )}
        </div>
    );
}
