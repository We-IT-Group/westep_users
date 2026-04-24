import { useQuery } from "@tanstack/react-query";
import apiClient from "../apiClient";

// ---------------------- TYPES ----------------------
export type LessonQuizResultSummary = {
    sessionId: string;
    lessonId: string;
    taskId: string;
    status: string;
    total: number;
    correct: number;
    wrong: number;
    unanswered: number;
    percentage: number;
    durationMinutes: number;
    spentSeconds: number;
    startedAt: string;
    endsAt: string;
    finishedAt: string | null;
};

export type LessonQuizResultQuestion = {
    orderIndex: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    selectedOption: string | null;
    correctOption: string;
    correct: boolean;
};

export type LessonQuizResultDetail = {
    summary: LessonQuizResultSummary;
    questions: LessonQuizResultQuestion[];
};

// ---------------------- HOOKS ----------------------

export function useGetGlobalQuizHistory() {
    return useQuery({
        queryKey: ["globalQuizHistory"],
        queryFn: async (): Promise<LessonQuizResultSummary[]> => {
            const { data } = await apiClient.get('/lesson-tasks/quiz-results');
            return data;
        },
    });
}

export function useGetLessonQuizHistory(lessonId: string) {
    return useQuery({
        queryKey: ["lessonQuizHistory", lessonId],
        queryFn: async (): Promise<LessonQuizResultSummary[]> => {
            const { data } = await apiClient.get(`/lesson-tasks/quiz-results/lesson/${lessonId}`);
            return data;
        },
        enabled: !!lessonId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useGetQuizResultDetail(sessionId: string | null) {
    return useQuery({
        queryKey: ["quizResultDetail", sessionId],
        queryFn: async (): Promise<LessonQuizResultDetail> => {
            const { data } = await apiClient.get(`/lesson-tasks/quiz-results/${sessionId}`);
            return data;
        },
        enabled: !!sessionId,
    });
}
