export const notificationService = {
    async fetchNotifications() {
        const response = await fetch("/api/notifications");
        if (!response.ok) throw new Error("Erreur lors du chargement");
        return response.json();
    },

    async markAsRead(notificationId: string) {
        const response = await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId }),
        });
        if (!response.ok) throw new Error("Erreur lors de la mise à jour");
        return response.json();
    },

    async markAllAsRead() {
        const response = await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAllAsRead: true }),
        });
        if (!response.ok) throw new Error("Erreur lors de la mise à jour");
        return response.json();
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

