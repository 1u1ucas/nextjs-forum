"use client";

import { Message } from "@/generated/prisma";
import { ConversationWithExtend } from "@/types/conversation.type";
import { MessageCircle, Share2, Bookmark, ChevronUp, ChevronDown, Check, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { voteService } from "@/services/vote.service";
import { useRouter } from "next/navigation";
import { savedService } from "@/services/saved.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";
import { useSession } from "next-auth/react";
import ImageCarousel from "./ImageCarousel";

interface ConversationCardProps {
    conversation: ConversationWithExtend;
}

export default function ConversationCard({ conversation }: ConversationCardProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [votes, setVotes] = useState(conversation.votes || 0);
    const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showCopied, setShowCopied] = useState(false);

    const isOwner = session?.user?.id === conversation.userId;

    useEffect(() => {
        const saved = localStorage.getItem(`saved_${conversation.id}`);
        setIsSaved(saved === 'true');
    }, [conversation.id]);

    const handleVote = async (type: 'up' | 'down') => {
        const previousVotes = votes;
        const previousStatus = voteStatus;

        try {
            if (voteStatus === type) {
                setVoteStatus(null);
                setVotes(votes + (type === 'up' ? -1 : 1));
            } else {
                if (voteStatus) {
                    setVotes(votes + (type === 'up' ? 2 : -2));
                } else {
                    setVotes(votes + (type === 'up' ? 1 : -1));
                }
                setVoteStatus(type);
            }
            
            await voteService.vote(conversation.id, type);
        } catch (error) {
            console.error("Erreur lors du vote:", error);
            setVotes(previousVotes);
            setVoteStatus(previousStatus);
        }
    };

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `il y a ${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `il y a ${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        return `il y a ${days}j`;
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/conversation/${conversation.id}`;
        try {
            await navigator.clipboard.writeText(url);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (error) {
            console.error("Erreur lors de la copie:", error);
        }
    };

    const handleSave = async () => {
        try {
            const newSavedState = !isSaved;
            setIsSaved(newSavedState);
            if (newSavedState) {
                await savedService.save(conversation.id);
            } else {
                await savedService.unsave(conversation.id);
            }
            localStorage.setItem(`saved_${conversation.id}`, String(newSavedState));
        } catch (e) {
            // rollback local state if server fails
            setIsSaved((prev) => {
                const reverted = !prev;
                localStorage.setItem(`saved_${conversation.id}`, String(reverted));
                return reverted;
            });
        }
    };

    const handleViewDetails = () => {
        router.push(`/conversation/${conversation.id}`);
    };

    // Mutation pour supprimer la conversation
    const deleteMutation = useMutation({
        mutationFn: () => conversationService.deleteConversation(conversation.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) return;
        deleteMutation.mutate();
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
            <div className="flex">
                {/* Vote section */}
                <div className="w-10 bg-gray-50 dark:bg-gray-900 flex flex-col items-center pt-2 pb-1 rounded-l">
                    <button
                        onClick={() => handleVote('up')}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${voteStatus === 'up' ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        <ChevronUp className="w-6 h-6" />
                    </button>
                    <span className={`text-xs font-bold my-1 ${voteStatus === 'up' ? 'text-orange-500' : voteStatus === 'down' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {votes}
                    </span>
                    <button
                        onClick={() => handleVote('down')}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${voteStatus === 'down' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        <ChevronDown className="w-6 h-6" />
                    </button>
                </div>

                {/* Content section */}
                <div className="flex-1 p-2">
                    {/* Header */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">r/forum</span>
                        <span>•</span>
                        <span>Posté {getTimeAgo(conversation.createdAt)}</span>
                    </div>

                    {/* Title */}
                    <h2 
                        onClick={handleViewDetails}
                        className="text-lg font-medium text-gray-900 dark:text-white mb-2 hover:underline cursor-pointer"
                    >
                        {conversation.title || "Sans titre"}
                    </h2>

                    {/* Images */}
                    {conversation.imageUrl && (
                        <div className="mb-3">
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
                        </div>
                    )}

                    {/* Preview or expanded content */}
                    {isExpanded && conversation.messages.length > 0 && (
                        <div className="mb-3 space-y-2">
                            {conversation.messages.slice(0, 3).map((message: Message) => (
                                <div key={message.id} className="text-sm text-gray-700 dark:text-gray-300 pl-3 border-l-2 border-gray-300 dark:border-gray-600">
                                    {message.content}
                                </div>
                            ))}
                            {conversation.messages.length > 3 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">+ {conversation.messages.length - 3} autres messages...</p>
                            )}
                        </div>
                    )}

                    {/* Actions bar */}
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                        <button
                            onClick={handleViewDetails}
                            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>{conversation.messages.length} Commentaires</span>
                        </button>
                        <button 
                            onClick={handleShare}
                            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                        >
                            {showCopied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                            <span className={showCopied ? "text-green-500" : ""}>
                                {showCopied ? "Copié!" : "Partager"}
                            </span>
                        </button>
                        <button 
                            onClick={handleSave}
                            className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${isSaved ? 'text-orange-500' : ''}`}
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                            <span>{isSaved ? "Sauvegardé" : "Sauvegarder"}</span>
                        </button>
                        {isOwner && (
                            <button 
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>{deleteMutation.isPending ? "Suppression..." : "Supprimer"}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

