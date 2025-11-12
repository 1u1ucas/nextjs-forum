import { prisma } from "@/lib/prisma";
import { resend, DEFAULT_FROM_EMAIL } from "@/lib/email";
import ConfirmEmail from "@/emails/ConfirmEmail";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import { z } from "zod";

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom doit contenir au maximum 50 caractères"),
    email: z
        .string()
        .trim()
        .email("Email invalide")
        .max(255, "Email trop long"),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .max(128, "Le mot de passe est trop long")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
        .regex(
            /[^A-Za-z0-9]/,
            "Le mot de passe doit contenir au moins un caractère spécial"
        ),
});

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const parsed = registerSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Données invalides",
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const { name, email, password } = parsed.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const token = randomUUID();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });

        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ??
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const confirmationUrl = `${appUrl}/auth/verify?token=${token}`;

        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: DEFAULT_FROM_EMAIL,
                to: email,
                subject: "Confirmez votre email",
                react: ConfirmEmail({
                    name,
                    confirmationUrl,
                }),
            });
        } else {
            console.warn(
                `RESEND_API_KEY non configuré, aucun email de confirmation envoyé pour ${email}`,
            );
        }

        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                message: "Inscription réussie. Vérifiez votre email pour confirmer votre compte.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue" },
            { status: 500 }
        );
    }
}

