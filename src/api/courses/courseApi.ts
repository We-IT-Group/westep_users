import apiClient from "../apiClient.ts";
import {AxiosError} from "axios";
import type {Course} from "../../types/types.ts";

type CourseDiscoverResponse = {
    courses?: Course[];
};

export const getAllCourses = async () => {
    try {
        const {data} = await apiClient.get<CourseDiscoverResponse>("/course/discover", {
            params: {size: 50},
        });
        return data.courses || [];
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};


export const getAllStudentCoursesById = async (id: string | undefined) => {
    try {
        const {data} = await apiClient.get("/student-course/get-by-student/" + id);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};




export const setStudentCourse = async (body: { studentId: string, courseId: string | null, moduleList: string[] }) => {
    try {
        const data = await apiClient.post("/student-course", body);
        return data.data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const getCourseById = async (id: string | undefined) => {
    const {data} = await apiClient.get("/course/discover/" + id);
    return data;
};

export const getContinueLearning = async () => {
    const { data } = await apiClient.get("/student-course/me/continue-learning");
    return data;
};

export const getLearningStats = async () => {
    const { data } = await apiClient.get("/student-course/me/learning-stats");
    return data;
};
