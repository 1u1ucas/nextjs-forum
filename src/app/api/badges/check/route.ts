import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAndAwardBadges } from "@/lib/badge-system";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        // Vérifier et attribuer les badges
        const newBadges = await checkAndAwardBadges(session.user.id);

        return NextResponse.json({
            message: `${newBadges.length} nouveau(x) badge(s) obtenu(s)`,
            newBadges,
        });
    } catch (error) {
        console.error("Erreur lors de la vérification des badges:", error);
        return NextResponse.json(
            { message: "Erreur serveur" },
            { status: 500 }
        );
    }
}

