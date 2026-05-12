import apiClient, { resolveAssetUrl } from "../apiClient.ts";
import {AxiosError} from "axios";
import {getVideoByLessonId} from "../video/vedioApi.ts";


export const getAllLessons = async (courseId: string | undefined) => {
    try {
        const {data} = await apiClient.get("/lesson/module/" + courseId);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const getLessonsById = async (id: string | null) => {
    try {
        const {data} = await apiClient.get("/lesson/" + id);
        const video = await getVideoByLessonId(id);
        const newData = {
            ...data, vedioUrl: resolveAssetUrl(video[0]?.storagePath)
        }
        return newData;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};
