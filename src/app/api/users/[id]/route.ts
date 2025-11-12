import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                bio: true,
                image: true,
                karma: true,
                role: true,
                createdAt: true,
                conversations: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        votes: true,
                        messages: {
                            where: { deletedAt: null },
                            select: { id: true },
                        },
                    },
                },
                messages: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        conversation: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
                badges: {
                    include: {
                        badge: true,
                    },
                    orderBy: {
                        earnedAt: "desc",
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        const conversations = user.conversations.map((conversation) => ({
            id: conversation.id,
            title: conversation.title,
            createdAt: conversation.createdAt,
            votes: conversation.votes,
            messagesCount: conversation.messages.length,
        }));

        const messages = user.messages.map((message) => ({
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            conversation: message.conversation
                ? {
                      id: message.conversation.id,
                      title: message.conversation.title,
                  }
                : null,
        }));

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                bio: user.bio,
                image: user.image,
                karma: user.karma,
                role: user.role,
                createdAt: user.createdAt,
                stats: {
                    conversations: user.conversations.length,
                    messages: user.messages.length,
                },
            },
            conversations,
            messages,
            badges: user.badges.map((userBadge) => ({
                id: userBadge.id,
                name: userBadge.badge.name,
                description: userBadge.badge.description,
                icon: userBadge.badge.icon,
                color: userBadge.badge.color,
                earnedAt: userBadge.earnedAt,
            })),
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du profil public:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}


