import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: "asc",
            },
            include: {
                _count: {
                    select: {
                        conversations: true,
                    },
                },
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Erreur lors du chargement des catégories" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { name, slug, color, icon } = await request.json();

        if (!name || !slug) {
            return NextResponse.json(
                { error: "Nom et slug requis" },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                color: color || "#3B82F6",
                icon,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création de la catégorie" },
            { status: 500 }
        );
    }
}

