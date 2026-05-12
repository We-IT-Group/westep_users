import { AxiosError } from "axios";
import apiClient from "../apiClient.ts";

export interface LessonHomeworkSubmissionResponse {
    submissionId: string;
    taskId: string;
    lessonId: string;
    lessonName: string;
    taskTitle: string;
    studentId: string;
    studentName: string;
    comment: string | null;
    externalUrl: string | null;
    score: number | null;
    feedback: string | null;
    submittedAt: string;
    reviewedAt: string | null;
    attachmentIds: string[];
    revisionRequested?: boolean | null;
}

export interface HomeworkSubmitPayload {
    comment?: string;
    link?: string;
    file?: File;
    files?: File[];
}

type SubmissionListResponse =
    | LessonHomeworkSubmissionResponse[]
    | {
          submissions?: LessonHomeworkSubmissionResponse[];
          items?: LessonHomeworkSubmissionResponse[];
          data?: LessonHomeworkSubmissionResponse[];
      };

function normalizeSubmissionsResponse(
    response: SubmissionListResponse,
): LessonHomeworkSubmissionResponse[] {
    if (Array.isArray(response)) {
        return response.map((item) => ({
            ...item,
            attachmentIds: Array.isArray(item.attachmentIds) ? item.attachmentIds : [],
        }));
    }

    const submissions = response.submissions || response.items || response.data || [];
    return submissions.map((item) => ({
        ...item,
        attachmentIds: Array.isArray(item.attachmentIds) ? item.attachmentIds : [],
    }));
}

export async function submitHomework(
    taskId: string,
    payload: HomeworkSubmitPayload,
): Promise<LessonHomeworkSubmissionResponse> {
    const formData = new FormData();

    if (payload.comment?.trim()) {
        formData.append("comment", payload.comment.trim());
    }

    if (payload.link?.trim()) {
        formData.append("link", payload.link.trim());
    }

    if (payload.file) {
        formData.append("file", payload.file);
    }

    if (payload.files?.length) {
        payload.files.forEach((file) => {
            formData.append("files", file);
        });
    }

    try {
        const { data } = await apiClient.post(
            `/lesson-homework/tasks/${taskId}/submit`,
            formData,
        );
        return {
            ...data,
            attachmentIds: Array.isArray(data?.attachmentIds) ? data.attachmentIds : [],
        } as LessonHomeworkSubmissionResponse;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message =
            err.response?.data?.message || "Uyga vazifani yuborishda xatolik";
        throw new Error(message);
    }
}

export async function getMyHomeworkSubmissions(): Promise<
    LessonHomeworkSubmissionResponse[]
> {
    try {
        const { data } = await apiClient.get("/lesson-homework/my-submissions");
        return normalizeSubmissionsResponse(data as SubmissionListResponse);
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message =
            err.response?.data?.message || "Uyga vazifalar tarixini yuklashda xatolik";
        throw new Error(message);
    }
}

export async function getMyHomeworkSubmissionsByLesson(
    lessonId: string,
): Promise<LessonHomeworkSubmissionResponse[]> {
    try {
        const { data } = await apiClient.get(
            `/lesson-homework/my-submissions/lesson/${lessonId}`,
        );
        return normalizeSubmissionsResponse(data as SubmissionListResponse);
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message =
            err.response?.data?.message ||
            "Dars bo'yicha uyga vazifa tarixini yuklashda xatolik";
        throw new Error(message);
    }
}
