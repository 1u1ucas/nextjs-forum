import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { type } = await request.json();

        if (!type || !["up", "down"].includes(type)) {
            return NextResponse.json(
                { error: "Type de vote invalide" },
                { status: 400 }
            );
        }

        const conversation = await prisma.conversation.update({
            where: { id },
            data: {
                votes: {
                    increment: type === "up" ? 1 : -1,
                },
            },
        });

        return NextResponse.json({ votes: conversation.votes });
    } catch (error) {
        console.error("Erreur lors du vote:", error);
        return NextResponse.json(
            { error: "Erreur lors du vote" },
            { status: 500 }
        );
    }
}

