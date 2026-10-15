import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getItem } from "../../utils/utils.ts";
import {
    abandonProfession,
    completeRoadmapItem,
    getInterestQuiz,
    getInterestQuizTiers,
    getLatestInterestQuizResult,
    getMyProfessions,
    getMyRoadmaps,
    getRecommendations,
    selectProfession,
    submitInterestQuiz,
} from "./careerApi.ts";
import { getProfessionDetail, getProfessionFields, getProfessions } from "./professionApi.ts";
import type { ProfessionListParams } from "./types.ts";

const ROOT = ["professions"] as const;

function requireToken() {
    const token = getItem<string>("accessToken");
    if (!token) throw new Error("No token");
}

export function useProfessionFields() {
    return useQuery({
        queryKey: [...ROOT, "fields"],
        queryFn: async () => {
            requireToken();
            return getProfessionFields();
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}

export function useProfessionsList(params: ProfessionListParams = {}) {
    return useQuery({
        queryKey: [...ROOT, "list", params.field ?? "all", params.q ?? "", params.limit ?? 50, params.offset ?? 0],
        queryFn: async () => {
            requireToken();
            return getProfessions(params);
        },
        staleTime: 60 * 1000,
        retry: false,
    });
}

export function useProfessionDetail(idOrSlug: string | undefined) {
    return useQuery({
        queryKey: [...ROOT, "detail", idOrSlug ?? ""],
        queryFn: async () => {
            requireToken();
            return getProfessionDetail(idOrSlug as string);
        },
        enabled: !!idOrSlug,
        retry: false,
    });
}

export function useInterestQuiz(tier: number | null) {
    return useQuery({
        queryKey: ["interest-quiz", tier],
        queryFn: async () => {
            requireToken();
            return getInterestQuiz(tier as number);
        },
        enabled: tier != null,
        retry: false,
        staleTime: Infinity,
    });
}

export function useInterestQuizTiers() {
    return useQuery({
        queryKey: ["interest-quiz-tiers"],
        queryFn: async () => {
            requireToken();
            return getInterestQuizTiers();
        },
        retry: false,
    });
}

export function useLatestQuizResult() {
    return useQuery({
        queryKey: ["interest-quiz-latest"],
        queryFn: async () => {
            requireToken();
            return getLatestInterestQuizResult();
        },
        retry: false,
    });
}

export function useSubmitInterestQuiz() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: submitInterestQuiz,
        onSuccess: (result) => {
            queryClient.setQueryData(["interest-quiz-latest"], result);
            queryClient.invalidateQueries({ queryKey: ["profession-recommendations"] });
        },
    });
}

export function useRecommendations() {
    return useQuery({
        queryKey: ["profession-recommendations"],
        queryFn: async () => {
            requireToken();
            return getRecommendations();
        },
        retry: false,
    });
}

export function useSelectProfession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ professionId, source }: { professionId: string; source?: "QUIZ" | "RECOMMENDATION" | "FREE" }) =>
            selectProfession(professionId, source),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-professions"] });
        },
    });
}

export function useMyProfessions() {
    return useQuery({
        queryKey: ["my-professions"],
        queryFn: async () => {
            requireToken();
            return getMyProfessions();
        },
        retry: false,
    });
}

export function useMyRoadmaps() {
    return useQuery({
        queryKey: ["my-roadmaps"],
        queryFn: async () => {
            requireToken();
            return getMyRoadmaps();
        },
        retry: false,
    });
}

export function useCompleteRoadmapItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: completeRoadmapItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-roadmaps"] });
        },
    });
}

export function useAbandonProfession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: abandonProfession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-professions"] });
            queryClient.invalidateQueries({ queryKey: ["my-roadmaps"] });
        },
    });
}
