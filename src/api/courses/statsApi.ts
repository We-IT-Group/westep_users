import { AxiosError } from "axios";
import apiClient from "../apiClient.ts";

export type LearningStats = {
    totalWatchedSeconds: number;
    totalWatchedMinutes: number;
    totalWatchedHours: number;
    thisMonthActiveDays: number;
    totalCompletedLessons: number;
};

export type WeeklyActivityDay = {
    dayOfWeek: string;
    date?: string;
    watchedMinutes: number;
    lessonsCompleted: number;
    quizzesCompleted?: number;
    gamesCompleted?: number;
};

export type WeeklyActivity = {
    weekStart: string;
    weekEnd: string;
    days: WeeklyActivityDay[];
    totalMinutes: number;
    totalHours: number;
};

export type SubjectResult = {
    courseId: string;
    studentCourseId: string;
    courseName: string;
    progressPercentage: number;
    quizAverage?: number | null;
    gameAverage?: number | null;
    score?: number | null;
    completedLessons: number;
    totalLessons: number;
    completed: boolean;
};

export type SubjectResults = {
    averageScore?: number | null;
    quizAttempts: number;
    gameAttempts: number;
    items: SubjectResult[];
};

export type StudentCertificate = {
    id: string;
    courseId: string;
    courseName: string;
    issuedAt: string;
    downloadUrl?: string | null;
    color?: string | null;
    type?: string | null;
    verificationCode?: string | null;
};

function isMissing(error: unknown) {
    return (error as AxiosError).response?.status === 404;
}

function localIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function emptyWeek(weekOffset = 0): WeeklyActivity {
    const today = new Date();
    const dayIdx = (today.getDay() + 6) % 7;
    const start = new Date(today);
    start.setDate(today.getDate() - dayIdx + weekOffset * 7);
    const days = (["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const).map((dayOfWeek, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return {
            dayOfWeek,
            date: localIso(date),
            watchedMinutes: 0,
            lessonsCompleted: 0,
            quizzesCompleted: 0,
            gamesCompleted: 0,
        };
    });
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
        weekStart: localIso(start),
        weekEnd: localIso(end),
        days,
        totalMinutes: 0,
        totalHours: 0,
    };
}

export async function getWeeklyActivity(weekOffset = 0): Promise<WeeklyActivity> {
    try {
        const { data } = await apiClient.get<WeeklyActivity>("/student-course/me/weekly-activity", {
            params: { weekOffset },
        });
        return data;
    } catch (error) {
        if (isMissing(error)) return emptyWeek(weekOffset);
        throw error;
    }
}

export async function getSubjectResults(): Promise<SubjectResults> {
    try {
        const { data } = await apiClient.get<SubjectResults>("/student-course/me/subject-results");
        return data;
    } catch (error) {
        if (isMissing(error)) {
            return { averageScore: null, quizAttempts: 0, gameAttempts: 0, items: [] };
        }
        throw error;
    }
}

export async function getMyCertificates(): Promise<StudentCertificate[]> {
    try {
        const { data } = await apiClient.get<{ items?: StudentCertificate[] }>(
            "/student-course/me/certificates",
        );
        return data.items ?? [];
    } catch (error) {
        if (isMissing(error)) {
            try {
                const { data } = await apiClient.get<StudentCertificate[] | { items?: StudentCertificate[] }>(
                    "/certificates/my",
                );
                return Array.isArray(data) ? data : data.items ?? [];
            } catch (fallbackError) {
                if (isMissing(fallbackError)) return [];
                throw fallbackError;
            }
        }
        throw error;
    }
}
