import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
        const saved = await prisma.savedConversation.findUnique({
            where: {
                userId_conversationId: {
                    userId: session.user.id,
                    conversationId,
                },
            },
        });

        return NextResponse.json({ saved: Boolean(saved) });
    }

    const saved = await prisma.savedConversation.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            conversation: {
                include: {
                    messages: {
                        where: {
                            deletedAt: null,
                        },
                        select: {
                            id: true,
                            content: true,
                            createdAt: true,
                        },
                        take: 3,
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Filtrer les conversations supprimées côté serveur
    const filtered = saved.filter((item) => item.conversation && !item.conversation.deletedAt);

    return NextResponse.json(filtered);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { conversationId } = await request.json();
    if (!conversationId) {
        return NextResponse.json({ error: "conversationId requis" }, { status: 400 });
    }

    await prisma.savedConversation.upsert({
        where: { userId_conversationId: { userId: session.user.id, conversationId } },
        update: {},
        create: { userId: session.user.id, conversationId },
    });

    return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) {
        return NextResponse.json({ error: "conversationId requis" }, { status: 400 });
    }

    await prisma.savedConversation.deleteMany({
        where: { userId: session.user.id, conversationId },
    });

    return NextResponse.json({ ok: true });
}
