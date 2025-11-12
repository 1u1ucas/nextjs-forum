import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                conversations: true,
                messages: true,
                badges: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                bio: user.bio,
                image: user.image,
                karma: user.karma,
                stats: {
                    posts: user.conversations.length,
                    comments: user.messages.length,
                    badges: user.badges.length,
                    karma: user.karma,
                },
            },
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return NextResponse.json(
            { message: "Erreur serveur" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        const { name, bio } = await request.json();

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name || null,
                bio: bio || null,
            },
        });

        return NextResponse.json({
            message: "Profil mis à jour",
            user: {
                id: user.id,
                name: user.name,
                bio: user.bio,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        return NextResponse.json(
            { message: "Erreur lors de la mise à jour" },
            { status: 500 }
        );
    }
}
