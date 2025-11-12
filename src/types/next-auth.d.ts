import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "USER" | "MODERATOR" | "ADMIN";
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        email: string;
        name?: string | null;
        image?: string | null;
        role: "USER" | "MODERATOR" | "ADMIN";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        image?: string | null;
        role?: "USER" | "MODERATOR" | "ADMIN";
    }
}

