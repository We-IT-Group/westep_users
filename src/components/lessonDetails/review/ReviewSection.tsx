import React from "react";
import { useGetRatingSummary, useGetReviews } from "../../../api/review/useReview";
import { useUser } from "../../../api/auth/useAuth";
import { RatingSummary } from "./RatingSummary";
import { UserRatingAndReview } from "./UserRatingAndReview";
import { ReviewList } from "./ReviewList";

interface ReviewSectionProps {
    lessonId: string;
}

export function ReviewSection({ lessonId }: ReviewSectionProps) {
    const { data: user } = useUser();
    const { data: summary, isLoading: isLoadingSummary } = useGetRatingSummary(lessonId);
    
    // Check if user has already left a review in the first page of reviews
    const { data: reviewsData } = useGetReviews(lessonId, 0, 50);
    const hasAlreadyReviewed = React.useMemo(() => {
        if (!user || !reviewsData?.reviews) return false;
        return reviewsData.reviews.some(r => r.author.id === user.id);
    }, [user, reviewsData]);

    return (
        <div className="flex flex-col gap-8 sm:gap-12 animate-in fade-in duration-300">
            {/* 1. Rating Summary */}
            <div className="relative">
                {isLoadingSummary && (
                    <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 rounded-[32px] animate-pulse"></div>
                )}
                <RatingSummary summary={summary} />
            </div>

            {/* 2. Current User Rating and Review */}
            {!hasAlreadyReviewed && (
                <UserRatingAndReview lessonId={lessonId} />
            )}

            {/* 3. Divider before Reviews List */}
            <div className="flex items-center gap-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest whitespace-nowrap">
                    Barcha sharhlar
                </h3>
                <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
            </div>

            {/* 4. Public Reviews List */}
            <ReviewList lessonId={lessonId} />
        </div>
    );
}
