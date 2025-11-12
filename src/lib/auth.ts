import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

function assertEnv(value: string | undefined, name: string) {
    if (!value) {
        console.warn(`${name} is not set. Related features may not work.`);
        return "";
    }
    return value;
}

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    providers: [
        Google({
            clientId: assertEnv(process.env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID"),
            clientSecret: assertEnv(process.env.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET"),
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string,
                    },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                if (!user.emailVerified) {
                    throw new Error("EmailNotVerified");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google" && profile?.email) {
                await prisma.user.updateMany({
                    where: { email: profile.email },
                    data: { emailVerified: new Date() },
                });
            }
            return true;
        },
        async jwt({ token, user, trigger, session, account }) {
            if (user) {
                token.id = user.id;
                token.image = user.image;
                token.name = user.name;
            }

            if (account?.provider === "google") {
                token.provider = "google";
            }

            if (trigger === "update" && session?.user) {
                if (session.user.name !== undefined) {
                    token.name = session.user.name;
                }
                if ("image" in session.user && session.user.image !== undefined) {
                    token.image = session.user.image;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.image = token.image as string | null;
                if (token.name) {
                    session.user.name = token.name as string | null;
                }
            }
            return session;
        },
    },
});

