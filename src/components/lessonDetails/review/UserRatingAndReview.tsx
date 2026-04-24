import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { useRateLesson, useSubmitReview } from "../../../api/review/useReview";

interface UserRatingAndReviewProps {
    lessonId: string;
    existingRating?: number; // Optional: If we know the user's existing rating
}

export function UserRatingAndReview({ lessonId, existingRating = 0 }: UserRatingAndReviewProps) {
    const [rating, setRating] = useState(existingRating);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    const { mutate: rateLesson, isPending: isRatingPending } = useRateLesson(lessonId);
    const { mutate: submitReview, isPending: isReviewPending } = useSubmitReview(lessonId);

    // Initial sync
    useEffect(() => {
        if (existingRating > 0) setRating(existingRating);
    }, [existingRating]);

    const handleRatingClick = (selectedRating: number) => {
        console.log("Star clicked. Setting rating to:", selectedRating);
        setRating(selectedRating);
        console.log("Sending rating to backend...", selectedRating);
        rateLesson({ rating: selectedRating });
    };

    const handleReviewSubmit = () => {
        if (!comment.trim()) {
             console.log("Comment is empty, returning.");
             return;
        }
        console.log("Sending review to backend...", comment.trim());
        submitReview(
            { comment: comment.trim() },
            {
                onSuccess: () => {
                    console.log("Review sent successfully.");
                    setComment("");
                }
            }
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-sm">
            
            {/* Top row: Titles & Stars */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white">
                        DARSGA SHARH QOLDIRING
                    </h2>
                    <p className="text-[11px] sm:text-[12px] font-bold uppercase italic tracking-widest text-slate-400">
                        FIKRINGIZ BOSHQA O'QUVCHILAR UCHUN FOYDALI BO'LADI
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-[24px]">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoverRating || rating);
                        return (
                            <button
                                key={star}
                                type="button"
                                disabled={isRatingPending}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => handleRatingClick(star)}
                                className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Star
                                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200 stroke-[2px] ${
                                        isFilled
                                            ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                                            : "fill-transparent text-slate-200 dark:text-slate-700"
                                    }`}
                                />
                            </button>
                        );
                    })}
                    {isRatingPending && <Loader2 className="w-4 h-4 text-yellow-500 animate-spin ml-2" />}
                </div>
            </div>

            {/* Comment Textarea */}
            <div className="mt-8">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 2000))}
                    placeholder="Ushbu dars haqida qanday fikrdasiz?"
                    disabled={isReviewPending}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-transparent focus:border-blue-500/30 rounded-3xl p-5 sm:p-6 min-h-[140px] resize-none text-[15px] sm:text-base font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
            </div>
            
            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleReviewSubmit}
                    disabled={rating === 0 || isReviewPending || !comment.trim()}
                    className="flex justify-center items-center h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-widest text-sm transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isReviewPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "YUBORISH"
                    )}
                </button>
            </div>
            
            {rating === 0 && (
                <div className="mt-4 flex justify-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Yuborishdan avval darsni baholang
                    </span>
                </div>
            )}
        </div>
    );
}
