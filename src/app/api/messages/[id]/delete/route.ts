import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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
        // Vérifier que l'utilisateur est le propriétaire
        const message = await prisma.message.findUnique({
            where: { id },
            include: {
                replies: true,
            },
        });

        if (!message) {
            return NextResponse.json(
                { message: "Message non trouvé" },
                { status: 404 }
            );
        }

        const isOwner = message.userId === session.user.id;
        const canModerate = ["ADMIN", "MODERATOR"].includes(session.user.role ?? "USER");

        if (!isOwner && !canModerate) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 403 }
            );
        }


        // Fonction récursive pour supprimer toutes les réponses
        const deleteMessageAndReplies = async (messageId: string, deleteAt: Date) => {
            // Récupérer toutes les réponses directes de ce message
            const replies = await prisma.message.findMany({
                where: {
                    parentId: messageId,
                    deletedAt: null,
                },
            });

            // Supprimer toutes les réponses récursivement
            for (const reply of replies) {
                await deleteMessageAndReplies(reply.id, deleteAt);
            }

            // Supprimer le message actuel
            await prisma.message.update({
                where: { id: messageId },
                data: { deletedAt: deleteAt },
            });
        };

        // Soft delete le message et toutes ses réponses
        const deleteAt = new Date();
        await deleteMessageAndReplies(id, deleteAt);


        return NextResponse.json({
            message: "Message supprimé",
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Erreur lors de la suppression" },
            { status: 500 }
        );
    }
}

