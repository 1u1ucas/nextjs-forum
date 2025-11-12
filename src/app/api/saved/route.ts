import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const conversationIdSchema = z.object({
    conversationId: z.string().trim().min(1, "conversationId requis"),
});

const saveBodySchema = z.object({
    conversationId: z.string().trim().min(1, "conversationId requis"),
});

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationIdParam = searchParams.get("conversationId");

    if (conversationIdParam) {
        const parsed = conversationIdSchema.safeParse({ conversationId: conversationIdParam });
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Paramètres invalides", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { conversationId } = parsed.data;
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

    const json = await request.json();
    const parsed = saveBodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Données invalides", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { conversationId } = parsed.data;

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
    const conversationIdParam = searchParams.get("conversationId");
    const parsed = conversationIdSchema.safeParse({ conversationId: conversationIdParam });
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Paramètres invalides", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { conversationId } = parsed.data;

    await prisma.savedConversation.deleteMany({
        where: { userId: session.user.id, conversationId },
    });

    return NextResponse.json({ ok: true });
}
