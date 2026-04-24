import apiClient, { baseUrl } from "../apiClient";
import {User} from "../../types/types.ts";
import axios, {AxiosError} from "axios";
import {getItem, setItem} from "../../utils/utils.ts";

export interface UpdateProfileBody {
    phoneNumber: string;
    firstname: string;
    lastname: string;
    birthDate: string;
    roleName: string;
    gender: "MALE" | "FEMALE";
}

export const login = async (body: { phoneNumber: string; password: string }) => {
    try {
        const {data} = await apiClient.post("/auth/login", {}, {
            params: {
                phone: body.phoneNumber,
                password: body.password,
            }
        });
        setItem<string>("accessToken", data.accessToken)
        setItem<string>("refreshToken", data.refreshToken)
    } catch (error) {
        const err = error as AxiosError<{ error?: string; message?: string }>;
        const rawMessage =
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "";
        const normalizedMessage = rawMessage.trim().toLowerCase();
        const isUnauthorizedMessage =
            err.response?.status === 401 ||
            normalizedMessage === "unauthorized" ||
            normalizedMessage.includes("unauthorized");
        const message =
            (isUnauthorizedMessage ? "Parol xato kiritildi!" : undefined) ||
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Kirishda xatolik yuz berdi";
        throw new Error(message);
    }
};

export const register = async (body: User) => {
        try {
            const {data} = await apiClient.post("/auth/register", body);
            setItem<string>("accessToken", data.accessToken)
            setItem<string>("refreshToken", data.refreshToken)
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const message = err.response?.data?.message;
            throw new Error(message);
        }
    }
;

export const getCurrentUser = async () => {
    const {data} = await apiClient.get("/user/me");
    localStorage.setItem("user", JSON.stringify(data));
    return data;
};

export const logout = async () => {
    const refreshToken: string | null = getItem<string>("refreshToken");
    await apiClient.post("/auth/logout", refreshToken, {
        headers: {
            "Content-Type": "text/plain"
        }
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

export const checkPhoneNumber = async (body: { phoneNumber: string }) => {
    const {data} = await apiClient.post("/auth/check-phone", {phone: body.phoneNumber});
    if (data.status === "NOT_FOUND") {
        throw new Error(data.message);
    }
};

export const sendOtpCode = async (body: { phoneNumber: string, type: string }) => {
    try {
        await apiClient.post("/sms/send", {
            phone: body.phoneNumber,
            type: body.type,
        });
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};
export const verifyCode = async (body: { phoneNumber: string, code: string, type: string }) => {
    try {
        await apiClient.post("/sms/verify", {
            phone: body.phoneNumber,
            code: body.code,
            type: body.type,
        });
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};
export const resetPassword = async (body: { phoneNumber: string, password: string }) => {
    try {
        await apiClient.post("/auth/reset-password",{},{
            params:{
                phone: body.phoneNumber,
                newPassword: body.password,
            }
        });
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const updateProfile = async (body: UpdateProfileBody) => {
    try {
        const {data} = await apiClient.put("/user/update", body);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message?: string; error?: string }>;
        const message = err.response?.data?.message || err.response?.data?.error || "Profilni yangilashda xatolik";
        throw new Error(message);
    }
};

export const uploadAvatar = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const token = getItem<string>("accessToken");

        const {data} = await axios.post(`${baseUrl}/student-profiles/me/avatar`, formData, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            withCredentials: true,
        });
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message?: string; error?: string }>;
        const message = err.response?.data?.message || err.response?.data?.error || "Avatar yuklashda xatolik";
        throw new Error(message);
    }
};
