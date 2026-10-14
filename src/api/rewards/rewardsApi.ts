import { AxiosError } from "axios";
import apiClient from "../apiClient.ts";

export type CoinWallet = {
    balance: number;
    totalEarned: number;
};

export type Achievement = {
    code: string;
    title: string;
    description?: string | null;
    icon?: string | null;
    threshold: number;
    earned: boolean;
    awardedAt?: string | null;
};

export type RewardCertificate = {
    id: string;
    type?: string | null;
    title: string;
    verificationCode?: string | null;
    issuedAt?: string | null;
};

export type GiftItem = {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    coinPrice: number;
    stock?: number | null;
};

export type GiftOrder = {
    id: string;
    giftItemId?: string | null;
    giftName: string;
    coinPrice: number;
    status: string;
    mystery: boolean;
    createdAt?: string | null;
};

export type LeaderboardItem = {
    rank: number;
    displayName: string;
    points: number;
    me: boolean;
};

export type Leaderboard = {
    scope: string;
    period: string;
    items: LeaderboardItem[];
    myRank?: number | null;
    myPoints: number;
};

export type LeaderboardScope = "GLOBAL" | "AGE_GROUP" | "PROFESSION";
export type LeaderboardPeriod = "WEEKLY" | "MONTHLY";
export type LeaderboardMetric = "RATING" | "XP";

export type StreakDay = { date: string; active: boolean };

export type Streak = {
    currentDays: number;
    longestDays: number;
    practicedToday?: boolean;
    atRisk?: boolean;
    lastActivityDate?: string | null;
    message?: string;
    last7Days?: StreakDay[];
};

export type TodayHabit = {
    habit: { id: string; title: string; description?: string | null; coinReward: number } | null;
    status?: "NOT_DONE" | "PENDING_PARENT" | "CONFIRMED";
    completionId?: string | null;
};

function apiError(error: unknown, fallback: string) {
    const err = error as AxiosError<{ message?: string; error?: string }>;
    return err.response?.data?.message || err.response?.data?.error || fallback;
}

export async function getWallet(): Promise<CoinWallet> {
    try {
        const { data } = await apiClient.get<CoinWallet>("/coins/wallet");
        return data;
    } catch (error) {
        throw new Error(apiError(error, "Hamyonni yuklab bo‘lmadi"));
    }
}

export async function getAchievements(): Promise<Achievement[]> {
    try {
        const { data } = await apiClient.get<Achievement[]>("/achievements/my");
        return data;
    } catch (error) {
        throw new Error(apiError(error, "Yutuqlarni yuklab bo‘lmadi"));
    }
}

export async function getRewardCertificates(): Promise<RewardCertificate[]> {
    try {
        const { data } = await apiClient.get<RewardCertificate[]>("/certificates/my");
        return data;
    } catch (error) {
        throw new Error(apiError(error, "Sertifikatlarni yuklab bo‘lmadi"));
    }
}

export async function getGiftCatalog(): Promise<GiftItem[]> {
    try {
        const { data } = await apiClient.get<GiftItem[]>("/gifts");
        return data;
    } catch (error) {
        throw new Error(apiError(error, "Do‘konni yuklab bo‘lmadi"));
    }
}

export async function getMyGiftOrders(): Promise<GiftOrder[]> {
    try {
        const { data } = await apiClient.get<GiftOrder[]>("/gifts/orders/my");
        return data;
    } catch (error) {
        throw new Error(apiError(error, "Buyurtmalarni yuklab bo‘lmadi"));
    }
}

export async function orderGift(giftItemId: string, contactPhone?: string, address?: string): Promise<GiftOrder> {
    try {
        const { data } = await apiClient.post<GiftOrder>(`/gifts/${giftItemId}/order`, {
            contactPhone,
            address,
        });
        return data;
    } catch (error) {
        throw new Error(apiError(error, "Buyurtma berib bo‘lmadi"));
    }
}

export async function getLeaderboard(
    scope: LeaderboardScope,
    period: LeaderboardPeriod,
    professionId?: string,
    metric: LeaderboardMetric = "RATING",
): Promise<Leaderboard> {
    try {
        const { data } = await apiClient.get<Leaderboard>("/leaderboard", {
            params: { scope, period, professionId, metric },
        });
        return data;
    } catch (error) {
        throw new Error(apiError(error, "Reytingni yuklab bo‘lmadi"));
    }
}

export async function getStreak(): Promise<Streak> {
    try {
        const { data } = await apiClient.get<Streak>("/leaderboard/streak");
        return data;
    } catch (error) {
        throw new Error(apiError(error, "Seriyani yuklab bo‘lmadi"));
    }
}

export async function getTodayHabit(): Promise<TodayHabit> {
    try {
        const { data } = await apiClient.get<TodayHabit>("/habits/today");
        return data;
    } catch (error) {
        throw new Error(apiError(error, "Bugungi odatni yuklab bo‘lmadi"));
    }
}

export async function completeHabit(): Promise<void> {
    try {
        await apiClient.post("/habits/complete");
    } catch (error) {
        throw new Error(apiError(error, "Belgilab bo‘lmadi"));
    }
}

export function withMeOnBoard(board: Leaderboard, youLabel: string): Leaderboard {
    const myPoints = board.myPoints ?? 0;
    const already = board.items.some((item) => item.me);
    let items = board.items.map((item) => ({ ...item }));
    let myRank = board.myRank ?? items.find((item) => item.me)?.rank ?? null;

    if (!already && myPoints > 0) {
        const insertAt = items.findIndex((item) => item.points < myPoints);
        const at = insertAt === -1 ? items.length : insertAt;
        items.splice(at, 0, {
            rank: at + 1,
            displayName: youLabel,
            points: myPoints,
            me: true,
        });
        myRank = at + 1;
    }

    items = items.map((item, index) => ({ ...item, rank: index + 1 }));
    if (myRank == null && myPoints > 0) {
        myRank = items.filter((item) => !item.me && item.points > myPoints).length + 1;
    }

    return { ...board, items, myRank, myPoints };
}
