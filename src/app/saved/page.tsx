"use client";

import { useEffect, useState } from "react";
import { savedService } from "@/services/saved.service";
import { SavedConversationItem } from "@/types/saved.type";
import ConversationCard from "@/components/app/conversation/ConversationCard";
import { Loader2, Bookmark } from "lucide-react";

export default function SavedPage() {
    const [items, setItems] = useState<SavedConversationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await savedService.listSaved();
                setItems(data);
            } catch (err) {
                console.error(err);
                setError("Impossible de charger vos favoris pour le moment.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Bookmark className="w-8 h-8 text-orange-500" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes favoris</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                        {items.length} conversation{items.length > 1 ? 's' : ''} sauvegardée{items.length > 1 ? 's' : ''}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg p-6 text-center">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {items.length > 0 ? (
                            items.map((it) => (
                                <ConversationCard
                                    key={it.conversation.id}
                                    conversation={it.conversation}
                                    initialIsSaved
                                    onSavedChange={(saved) => {
                                        if (!saved) {
                                            setItems((prev) =>
                                                prev.filter(
                                                    (item) => item.conversation.id !== it.conversation.id
                                                )
                                            );
                                        }
                                    }}
                                />
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-12 text-center">
                                <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    Aucun favori pour le moment
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                    Cliquez sur "Sauvegarder" sur une conversation pour l'ajouter ici
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
