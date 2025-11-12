import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: "Token manquant" }, { status: 400 });
        }

        const storedToken = await prisma.verificationToken.findFirst({
            where: { token },
        });

        if (!storedToken) {
            return NextResponse.json(
                { error: "Token invalide ou déjà utilisé" },
                { status: 400 },
            );
        }

        if (storedToken.expires < new Date()) {
            await prisma.verificationToken.delete({
                where: {
                    identifier_token: {
                        identifier: storedToken.identifier,
                        token: storedToken.token,
                    },
                },
            });

            return NextResponse.json(
                { error: "Token expiré, veuillez redemander un email de confirmation" },
                { status: 400 },
            );
        }

        await prisma.user.update({
            where: { email: storedToken.identifier },
            data: {
                emailVerified: new Date(),
            },
        });

        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: storedToken.identifier,
                    token: storedToken.token,
                },
            },
        });

        return NextResponse.json({ message: "Email confirmé avec succès" });
    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.json(
            { error: "Erreur lors de la confirmation" },
            { status: 500 },
        );
    }
}


