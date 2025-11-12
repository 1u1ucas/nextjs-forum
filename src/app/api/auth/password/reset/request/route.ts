import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";
import { resend, DEFAULT_FROM_EMAIL } from "@/lib/email";
import ResetPassword from "@/emails/ResetPassword";

const requestSchema = z.object({
    email: z.string().trim().email("Email invalide"),
});

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const parsed = requestSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { email } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Réponse générique pour éviter la divulgation d'existence
        const genericResponse = NextResponse.json({
            message:
                "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
        });

        if (!user || !user.password) {
            return genericResponse;
        }

        await prisma.passwordResetToken.deleteMany({
            where: { email },
        });

        const token = randomUUID();
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 heure

        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        });

        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ??
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const resetUrl = `${appUrl}/auth/reset/${token}`;

        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: DEFAULT_FROM_EMAIL,
                to: email,
                subject: "Réinitialisez votre mot de passe",
                react: ResetPassword({
                    name: user.name,
                    resetUrl,
                }),
            });
        }

        return genericResponse;
    } catch (error) {
        console.error("Password reset request error:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue" },
            { status: 500 }
        );
    }
}


