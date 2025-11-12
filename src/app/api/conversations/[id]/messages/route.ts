import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }
        const { content, parentId } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: "Contenu requis" },
                { status: 400 }
            );
        }

        const message = await prisma.message.create({
            data: {
                content,
                conversationId: id,
                userId: session.user.id,
                parentId: parentId || null,
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
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'ajout du message" },
            { status: 500 }
        );
    }
}

