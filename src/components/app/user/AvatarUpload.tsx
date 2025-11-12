"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
    currentAvatar?: string | null;
    userName?: string;
    onUploadComplete?: (imageUrl?: string | null) => void;
}

export default function AvatarUpload({
    currentAvatar,
    userName,
    onUploadComplete,
}: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentAvatar || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vérifier la taille (max 2MB pour les avatars)
        if (file.size > 2 * 1024 * 1024) {
            alert("Le fichier est trop volumineux. Taille max : 2MB");
            return;
        }

        // Prévisualisation locale
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            // Upload vers notre API
            const uploadResponse = await fetch("/api/upload/avatar", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) throw new Error("Erreur lors de l'upload");

            const { url } = await uploadResponse.json();

            // Mettre à jour l'avatar dans la base de données
            const updateResponse = await fetch("/api/user/avatar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: url }),
            });

            if (!updateResponse.ok) throw new Error("Erreur lors de la mise à jour");

            setPreview(url);
            onUploadComplete?.(url);
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de l'upload de l'avatar");
            setPreview(currentAvatar || null);
            onUploadComplete?.(currentAvatar || null);
        } finally {
            setUploading(false);
        }
    };

    const initials = userName
        ? userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "U";

    return (
        <div className="relative w-32 h-32 group">
            {preview ? (
                <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                        src={preview}
                        alt="Avatar"
                        fill
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold text-4xl">{initials}</span>
                </div>
            )}

            {/* Overlay pour l'upload */}
            <label className="absolute inset-0 rounded-full bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-all">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                />
                {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                    <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </label>
        </div>
    );
}
