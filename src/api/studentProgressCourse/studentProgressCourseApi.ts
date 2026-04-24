import apiClient from "../apiClient.ts";
import {AxiosError} from "axios";
import {getVideoByLessonId} from "../video/vedioApi.ts";
import {Lesson} from "../../types/types.ts";

export type StudentCourseProgressData = {
    lessons: (Lesson & { active?: boolean })[];
    percent?: number;
    totalLessons?: number;
    completedLessons?: number;
};

function normalizeLessons(lessons: Lesson[] = []) {
    return lessons.map((item: Lesson, index: number) => ({
        ...item,
        active: index === 0,
    }));
}

function normalizeStudentCourseProgressResponse(data: any): StudentCourseProgressData {
    if (Array.isArray(data)) {
        return {
            lessons: normalizeLessons(data),
        };
    }

    const lessonsSource =
        (Array.isArray(data?.lessons) && data.lessons) ||
        (Array.isArray(data?.items) && data.items) ||
        (Array.isArray(data?.progressLessons) && data.progressLessons) ||
        [];

    return {
        lessons: normalizeLessons(lessonsSource),
        percent:
            typeof data?.percent === "number"
                ? data.percent
                : typeof data?.progress === "number"
                  ? data.progress
                  : typeof data?.percentage === "number"
                    ? data.percentage
                    : undefined,
        totalLessons:
            typeof data?.totalLessons === "number"
                ? data.totalLessons
                : typeof data?.lessonsCount === "number"
                  ? data.lessonsCount
                  : undefined,
        completedLessons:
            typeof data?.completedLessons === "number"
                ? data.completedLessons
                : undefined,
    };
}

export const getStudentCourseProgress = async (studentCourseId: string | undefined) => {
    try {
        const {data} = await apiClient.get("/student-course-progress/student-courses/" + studentCourseId+"/progress");
        return normalizeStudentCourseProgressResponse(data);
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const changeStudentCourseProgress = async (id: string | null) => {
    try {
        const {data} = await apiClient.get("/progress/update/" + id);
        const video = await getVideoByLessonId(id);
        const newData = {
            ...data, vedioUrl: video[0].storagePath
        }

        console.log("newData", newData);
        return newData;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};
