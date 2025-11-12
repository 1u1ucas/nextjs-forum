import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json(
                { message: "Le contenu est requis" },
                { status: 400 }
            );
        }

        // Vérifier que le message parent existe
        const parentMessage = await prisma.message.findUnique({
            where: { id },
            include: {
                conversation: true,
            },
        });

        if (!parentMessage) {
            return NextResponse.json(
                { message: "Message non trouvé" },
                { status: 404 }
            );
        }

        // Créer la réponse
        const reply = await prisma.message.create({
            data: {
                content,
                userId: session.user.id,
                conversationId: parentMessage.conversationId,
                parentId: id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Créer une notification pour l'auteur du message parent
        if (parentMessage.userId !== session.user.id) {
            const currentUser = await prisma.user.findUnique({
                where: { id: session.user.id },
            });

            await prisma.notification.create({
                data: {
                    userId: parentMessage.userId,
                    type: "reply",
                    title: "Nouvelle réponse",
                    message: `${currentUser?.name || "Un utilisateur"} a répondu à votre commentaire`,
                    link: `/conversation/${parentMessage.conversationId}`,
                },
            });
        }

        return NextResponse.json({
            message: "Réponse créée",
            data: reply,
        });
    } catch (error) {
        console.error("Erreur lors de la création de la réponse:", error);
        return NextResponse.json(
            { message: "Erreur lors de la création" },
            { status: 500 }
        );
    }
}

