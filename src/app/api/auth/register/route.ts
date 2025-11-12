import { prisma } from "@/lib/prisma";
import { resend, DEFAULT_FROM_EMAIL } from "@/lib/email";
import ConfirmEmail from "@/emails/ConfirmEmail";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Tous les champs sont requis" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Le mot de passe doit contenir au moins 6 caractères" },
                { status: 400 }
            );
        }

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

