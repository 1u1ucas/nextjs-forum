import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

