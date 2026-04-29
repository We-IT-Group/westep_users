import {useMutation, useQuery} from "@tanstack/react-query";
import {getAllCourses, getAllStudentCoursesById, getContinueLearning, getCourseById, getLearningStats, setStudentCourse} from "./courseApi.ts";
import {getItem} from "../../utils/utils.ts";
import {useNavigate} from "react-router-dom";
import {useCreatePaymentCheckout} from "../payme/usePayme.ts";

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

export const useGetCourseById = (id: string | undefined) =>
    useQuery({
        queryKey: ["role", id],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getCourseById(id);
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

export const useSetStudentCourseByIdForPayment = () => {
    const navigate = useNavigate();
    const {mutate} = useCreatePaymentCheckout()
    return useMutation({
        mutationFn: setStudentCourse,
        onSuccess: async (id, variables) => {
            if (/^[0-9a-fA-F-]{36}$/.test(id)) {
                navigate(`/courses/${variables.courseId}/${id}`);
                return;
            }

            mutate(id);
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
            return await getLearningStats();
        },
        retry: false,
    });
