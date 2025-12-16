"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp, Edit, Trash2, Reply } from "lucide-react";
import MarkdownRenderer from "@/components/app/markdown/MarkdownRenderer";
import UserAvatar from "@/components/app/user/UserAvatar";
import MarkdownEditor from "@/components/app/markdown/MarkdownEditor";
import { useSession } from "next-auth/react";
import { ConversationMessageSummary } from "@/types/conversation.type";
import Link from "next/link";
import { MessageTreeNode } from "@/lib/message-utils";

interface MessageThreadProps {
    message: MessageTreeNode<ConversationMessageSummary>;
    depth?: number;
    onReply?: (parentId: string, content: string) => Promise<void>;
    onEdit?: (messageId: string, content: string) => Promise<void>;
    onDelete?: (messageId: string) => Promise<void>;
    highlightedMessageId?: string | null;
}

export default function MessageThread({
    message,
    depth = 0,
    onReply,
    onEdit,
    onDelete,
    highlightedMessageId,
}: MessageThreadProps) {
    const { data: session } = useSession();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [editContent, setEditContent] = useState(message.content);
    const [loading, setLoading] = useState(false);

    const isOwner = session?.user?.id === message.userId;
    const sessionRole = session?.user?.role ?? "USER";
    const targetRole = message.user?.role ?? "USER";
    const canModerateTarget =
            sessionRole === "ADMIN" ||
        (sessionRole === "MODERATOR" && targetRole !== "ADMIN");
    const canManage = isOwner || canModerateTarget;
    const hasReplies = Array.isArray(message.replies) && message.replies.length > 0;
    const isHighlighted = highlightedMessageId === message.id;
    const maxDepth = 5;

    const profileHref =
        message.user?.id ?? message.userId
            ? `/users/${message.user?.id ?? message.userId}`
            : null;

    const handleReply = async () => {
        if (!replyContent.trim() || !onReply) return;
        setLoading(true);
        try {
            await onReply(message.id, replyContent);
            setReplyContent("");
            setIsReplying(false);
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim() || !onEdit) return;
        setLoading(true);
        try {
            await onEdit(message.id, editContent);
            setIsEditing(false);
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
        setLoading(true);
        try {
            await onDelete(message.id);
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
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

    const indentClass = depth > 0 ? "ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4" : "";

    useEffect(() => {
        if (!isHighlighted) return;
        const element = document.getElementById(`message-${message.id}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [isHighlighted, message.id]);

    return (
        <div
            id={`message-${message.id}`}
            className={`${indentClass} ${depth > 0 ? 'mt-3' : 'py-4'} ${
                isHighlighted ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 rounded-lg bg-orange-50/40 dark:bg-orange-900/20' : ''
            }`}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <UserAvatar
                    image={message.user?.image ?? null}
                    name={message.user?.name ?? null}
                    email={message.user?.email ?? ""}
                    size="sm"
                    className="shrink-0"
                    href={profileHref ?? undefined}
                />

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {profileHref ? (
                            <Link
                                href={profileHref}
                                className="font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                            >
                                {message.user?.name || "Utilisateur"}
                            </Link>
                        ) : (
                            <span className="font-medium text-gray-900 dark:text-white">
                                {message.user?.name || "Utilisateur"}
                            </span>
                        )}
                        <span>•</span>
                        <span>{getTimeAgo(message.createdAt)}</span>
                        {message.updatedAt &&
                            new Date(message.updatedAt).getTime() !== new Date(message.createdAt).getTime() && (
                            <>
                                <span>•</span>
                                <span className="italic">modifié</span>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    {isEditing ? (
                        <div className="mb-3">
                            <MarkdownEditor
                                value={editContent}
                                onChange={setEditContent}
                                rows={4}
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleEdit}
                                    disabled={loading}
                                    className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                                >
                                    Enregistrer
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(message.content);
                                    }}
                                    disabled={loading}
                                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-2">
                            <MarkdownRenderer content={message.content} />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {!isEditing && depth < maxDepth && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="flex items-center gap-1 hover:text-orange-500 font-medium"
                            >
                                <Reply className="w-3 h-3" />
                                Répondre
                            </button>
                        )}
                        {canManage && !isEditing && (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1 hover:text-blue-500 font-medium"
                                >
                                    <Edit className="w-3 h-3" />
                                    Modifier
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex items-center gap-1 hover:text-red-500 font-medium"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Supprimer
                                </button>
                            </>
                        )}
                        {hasReplies && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1 font-medium hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                ) : (
                                    <ChevronDown className="w-3 h-3" />
                                )}
                                {message.replies?.length ?? 0} réponse{(message.replies?.length ?? 0) > 1 ? "s" : ""}
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                            <MarkdownEditor
                                value={replyContent}
                                onChange={setReplyContent}
                                placeholder="Votre réponse..."
                                rows={4}
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleReply}
                                    disabled={loading || !replyContent.trim()}
                                    className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                                >
                                    Répondre
                                </button>
                                <button
                                    onClick={() => {
                                        setIsReplying(false);
                                        setReplyContent("");
                                    }}
                                    disabled={loading}
                                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {isExpanded && hasReplies && (
                <div className="mt-2">
                    {message.replies?.map((reply) => (
                        <MessageThread
                            key={reply.id}
                            message={reply}
                            depth={depth + 1}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            highlightedMessageId={highlightedMessageId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

