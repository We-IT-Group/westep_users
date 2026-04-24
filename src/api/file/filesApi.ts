import apiClient from "../apiClient.ts";
import {AxiosError} from "axios";


export const addFile = async (body: any) => {
    try {
        const {data} = await apiClient.post("/attachments/upload", body, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};


export const deleteFile = async (id: string) => {
    try {
        await apiClient.delete("/attachments/" + id);
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const getFileById = async (id: string | undefined) => {
    try {
        const {data} = await apiClient.get("/attachments/download/" + id, {
            responseType: "blob",
        });
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const getFileByUrl = async (url: string | undefined) => {
    try {
        if (!url) throw new Error("File url is missing");

        const normalizedUrl = url.startsWith("http") ? url : url.startsWith("/api")
            ? url.replace(/^\/api/, "")
            : url;

        const {data} = await apiClient.get(normalizedUrl, {
            responseType: "blob",
        });
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Faylni yuklashda xatolik";
        throw new Error(message);
    }
};
