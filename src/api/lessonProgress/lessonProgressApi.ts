import apiClient from "../apiClient.ts";
import {AxiosError} from "axios";


export const getLessonProgress = async ({studentCourseId, lessonId}: {
    studentCourseId: string | undefined,
    lessonId: string | undefined
}) => {
    try {
        const {data} = await apiClient.get("/lesson-progress/student-courses/" + studentCourseId + "/lessons/" + lessonId + "/progress");
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const getLessonProgressList = async ({studentCourseId}: {
    studentCourseId: string | undefined,
}) => {
    try {
        const {data} = await apiClient.get("/lesson-progress/student-courses/" + studentCourseId + "/lessons/progress");
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const addLessonProgressStart = async ({studentCourseId, lessonId}: {
    studentCourseId: string | undefined,
    lessonId: string
}) => {
    try {
        const {data} = await apiClient.post("/lesson-progress/student-courses/" + studentCourseId + "/lessons/" + lessonId + "/progress/start");
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};


export const updateLessonProgress = async ({
    studentCourseId,
    lessonId,
    currentSecond,
    watchedFromSecond,
    watchedToSecond,
}: {
    studentCourseId: string | undefined,
    lessonId: string | undefined,
    currentSecond: number
    watchedFromSecond?: number
    watchedToSecond?: number
}) => {
    try {
        const body: {
            currentSecond: number;
            watchedFromSecond?: number;
            watchedToSecond?: number;
        } = {
            currentSecond: Math.round(currentSecond),
        };

        if (typeof watchedFromSecond === "number" && typeof watchedToSecond === "number") {
            body.watchedFromSecond = Math.round(watchedFromSecond);
            body.watchedToSecond = Math.round(watchedToSecond);
        }

        const {data} = await apiClient.put(
            "/lesson-progress/student-courses/" + studentCourseId + "/lessons/" + lessonId + "/progress",
            body,
        );
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};
