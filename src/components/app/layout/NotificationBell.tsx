"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { notificationService } from "@/services/notification.service";
import { useRouter } from "next/navigation";
import { NotificationItem, NotificationType } from "@/types/notification.type";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const loadNotifications = async () => {
        try {
            const data = await notificationService.fetchNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    useEffect(() => {
        loadNotifications();
        
        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (notificationId: string, link: string | null) => {
        try {
            await notificationService.markAsRead(notificationId);
            await loadNotifications();
            setIsOpen(false);
            if (link) {
                router.push(link);
            }
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            await notificationService.markAllAsRead();
            await loadNotifications();
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case "reply":
                return "💬";
            case "mention":
                return "🔔";
            case "upvote":
                return "⬆️";
            case "badge":
                return "🏆";
            default:
                return "📢";
        }
    };

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}j`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-[500px] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading}
                                    className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                                >
                                    Tout marquer comme lu
                                </button>
                            )}
                        </div>

                        {/* Notifications list */}
                        <div className="overflow-y-auto flex-1">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleMarkAsRead(notification.id, notification.link)}
                                        className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${
                                            !notification.read ? "bg-orange-50 dark:bg-orange-900/10" : ""
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="text-2xl shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    il y a {getTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm">Aucune notification</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

