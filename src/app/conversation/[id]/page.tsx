"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { conversationService } from "@/services/conversation.service";
import { ConversationWithExtend } from "@/types/conversation.type";
import { ArrowLeft, Send, MessageCircle, Trash2 } from "lucide-react";
import MarkdownEditor from "@/components/app/markdown/MarkdownEditor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MessageThread from "@/components/app/conversation/MessageThread";
import { useSession } from "next-auth/react";
import ImageCarousel from "@/components/app/conversation/ImageCarousel";

export default function ConversationDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [newMessage, setNewMessage] = useState("");
    const focusId = searchParams.get("focus");

    // Query pour récupérer la conversation
    const { data: conversation, isLoading } = useQuery<ConversationWithExtend>({
        queryKey: ['conversation', params.id],
        queryFn: () => conversationService.getConversation(params.id as string),
    });

    // Mutation pour ajouter un message
    const addMessageMutation = useMutation({
        mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
            conversationService.addMessage(conversation!.id, content, parentId),
        onSuccess: () => {
            // Invalider la query pour refetch avec les nouveaux messages
            queryClient.invalidateQueries({ queryKey: ['conversation', params.id] });
            setNewMessage("");
        },
    });

    // Mutation pour éditer un message
    const editMessageMutation = useMutation({
        mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
            const response = await fetch(`/api/messages/${messageId}/edit`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            if (!response.ok) throw new Error("Erreur lors de l'édition");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversation', params.id] });
        },
    });

    // Mutation pour supprimer un message
    const deleteMessageMutation = useMutation({
        mutationFn: async (messageId: string) => {
            const response = await fetch(`/api/messages/${messageId}/delete`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Erreur lors de la suppression");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversation', params.id] });
        },
    });

    // Mutation pour supprimer la conversation
    const deleteConversationMutation = useMutation({
        mutationFn: () => conversationService.deleteConversation(conversation!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            router.push("/");
        },
    });

    const handleDeleteConversation = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) return;
        deleteConversationMutation.mutate();
    };

    // Fonction pour construire l'arbre hiérarchique des messages
    const buildMessageTree = (messages: any[]) => {
        const messageMap = new Map();
        const rootMessages: any[] = [];

        // Créer un map de tous les messages
        messages.forEach(msg => {
            messageMap.set(msg.id, { ...msg, replies: [] });
        });

        // Organiser les messages en arbre
        messages.forEach(msg => {
            const message = messageMap.get(msg.id);
            if (!msg.parentId) {
                rootMessages.push(message);
            } else {
                const parent = messageMap.get(msg.parentId);
                if (parent) {
                    parent.replies.push(message);
                }
            }
        });

        return rootMessages;
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || addMessageMutation.isPending) return;
        addMessageMutation.mutate({ content: newMessage });
    };

    useEffect(() => {
        if (!conversation || !focusId) return;
        const element = document.getElementById(`message-${focusId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [conversation, focusId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Conversation non trouvée</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5 dark:text-white" />
                    </button>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {conversation.messages.length} commentaire{conversation.messages.length > 1 ? "s" : ""}
                        </p>
                    </div>
                    {session?.user?.id === conversation.userId && (
                        <button
                            onClick={handleDeleteConversation}
                            disabled={deleteConversationMutation.isPending}
                            className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span className="font-medium">{deleteConversationMutation.isPending ? "Suppression..." : "Supprimer"}</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-5">
                {/* Images with Title */}
                <div className="mb-4 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 p-4">
                    {conversation.imageUrl ? (
                        <>
                            {(() => {
                                try {
                                    const imageArray = JSON.parse(conversation.imageUrl);
                                    if (Array.isArray(imageArray) && imageArray.length > 0) {
                                        return <ImageCarousel images={imageArray} alt={conversation.title || "Image"} />;
                                    }
                                } catch (e) {
                                    // Si ce n'est pas un JSON array, traiter comme une image unique
                                    return <ImageCarousel images={[conversation.imageUrl]} alt={conversation.title || "Image"} />;
                                }
                                return null;
                            })()}
                            <h1 className="text-2xl font-bold dark:text-white mt-4">{conversation.title}</h1>
                        </>
                    ) : (
                        <h1 className="text-2xl font-bold dark:text-white">{conversation.title}</h1>
                    )}
                </div>

                {/* Messages */}
                <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                    {conversation.messages && conversation.messages.length > 0 ? (
                        buildMessageTree(conversation.messages).map((message: any) => (
                            <MessageThread
                                key={message.id}
                                message={message}
                                highlightedMessageId={focusId}
                                onReply={async (parentId, content) => {
                                    await addMessageMutation.mutateAsync({ content, parentId });
                                }}
                                onEdit={async (messageId, content) => {
                                    await editMessageMutation.mutateAsync({ messageId, content });
                                }}
                                onDelete={async (messageId) => {
                                    await deleteMessageMutation.mutateAsync(messageId);
                                }}
                            />
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            <p>Aucun commentaire pour le moment</p>
                        </div>
                    )}
                </div>

                {/* Add message form */}
                <div className="mt-4 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 p-4">
                    <form onSubmit={handleSendMessage}>
                        <MarkdownEditor
                            value={newMessage}
                            onChange={setNewMessage}
                            placeholder="Ajouter un commentaire en Markdown..."
                            rows={6}
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                type="submit"
                                disabled={addMessageMutation.isPending || !newMessage.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                {addMessageMutation.isPending ? "Envoi..." : "Commenter"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
