import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { message: "Aucun fichier fourni" },
                { status: 400 }
            );
        }

        // Vérifier la taille (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json(
                { message: "Le fichier est trop volumineux. Taille max : 2MB" },
                { status: 400 }
            );
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { message: "Le fichier doit être une image" },
                { status: 400 }
            );
        }

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${session.user.id}-${timestamp}.${fileExtension}`;
        
        // Enregistrer le fichier dans public/avatars
        const uploadsDir = join(process.cwd(), "public", "avatars");
        
        // Créer le dossier s'il n'existe pas
        const { mkdir } = await import("fs/promises");
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = join(uploadsDir, fileName);
        
        await writeFile(filePath, buffer);

        // Retourner l'URL du fichier
        const fileUrl = `/avatars/${fileName}`;

        return NextResponse.json({
            url: fileUrl,
        });
    } catch (error) {
        console.error("Erreur lors de l'upload:", error);
        return NextResponse.json(
            { message: "Erreur lors de l'upload" },
            { status: 500 }
        );
    }
}

