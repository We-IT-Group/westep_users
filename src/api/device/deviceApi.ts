import { AxiosError } from "axios";
import apiClient from "../apiClient.ts";
import { ApiErrorResponse, UserDeviceSession } from "../auth/authApi.ts";

export const getMyDevices = async () => {
    try {
        const { data } = await apiClient.get("/user/devices");
        return data as UserDeviceSession[];
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse<null>>;
        const message = err.response?.data?.message || "Qurilmalarni yuklashda xatolik";
        throw new Error(message);
    }
};

export const deleteMyDevice = async (sessionId: string) => {
    try {
        await apiClient.delete(`/user/devices/${sessionId}`);
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse<null>>;
        const message = err.response?.data?.message || "Qurilmani o'chirishda xatolik";
        throw new Error(message);
    }
};
