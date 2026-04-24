import apiClient from "../apiClient.ts";
import { AxiosError } from "axios";

export interface LessonTask {
    id: string;
    taskId?: string;
    type: string;
    title: string;
    name?: string;
    description?: string | null;
    maxScore?: number | null;
    deadline?: string | null;
    questionCount?: number | null;
    durationMinutes?: number | null;
    attachmentId?: string | null;
    attachmentUrl?: string | null;
    fileName?: string | null;
    url?: string | null;
    link?: string | null;
    resourceUrl?: string | null;
    mimeType?: string | null;
    externalUrl?: string | null;
    attachment?: {
        id?: string | null;
        attachmentId?: string | null;
        url?: string | null;
        attachmentUrl?: string | null;
        fileName?: string | null;
        originalName?: string | null;
        name?: string | null;
        mimeType?: string | null;
        contentType?: string | null;
    } | null;
    attachments?: Array<{
        attachmentId?: string | null;
        attachmentUrl?: string | null;
        fileName?: string | null;
        mimeType?: string | null;
    }> | null;
    links?: Array<{
        title?: string | null;
        url?: string | null;
        link?: string | null;
        resourceUrl?: string | null;
    }> | null;
}

export interface LessonQuizQuestion {
    sessionQuestionId: string;
    questionId: string;
    orderIndex: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    selectedOption: string | null;
}

export interface LessonQuizSession {
    sessionId: string;
    taskId: string;
    lessonId: string;
    questionCount: number;
    durationMinutes: number;
    startedAt: string;
    endsAt: string;
    finishedAt: string | null;
    status: "IN_PROGRESS" | "FINISHED" | string;
    remainingSeconds: number;
    questions: LessonQuizQuestion[];
}

export interface LessonHomeworkSubmissionBody {
    comment?: string;
    link?: string;
    file?: File;
    files?: File[];
}

export const getLessonTasks = async (lessonId: string): Promise<LessonTask[]> => {
    try {
        const { data } = await apiClient.get(`/lesson-tasks/lesson/${lessonId}`);
        return (data as LessonTask[]).map((task) => ({
            ...task,
            id: task.taskId || task.id,
            title: task.title || task.name || "Untitled task",
        }));
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Vazifalarni yuklashda xatolik";
        throw new Error(message);
    }
};

export const getLessonQuizSession = async (sessionId: string): Promise<LessonQuizSession> => {
    try {
        const { data } = await apiClient.get(`/lesson-tasks/quiz-sessions/${sessionId}`);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Sessiyani yuklashda xatolik";
        throw new Error(message);
    }
};

export const startLessonQuiz = async (taskId: string): Promise<LessonQuizSession> => {
    try {
        const { data } = await apiClient.post(`/lesson-tasks/${taskId}/quiz/start`);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const status = err.response?.status;

        if (status === 404 || status === 405) {
            try {
                const { data } = await apiClient.post(`/lesson-tasks/${taskId}/start`);
                return data;
            } catch (fallbackError) {
                const fallbackErr = fallbackError as AxiosError<{ message: string }>;

                if (fallbackErr.response?.status === 404 || fallbackErr.response?.status === 405) {
                    try {
                        const { data } = await apiClient.post(`/lesson-tasks/quiz/${taskId}/start`);
                        return data;
                    } catch (secondFallbackError) {
                        const secondFallbackErr = secondFallbackError as AxiosError<{ message: string }>;
                        const secondFallbackMessage =
                            secondFallbackErr.response?.data?.message || "Testni boshlashda xatolik";
                        throw new Error(secondFallbackMessage);
                    }
                }

                const fallbackMessage =
                    fallbackErr.response?.data?.message || "Testni boshlashda xatolik";
                throw new Error(fallbackMessage);
            }
        }

        const message = err.response?.data?.message || "Testni boshlashda xatolik";
        throw new Error(message);
    }
};

export const finishLessonQuiz = async (sessionId: string, answers: { questionId: string; selectedOption: string }[]) => {
    try {
        const { data } = await apiClient.post(`/lesson-tasks/quiz-sessions/${sessionId}/finish`, { answers });
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Testni yakunlashda xatolik";
        throw new Error(message);
    }
};

export const submitLessonHomework = async (taskId: string, body: LessonHomeworkSubmissionBody) => {
    const formData = new FormData();

    if (body.comment?.trim()) {
        formData.append("comment", body.comment.trim());
    }

    if (body.link?.trim()) {
        formData.append("link", body.link.trim());
    }

    if (body.file) {
        formData.append("file", body.file);
    }

    if (body.files?.length) {
        body.files.forEach((file) => {
            formData.append("files", file);
        });
    }

    try {
        const { data } = await apiClient.post(`/lesson-homework/tasks/${taskId}/submit`, formData);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Uyga vazifani yuborishda xatolik";
        throw new Error(message);
    }
};
