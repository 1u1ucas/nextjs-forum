import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false,
            },
        });

        return NextResponse.json({
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
        return NextResponse.json(
            { message: "Erreur serveur" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        const { notificationId, markAllAsRead } = await request.json();

        if (markAllAsRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false,
                },
                data: { read: true },
            });
            return NextResponse.json({ message: "Toutes les notifications marquées comme lues" });
        }

        if (notificationId) {
            await prisma.notification.update({
                where: { id: notificationId },
                data: { read: true },
            });
            return NextResponse.json({ message: "Notification marquée comme lue" });
        }

        return NextResponse.json(
            { message: "Paramètres invalides" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        return NextResponse.json(
            { message: "Erreur serveur" },
            { status: 500 }
        );
    }
}

