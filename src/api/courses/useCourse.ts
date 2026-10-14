import {useMutation, useQuery} from "@tanstack/react-query";
import {
    getAllCourses,
    getAllStudentCoursesById,
    getContinueLearning,
    getCourseById,
    getLearningStats,
    getStudentCoursePurchaseDetail,
    setStudentCourse,
} from "./courseApi.ts";
import {
    getMyCertificates,
    getSubjectResults,
    getWeeklyActivity,
    type LearningStats,
} from "./statsApi.ts";
import {getItem} from "../../utils/utils.ts";
import {useNavigate} from "react-router-dom";
import type { Course } from "../../types/types.ts";

export const useGetCourses = () =>
    useQuery({
        queryKey: ["courses"],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getAllCourses();
        },
        retry: false,
    });

export const useGetCourseById = ({id}: { id: string | undefined }) =>
    useQuery({
        queryKey: ["course-detail", id],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getCourseById({ id });
        },
        enabled: !!id,
        retry: false,
    });

export const useGetStudentCoursePurchaseDetail = ({id}: { id: string | undefined }) =>
    useQuery<Course>({
        queryKey: ["student-course-purchase-detail", id],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getStudentCoursePurchaseDetail({ id });
        },
        enabled: !!id,
        retry: false,
    });

export const useSetStudentCourseById = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: setStudentCourse,
        onSuccess: async (id, variables) => {
            navigate(`/courses/${variables.courseId}/${id}`);
        },
        onError: (error) => {
            alert(error);
        },
    });
};

export const useGetStudentCourseById = (id: string | undefined) =>
    useQuery({
        queryKey: ["role", id],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getAllStudentCoursesById(id);
        },
        enabled: !!id,
        retry: false,
    });

export const useGetContinueLearning = () =>
    useQuery({
        queryKey: ["continue-learning"],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getContinueLearning();
        },
        retry: false,
    });

export const useGetLearningStats = () =>
    useQuery({
        queryKey: ["learning-stats"],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return (await getLearningStats()) as LearningStats;
        },
        retry: false,
    });

export const useGetWeeklyActivity = (weekOffset = 0) =>
    useQuery({
        queryKey: ["weekly-activity", weekOffset],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            return await getWeeklyActivity(weekOffset);
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

export const useGetSubjectResults = () =>
    useQuery({
        queryKey: ["subject-results"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            return await getSubjectResults();
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

export const useGetMyCertificates = () =>
    useQuery({
        queryKey: ["my-certificates"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            return await getMyCertificates();
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
