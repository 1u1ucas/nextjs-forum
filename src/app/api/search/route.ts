import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ conversations: [] });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                deletedAt: null,
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        messages: {
                            some: {
                                content: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                                deletedAt: null,
                            },
                        },
                    },
                ],
            },
            include: {
                messages: {
                    where: {
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                        slug: true,
                        color: true,
                    },
                },
            },
            orderBy: {
                votes: "desc",
            },
            take: 10,
        });

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Erreur lors de la recherche" },
            { status: 500 }
        );
    }
}

