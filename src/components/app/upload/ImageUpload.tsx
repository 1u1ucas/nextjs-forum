"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    currentImage?: string;
    maxSize?: number; // en MB
}

export default function ImageUpload({
    onUploadComplete,
    currentImage,
    maxSize = 4,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vérifier la taille
        if (file.size > maxSize * 1024 * 1024) {
            alert(`Le fichier est trop volumineux. Taille max : ${maxSize}MB`);
            return;
        }

        // Prévisualisation
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload vers Uploadthing
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/uploadthing", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Erreur lors de l'upload");

            const data = await response.json();
            onUploadComplete(data.url);
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de l'upload");
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUploadComplete("");
    };

    return (
        <div className="w-full">
            {preview ? (
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <label className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors bg-gray-50 dark:bg-gray-900">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Cliquez pour uploader une image
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Max {maxSize}MB
                            </p>
                        </>
                    )}
                </label>
            )}
        </div>
    );
}

