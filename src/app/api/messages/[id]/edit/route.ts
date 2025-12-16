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

        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json(
                { message: "Le contenu est requis" },
                { status: 400 }
            );
        }

        // Vérifier que l'utilisateur est le propriétaire
        const message = await prisma.message.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        role: true,
                    },
                },
            },
        });

        if (!message) {
            return NextResponse.json(
                { message: "Message non trouvé" },
                { status: 404 }
            );
        }

        const isOwner = message.userId === session.user.id;
        const targetRole = message.user?.role ?? "USER";
        const sessionRole = session.user.role ?? "USER";
        const canModerate =
            sessionRole === "ADMIN" ||
            (sessionRole === "MODERATOR" && targetRole !== "ADMIN");

        if (!isOwner && !canModerate) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 403 }
            );
        }

        // Mettre à jour le message
        const updated = await prisma.message.update({
            where: { id },
            data: {
                content,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: "Message mis à jour",
            data: updated,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        return NextResponse.json(
            { message: "Erreur lors de la mise à jour" },
            { status: 500 }
        );
    }
}

