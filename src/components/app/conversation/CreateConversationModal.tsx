"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";
import Image from "next/image";

interface CreateConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateConversationModal({
    isOpen,
    onClose,
    onCreated,
}: CreateConversationModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const createMutation = useMutation({
        mutationFn: ({ title, content, images }: { title: string; content: string; images: string[] }) =>
            conversationService.createConversation(title, content, images),
        onSuccess: () => {
            setTitle("");
            setContent("");
            setImages([]);
            onCreated();
            onClose();
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Le fichier est trop volumineux. Taille max : 5MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload/conversation", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Erreur lors de l'upload");

            const { url } = await response.json();
            setImages([...images, url]);
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de l'upload de l'image");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            return;
        }

        createMutation.mutate({ title, content, images });
    };

    const handleClose = () => {
        setTitle("");
        setContent("");
        setImages([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-bold dark:text-white">Créer une conversation</h2>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Titre
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Un titre intéressant..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            disabled={createMutation.isPending}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Contenu
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Qu'est-ce que vous voulez discuter ?"
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            disabled={createMutation.isPending}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Images (optionnel)
                        </label>
                        
                        {/* Preview des images */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <Image
                                            src={img}
                                            alt={`Image ${index + 1}`}
                                            width={150}
                                            height={150}
                                            className="object-cover rounded"
                                            unoptimized
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:border-orange-500 transition-colors">
                            <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {uploading ? "Upload en cours..." : "Ajouter une image"}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading || createMutation.isPending || images.length >= 5}
                                className="hidden"
                            />
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Maximum 5 images, 5MB par image
                        </p>
                    </div>

                    {createMutation.isError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
                            Erreur lors de la création
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-medium"
                            disabled={createMutation.isPending}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Création..." : "Publier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
