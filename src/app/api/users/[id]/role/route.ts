import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const roleSchema = z.object({
    role: z.enum(["USER", "MODERATOR"], {
        errorMap: () => ({ message: "Rôle invalide" }),
    }),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 403 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Identifiant utilisateur manquant" },
                { status: 400 }
            );
        }

        if (id === session.user.id) {
            return NextResponse.json(
                { message: "Impossible de modifier votre propre rôle" },
                { status: 400 }
            );
        }

        const json = await request.json();
        const parsed = roleSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Données invalides", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { role } = parsed.data;

        const targetUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                role: true,
            },
        });

        if (!targetUser) {
            return NextResponse.json(
                { message: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        if (targetUser.role === "ADMIN") {
            return NextResponse.json(
                { message: "Impossible de modifier le rôle d'un administrateur" },
                { status: 400 }
            );
        }

        if (targetUser.role === role) {
            return NextResponse.json({
                message: "Aucune modification effectuée",
                user: targetUser,
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUser.id },
            data: { role },
            select: {
                id: true,
                role: true,
            },
        });

        return NextResponse.json({
            message: "Rôle mis à jour",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du rôle utilisateur:", error);
        return NextResponse.json(
            { message: "Erreur serveur" },
            { status: 500 }
        );
    }
}


