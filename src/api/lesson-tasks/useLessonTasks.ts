import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLessonTasks, startLessonQuiz } from "./lessonTasksApi.ts";

export const useGetLessonTasks = (lessonId: string | null | undefined) =>
    useQuery({
        queryKey: ["lessonTasks", lessonId],
        queryFn: () => getLessonTasks(lessonId!),
        enabled: !!lessonId,
        retry: false,
    });

export const useStartLessonQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (taskId: string) => startLessonQuiz(taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lessonQuizHistory"] });
        },
    });
};
