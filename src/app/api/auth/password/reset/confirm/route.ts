import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const confirmSchema = z.object({
    token: z.string().min(1, "Token requis"),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .max(128, "Le mot de passe est trop long")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
        .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
});

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const parsed = confirmSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { token, password } = parsed.data;

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken || resetToken.expires < new Date()) {
            return NextResponse.json(
                { error: "Lien invalide ou expiré" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: resetToken.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur introuvable" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                },
            }),
            prisma.passwordResetToken.delete({
                where: { token },
            }),
        ]);

        return NextResponse.json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
        console.error("Password reset confirm error:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue" },
            { status: 500 }
        );
    }
}


