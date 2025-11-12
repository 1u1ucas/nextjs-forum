import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAndAwardBadges } from "@/lib/badge-system";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }
        const { title, content, images } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: "Titre et contenu requis" },
                { status: 400 }
            );
        }

        // Stocker les images dans imageUrl (JSON array)
        const imageUrl = images && images.length > 0 ? JSON.stringify(images) : null;

        const conversation = await prisma.conversation.create({
            data: {
                title,
                userId: session.user.id,
                imageUrl,
                messages: {
                    create: {
                        content,
                        userId: session.user.id,
                    },
                },
            },
            include: {
                messages: true,
            },
        });

        // Vérifier et attribuer les badges
        checkAndAwardBadges(session.user.id).catch(console.error);

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Erreur lors de la création:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création" },
            { status: 500 }
        );
    }
}

