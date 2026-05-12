import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getMyHomeworkSubmissions,
    getMyHomeworkSubmissionsByLesson,
    HomeworkSubmitPayload,
    LessonHomeworkSubmissionResponse,
    submitHomework,
} from "./lessonHomeworkApi.ts";

export function useSubmitHomework(
    taskId: string | null | undefined,
    lessonId?: string | null,
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            payload: HomeworkSubmitPayload,
        ): Promise<LessonHomeworkSubmissionResponse> => {
            if (!taskId) {
                throw new Error("Uyga vazifa taskId topilmadi");
            }

            return submitHomework(taskId, payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["homeworkSubmissions"],
            });

            if (lessonId) {
                await queryClient.invalidateQueries({
                    queryKey: ["homeworkSubmissions", "lesson", lessonId],
                });
            }
        },
    });
}

export function useGetMyHomeworkSubmissions() {
    return useQuery({
        queryKey: ["homeworkSubmissions", "all"],
        queryFn: getMyHomeworkSubmissions,
        retry: false,
    });
}

export function useGetMyHomeworkSubmissionsByLesson(
    lessonId: string | null | undefined,
) {
    return useQuery({
        queryKey: ["homeworkSubmissions", "lesson", lessonId],
        queryFn: () => getMyHomeworkSubmissionsByLesson(lessonId!),
        enabled: !!lessonId,
        retry: false,
    });
}
