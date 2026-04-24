import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import apiClient from "../apiClient";

export type DiscussionAuthorDto = {
    id: string;
    fullName: string;
    role: string;
};

export type DiscussionReplyDto = {
    id: string;
    parentId: string | null;
    content: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    author: DiscussionAuthorDto;
};

export type DiscussionCommentDto = {
    id: string;
    content: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    author: DiscussionAuthorDto;
    replyCount: number;
    replies: DiscussionReplyDto[];
};

export type DiscussionListResponse = {
    lessonId: string;
    page: number;
    size: number;
    totalThreads: number;
    threads: DiscussionCommentDto[];
};

// GET DISCUSSIONS
export const useGetDiscussions = (lessonId: string | null | undefined, page = 0, size = 20) => {
    return useQuery<DiscussionListResponse>({
        queryKey: ["discussions", lessonId, { page, size }],
        queryFn: async () => {
            const { data } = await apiClient.get(`/lessons/${lessonId}/discussions`, {
                params: { page, size }
            });
            return data;
        },
        enabled: !!lessonId,
        refetchInterval: 60000, // Frontend must refresh every 60s
    });
};

// CREATE TOP LEVEL COMMENT
export const useCreateDiscussion = (lessonId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (content: string) => {
            const { data } = await apiClient.post(`/lessons/${lessonId}/discussions`, { content });
            return data as DiscussionCommentDto;
        },
        onSuccess: (newThread) => {
            toast.success("Izoh qoldirildi.");
            if (lessonId) {
                // Update the cache by inserting new thread at top
                queryClient.setQueryData<DiscussionListResponse | undefined>(
                    ["discussions", lessonId, { page: 0, size: 20 }],
                    (oldData) => {
                        if (!oldData) return undefined;
                        return {
                            ...oldData,
                            totalThreads: oldData.totalThreads + 1,
                            threads: [newThread, ...oldData.threads],
                        };
                    }
                );
            }
            queryClient.invalidateQueries({ queryKey: ["discussions", lessonId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.messages?.[0] || error.response?.data?.error || "Xatolik yuz berdi";
            toast.error(msg);
        }
    });
};

// REPLY TO A THREAD/COMMENT
export const useReplyDiscussion = (lessonId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ commentId, content }: { commentId: string, content: string }) => {
            const { data } = await apiClient.post(`/discussions/${commentId}/replies`, { content });
            return data as DiscussionCommentDto; // Backend returns the updated entire Thread
        },
        onSuccess: (updatedThread) => {
            toast.success("Javob qaytarildi.");
            if (lessonId) {
                queryClient.setQueryData<DiscussionListResponse | undefined>(
                    ["discussions", lessonId, { page: 0, size: 20 }],
                    (oldData) => {
                        if (!oldData) return undefined;
                        return {
                            ...oldData,
                            threads: oldData.threads.map(t => t.id === updatedThread.id ? updatedThread : t)
                        };
                    }
                );
            }
        },
        onError: (error: any) => {
            const msg = error.response?.data?.messages?.[0] || error.response?.data?.error || "Xatolik yuz berdi";
            toast.error(msg);
        }
    });
};

// UPDATE DISCUSSION
export const useUpdateDiscussion = (lessonId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ commentId, content }: { commentId: string, content: string }) => {
            const { data } = await apiClient.patch(`/discussions/${commentId}`, { content });
            return data as DiscussionCommentDto; // Returns entire updated Thread
        },
        onSuccess: (updatedThread) => {
            toast.success("O'zgartirildi.");
            if (lessonId) {
                queryClient.setQueryData<DiscussionListResponse | undefined>(
                    ["discussions", lessonId, { page: 0, size: 20 }],
                    (oldData) => {
                        if (!oldData) return undefined;
                        return {
                            ...oldData,
                            threads: oldData.threads.map(t => t.id === updatedThread.id ? updatedThread : t)
                        };
                    }
                );
            }
        },
        onError: (error: any) => {
            const msg = error.response?.data?.messages?.[0] || error.response?.data?.error || "Xatolik yuz berdi";
            toast.error(msg);
        }
    });
};

// DELETE DISCUSSION
export const useDeleteDiscussion = (lessonId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (commentId: string) => {
            const { data } = await apiClient.delete(`/discussions/${commentId}`);
            return data as DiscussionCommentDto; // Backend returns the updated whole threaded
        },
        onSuccess: (updatedThread) => {
            toast.success("O'chirildi.");
            if (lessonId) {
                queryClient.setQueryData<DiscussionListResponse | undefined>(
                    ["discussions", lessonId, { page: 0, size: 20 }],
                    (oldData) => {
                        if (!oldData) return undefined;
                        return {
                            ...oldData,
                            threads: oldData.threads.map(t => t.id === updatedThread.id ? updatedThread : t)
                        };
                    }
                );
            }
        },
        onError: (error: any) => {
            const msg = error.response?.data?.messages?.[0] || error.response?.data?.error || "Xatolik yuz berdi";
            toast.error(msg);
        }
    });
};
