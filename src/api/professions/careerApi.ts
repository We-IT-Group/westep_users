import { AxiosError } from "axios";
import apiClient from "../apiClient.ts";
import type {
    InterestQuizDto,
    InterestQuizResultDto,
    RecommendationsDto,
    StudentProfessionDto,
    StudentRoadmapDto,
} from "./types.ts";

function toError(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string }>;
    return new Error(err.response?.data?.message || err.message || fallback);
}

export async function getInterestQuiz() {
    try {
        const { data } = await apiClient.get<InterestQuizDto>("/interest-quiz");
        return data;
    } catch (error) {
        throw toError(error, "Test savollarini yuklab bo'lmadi");
    }
}

export async function submitInterestQuiz(answers: Array<{ questionId: string; optionId: string }>) {
    try {
        const { data } = await apiClient.post<InterestQuizResultDto>("/interest-quiz/submit", { answers });
        return data;
    } catch (error) {
        throw toError(error, "Test natijasini yuborib bo'lmadi");
    }
}

export async function getRecommendations() {
    try {
        const { data } = await apiClient.get<RecommendationsDto>("/student-professions/recommendations");
        return data;
    } catch (error) {
        throw toError(error, "Tavsiyalarni yuklab bo'lmadi");
    }
}

export async function selectProfession(
    professionId: string,
    source: "QUIZ" | "RECOMMENDATION" | "FREE" = "FREE",
) {
    try {
        const { data } = await apiClient.post<StudentProfessionDto>(
            `/student-professions/select/${professionId}`,
            null,
            { params: { source } },
        );
        return data;
    } catch (error) {
        throw toError(error, "Kasbni tanlab bo'lmadi");
    }
}

export async function getMyProfessions() {
    try {
        const { data } = await apiClient.get<StudentProfessionDto[]>("/student-professions/my");
        return data;
    } catch (error) {
        throw toError(error, "Kasblaringizni yuklab bo'lmadi");
    }
}

export async function getMyRoadmaps() {
    try {
        const { data } = await apiClient.get<StudentRoadmapDto[]>("/roadmap/my");
        return data;
    } catch (error) {
        throw toError(error, "Yo'l xaritasini yuklab bo'lmadi");
    }
}

export async function completeRoadmapItem(itemId: string) {
    try {
        const { data } = await apiClient.post<StudentRoadmapDto>(`/roadmap/items/${itemId}/complete`);
        return data;
    } catch (error) {
        throw toError(error, "Qadamni yakunlab bo'lmadi");
    }
}

export async function abandonProfession(id: string) {
    try {
        const { data } = await apiClient.post<StudentProfessionDto>(`/student-professions/${id}/abandon`);
        return data;
    } catch (error) {
        throw toError(error, "Kasbdan voz kechib bo'lmadi");
    }
}
