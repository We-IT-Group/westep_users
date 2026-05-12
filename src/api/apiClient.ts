import axios from "axios";
import { getItem, removeItem, setItem } from "../utils/utils.ts";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const defaultBaseUrl = "/api";

function resolveBaseUrl() {
    const configuredBaseUrl = envBaseUrl || defaultBaseUrl;

    if (
        !import.meta.env.DEV ||
        typeof window === "undefined" ||
        !/^https?:\/\//i.test(configuredBaseUrl)
    ) {
        return configuredBaseUrl;
    }

    try {
        const parsedUrl = new URL(configuredBaseUrl);
        const isLocalhostTarget =
            parsedUrl.hostname === "127.0.0.1" || parsedUrl.hostname === "localhost";
        const currentHost = window.location.hostname;
        const isRemoteClient =
            currentHost !== "127.0.0.1" && currentHost !== "localhost";

        if (isLocalhostTarget && isRemoteClient) {
            parsedUrl.hostname = currentHost;
            return parsedUrl.toString().replace(/\/$/, "");
        }
    } catch {
        return configuredBaseUrl;
    }

    return configuredBaseUrl;
}

export const baseUrl = resolveBaseUrl();
export const baseUrlImage = baseUrl.replace(/\/api$/, "");

export function resolveAssetUrl(path?: string | null) {
    if (!path) return "";

    if (!/^https?:\/\//i.test(path)) {
        return `${baseUrlImage}${path}`;
    }

    if (typeof window === "undefined") {
        return path;
    }

    try {
        const parsedUrl = new URL(path);
        const isLocalhostTarget =
            parsedUrl.hostname === "127.0.0.1" || parsedUrl.hostname === "localhost";
        const currentHost = window.location.hostname;
        const isRemoteClient =
            currentHost !== "127.0.0.1" && currentHost !== "localhost";

        if (import.meta.env.DEV && isLocalhostTarget && isRemoteClient) {
            parsedUrl.hostname = currentHost;
            return parsedUrl.toString();
        }
    } catch {
        return path;
    }

    return path;
}

const apiClient = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});

// Access tokenni headerga qo‘shish
apiClient.interceptors.request.use((config) => {
    const token = getItem<string>("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Token refresh logikasi
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getItem<string>("refreshToken");
            if (!refreshToken) return Promise.reject(error);

            try {
                const { data } = await axios.post(`${baseUrl}/auth/refresh`, {}, {
                    params: { refreshToken: refreshToken },
                });

                setItem<string>("accessToken", data.accessToken);
                setItem<string>("refreshToken", data.refreshToken);
                apiClient.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
                return apiClient(originalRequest);
            } catch (err) {
                removeItem("accessToken");
                removeItem("refreshToken");
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
