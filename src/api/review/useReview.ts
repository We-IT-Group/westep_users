import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

// ---------------------- TYPES ----------------------
export interface LessonRatingSummaryResponse {
    lessonId: string;
    averageRating: number;
    ratingsCount: number;
}

export interface LessonReviewAuthorDto {
    id: string;
    fullName: string;
    role: string;
}

export interface LessonReviewResponse {
    id: string;
    lessonId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    author: LessonReviewAuthorDto;
}

export interface LessonReviewListResponse {
    lessonId: string;
    page: number;
    size: number;
    totalReviews: number;
    reviews: LessonReviewResponse[];
}

export interface LessonRatingRequest {
    rating: number;
}

export interface LessonReviewRequest {
    comment: string;
}

// ---------------------- HOOKS ----------------------

// 1. GET RATING SUMMARY
export function useGetRatingSummary(lessonId: string) {
    return useQuery({
        queryKey: ["lessonRatingSummary", lessonId],
        queryFn: async (): Promise<LessonRatingSummaryResponse> => {
            const { data } = await apiClient.get(`/lessons/${lessonId}/rating-summary`);
            return data;
        },
        enabled: !!lessonId,
        staleTime: 1000 * 60, // 1 minute
    });
}

// 2. GET REVIEWS
export function useGetReviews(lessonId: string, page = 0, size = 10) {
    return useQuery({
        queryKey: ["lessonReviews", lessonId, page, size],
        queryFn: async (): Promise<LessonReviewListResponse> => {
            const { data } = await apiClient.get(`/lessons/${lessonId}/reviews`, {
                params: { page, size }
            });
            return data;
        },
        enabled: !!lessonId,
        staleTime: 1000 * 60, // 1 minute
    });
}

// 3. POST RATING
export function useRateLesson(lessonId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: LessonRatingRequest): Promise<LessonRatingSummaryResponse> => {
            const { data } = await apiClient.post(`/lessons/${lessonId}/rating`, payload);
            return data;
        },
        onSuccess: (data) => {
            // Update summary immediately
            queryClient.setQueryData(["lessonRatingSummary", lessonId], data);
            toast.success("Bahoingiz qabul qilindi!", { position: "top-center" });
            
            // Invalidate the reviews list as their review rating value might have changed
            queryClient.invalidateQueries({ queryKey: ["lessonReviews", lessonId] });
        },
        onError: (err) => {
            if (isAxiosError(err)) {
                toast.error(err.response?.data?.error || "Baholashda xatolik yuz berdi");
            }
        }
    });
}

// 4. POST REVIEW
export function useSubmitReview(lessonId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: LessonReviewRequest): Promise<LessonReviewResponse> => {
            const { data } = await apiClient.post(`/lessons/${lessonId}/reviews`, payload);
            return data;
        },
        onSuccess: () => {
            toast.success("Sharhingiz muvaffaqiyatli saqlandi!", { position: "top-center" });
            queryClient.invalidateQueries({ queryKey: ["lessonReviews", lessonId] });
        },
        onError: (err) => {
            if (isAxiosError(err)) {
                toast.error(err.response?.data?.error || "Fikr qoldirishda xatolik yuz berdi. Aval baho (yulduzcha) qoldiring.");
            }
        }
    });
}

// 5. PATCH MY REVIEW
export function useEditReview(lessonId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: LessonReviewRequest): Promise<LessonReviewResponse> => {
            const { data } = await apiClient.patch(`/lessons/${lessonId}/reviews/my`, payload);
            return data;
        },
        onSuccess: () => {
            toast.success("Sharhingiz yangilandi!", { position: "top-center" });
            queryClient.invalidateQueries({ queryKey: ["lessonReviews", lessonId] });
        },
        onError: (err) => {
            if (isAxiosError(err)) {
                toast.error(err.response?.data?.error || "Sharhni o'zgartirishda xatolik yuz berdi");
            }
        }
    });
}
