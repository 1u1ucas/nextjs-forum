import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
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
            },
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),
        prisma.conversation.count({ where: { deletedAt: null } }),
    ]);

    return NextResponse.json({
        conversations,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}