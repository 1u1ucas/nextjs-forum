import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAndAwardBadges } from "@/lib/badge-system";
import { z } from "zod";

const createConversationSchema = z.object({
    title: z.string().trim().min(1, "Le titre est requis").max(200, "Le titre est trop long"),
    content: z.string().trim().min(1, "Le contenu est requis"),
    images: z
        .array(z.string().trim().min(1))
        .max(10, "Limite de 10 images")
        .optional()
        .default([]),
});

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const json = await request.json();
        const parsed = createConversationSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Données invalides",
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const { title, content, images } = parsed.data;
        const imageUrl = images.length > 0 ? JSON.stringify(images) : null;

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
