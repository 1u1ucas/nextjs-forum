import {
    NotificationItem,
    NotificationList,
    NotificationMutationResponse,
} from "@/types/notification.type";

type NotificationDto = Omit<NotificationItem, "createdAt"> & {
    createdAt: string;
};

type NotificationListDto = {
    notifications: NotificationDto[];
    unreadCount: number;
};

function normalizeNotification(dto: NotificationDto): NotificationItem {
    return {
        ...dto,
        createdAt: new Date(dto.createdAt),
    };
}

export const notificationService = {
    async fetchNotifications(): Promise<NotificationList> {
        const response = await fetch("/api/notifications");
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const data = (await response.json()) as NotificationListDto;
        return {
            notifications: data.notifications.map(normalizeNotification),
            unreadCount: data.unreadCount,
        };
    },

    async markAsRead(notificationId: string): Promise<NotificationMutationResponse> {
        const response = await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId }),
        });
        if (!response.ok) throw new Error("Erreur lors de la mise à jour");
        return response.json() as Promise<NotificationMutationResponse>;
    },

    async markAllAsRead(): Promise<NotificationMutationResponse> {
        const response = await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAllAsRead: true }),
        });
        if (!response.ok) throw new Error("Erreur lors de la mise à jour");
        return response.json() as Promise<NotificationMutationResponse>;
    },

    async createNotification(userId: string, type: string, title: string, message: string, link?: string) {
        // Appelé côté serveur pour créer une notification
        const { prisma } = await import("@/lib/prisma");
        
        return prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link,
            },
        });
    },
};