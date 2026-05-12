import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient";

// ---------------------- TYPES ----------------------
export type NotificationType =
  | "TEACHER_REPLIED"
  | "HOMEWORK_GRADED"
  | "HOMEWORK_REVISION_REQUESTED"
  | "MODULE_COMPLETED"
  | "COURSE_PURCHASED"
  | "ADMIN_BROADCAST"
  | "NEW_LESSON_UNLOCKED"
  | "CERTIFICATE_GENERATED";

export interface DiscussionReplyNotificationData {
  courseId: string;
  studentCourseId: string;
  moduleId: string;
  lessonId: string;
  discussionId: string;
  commentId: string;
  replyId: string;
  replierName: string;
  replierRole: string;
  replyContent: string;
}

export type NotificationData = DiscussionReplyNotificationData | Record<string, unknown> | null;

export type NotificationResponse<TData extends NotificationData = NotificationData> = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  data: TData;
};

export type NotificationItem<TData extends NotificationData = NotificationData> = NotificationResponse<TData>;

export type NotificationListResponse = {
  page: number;
  size: number;
  total: number;
  notifications: NotificationItem[];
};

export type NotificationUnreadCountResponse = {
  unreadCount: number;
};

export type NotificationReadAllResponse = {
  markedCount: number;
  unreadCount: number;
};

// ---------------------- HOOKS ----------------------

export function useGetNotifications(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ["notifications", page, size],
    queryFn: async (): Promise<NotificationListResponse> => {
      const { data } = await apiClient.get('/notifications', {
        params: { page, size }
      });
      return data;
    },
    // Polling every 60 seconds
    refetchInterval: 60000,
  });
}

export function useGetUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async (): Promise<NotificationUnreadCountResponse> => {
      const { data } = await apiClient.get('/notifications/unread-count');
      return data;
    },
    // Polling every 30 seconds
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<NotificationItem> => {
      const { data } = await apiClient.patch(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      // Refresh count and list upon reading an item
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<NotificationReadAllResponse> => {
      const { data } = await apiClient.patch('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
