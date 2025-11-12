import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing({
    accessKey: process.env.UPLOADTHING_SECRET,
});

export const ourFileRouter = {
    // Route pour les avatars
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const session = await auth();
            if (!session?.user?.id) throw new Error("Non autorisé");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId, url: file.url };
        }),

    // Route pour les images dans les conversations
    conversationImage: f({ image: { maxFileSize: "8MB", maxFileCount: 5 } })
        .middleware(async ({ req }) => {
            const session = await auth();
            if (!session?.user?.id) throw new Error("Non autorisé");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

