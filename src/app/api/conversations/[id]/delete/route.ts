import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`[DELETE CONVERSATION] Tentative de suppression de la conversation ${id}`);
        
        const session = await auth();
        if (!session?.user?.id) {
            console.log(`[DELETE CONVERSATION] Échec: Non autorisé pour la conversation ${id}`);
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        console.log(`[DELETE CONVERSATION] Utilisateur ${session.user.id} tente de supprimer la conversation ${id}`);

        // Vérifier que l'utilisateur est le propriétaire
        const conversation = await prisma.conversation.findUnique({
            where: { id },
        });

        if (!conversation) {
            console.log(`[DELETE CONVERSATION] Échec: Conversation ${id} non trouvée`);
            return NextResponse.json(
                { message: "Conversation non trouvée" },
                { status: 404 }
            );
        }

        const isOwner = conversation.userId === session.user.id;
        const canModerate = ["ADMIN", "MODERATOR"].includes(session.user.role ?? "USER");

        if (!isOwner && !canModerate) {
            console.log(
                `[DELETE CONVERSATION] Échec: Utilisateur ${session.user.id} n'a pas les droits pour supprimer la conversation ${id}`
            );
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 403 }
            );
        }

        console.log(`[DELETE CONVERSATION] Suppression de la conversation ${id} et de ses messages par l'utilisateur ${session.user.id}`);

        // Soft delete la conversation et tous ses messages
        const deleteAt = new Date();
        
        await prisma.$transaction([
            // Supprimer tous les messages de la conversation
            prisma.message.updateMany({
                where: { conversationId: id, deletedAt: null },
                data: { deletedAt: deleteAt },
            }),
            // Supprimer la conversation
            prisma.conversation.update({
                where: { id },
                data: { deletedAt: deleteAt },
            }),
        ]);

        console.log(`[DELETE CONVERSATION] Conversation ${id} et tous ses messages supprimés avec succès`);

        return NextResponse.json({
            message: "Conversation supprimée",
        });
    } catch (error) {
        console.error("[DELETE CONVERSATION] Erreur lors de la suppression:", error);
        return NextResponse.json(
            { message: "Erreur lors de la suppression" },
            { status: 500 }
        );
    }
}
