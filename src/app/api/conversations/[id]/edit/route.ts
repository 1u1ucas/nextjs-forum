import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        const { title, content, categoryId } = await request.json();

        // Vérifier que l'utilisateur est le propriétaire
        const conversation = await prisma.conversation.findUnique({
            where: { id },
        });

        if (!conversation) {
            return NextResponse.json(
                { message: "Conversation non trouvée" },
                { status: 404 }
            );
        }

        if (conversation.userId !== session.user.id) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 403 }
            );
        }

        // Mettre à jour la conversation
        const updated = await prisma.conversation.update({
            where: { id },
            data: {
                title: title || conversation.title,
                content: content !== undefined ? content : conversation.content,
                categoryId: categoryId || conversation.categoryId,
            },
        });

        return NextResponse.json({
            message: "Conversation mise à jour",
            conversation: updated,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        return NextResponse.json(
            { message: "Erreur lors de la mise à jour" },
            { status: 500 }
        );
    }
}

