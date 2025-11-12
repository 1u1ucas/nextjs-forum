import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        const { imageUrl } = await request.json();

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { image: imageUrl },
        });

        return NextResponse.json({
            message: "Avatar mis à jour",
            user: {
                id: user.id,
                image: user.image,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'avatar:", error);
        return NextResponse.json(
            { message: "Erreur serveur" },
            { status: 500 }
        );
    }
}

