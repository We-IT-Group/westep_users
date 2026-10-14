import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getItem } from "../../utils/utils.ts";
import {
    completeHabit,
    getAchievements,
    getGiftCatalog,
    getLeaderboard,
    getMyGiftOrders,
    getRewardCertificates,
    getStreak,
    getTodayHabit,
    getWallet,
    orderGift,
    type LeaderboardMetric,
    type LeaderboardPeriod,
    type LeaderboardScope,
} from "./rewardsApi.ts";

function requireToken() {
    const token = getItem<string>("accessToken");
    if (!token) throw new Error("No token");
}

export function useWallet() {
    return useQuery({
        queryKey: ["coin-wallet"],
        queryFn: async () => {
            requireToken();
            return getWallet();
        },
        retry: false,
    });
}

export function useAchievements() {
    return useQuery({
        queryKey: ["achievements"],
        queryFn: async () => {
            requireToken();
            return getAchievements();
        },
        retry: false,
    });
}

export function useRewardCertificates() {
    return useQuery({
        queryKey: ["reward-certificates"],
        queryFn: async () => {
            requireToken();
            return getRewardCertificates();
        },
        retry: false,
    });
}

export function useGiftCatalog() {
    return useQuery({
        queryKey: ["gift-catalog"],
        queryFn: async () => {
            requireToken();
            return getGiftCatalog();
        },
        retry: false,
    });
}

export function useMyGiftOrders() {
    return useQuery({
        queryKey: ["gift-orders-my"],
        queryFn: async () => {
            requireToken();
            return getMyGiftOrders();
        },
        retry: false,
    });
}

export function useLeaderboard(
    scope: LeaderboardScope,
    period: LeaderboardPeriod,
    professionId?: string,
    metric: LeaderboardMetric = "RATING",
) {
    return useQuery({
        queryKey: ["leaderboard", scope, period, professionId, metric],
        queryFn: async () => {
            requireToken();
            return getLeaderboard(scope, period, professionId, metric);
        },
        enabled: scope !== "PROFESSION" || !!professionId,
        retry: false,
    });
}

export function useStreak() {
    return useQuery({
        queryKey: ["streak"],
        queryFn: async () => {
            requireToken();
            return getStreak();
        },
        staleTime: 30_000,
        retry: false,
    });
}

export function useTodayHabit() {
    return useQuery({
        queryKey: ["today-habit"],
        queryFn: async () => {
            requireToken();
            return getTodayHabit();
        },
        retry: false,
    });
}

export function useCompleteHabit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => completeHabit(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["today-habit"] });
            queryClient.invalidateQueries({ queryKey: ["streak"] });
            queryClient.invalidateQueries({ queryKey: ["coin-wallet"] });
        },
    });
}

export function useOrderGift() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            giftItemId,
            contactPhone,
            address,
        }: {
            giftItemId: string;
            contactPhone?: string;
            address?: string;
        }) => orderGift(giftItemId, contactPhone, address),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coin-wallet"] });
            queryClient.invalidateQueries({ queryKey: ["gift-orders-my"] });
            queryClient.invalidateQueries({ queryKey: ["gift-catalog"] });
        },
    });
}
