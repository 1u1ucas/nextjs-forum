export type NotificationType = "reply" | "mention" | "upvote" | "badge" | string;

export interface NotificationItem {
    id: string;
    userId?: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
}

export interface NotificationList {
    notifications: NotificationItem[];
    unreadCount: number;
}

export interface NotificationMutationResponse {
    message: string;
}

