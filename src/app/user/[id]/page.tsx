import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Award, Calendar, MessageSquare, FileText, Bookmark } from "lucide-react";
import ConversationCard from "@/components/app/conversation/ConversationCard";

export default async function UserProfilePage({ params }: { params: { id: string } }) {
    const user = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
            conversations: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: {
                    messages: true,
                    user: true,
                    category: true,
                },
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            badges: {
                include: {
                    badge: true,
                },
            },
        },
    });

    if (!user) {
        notFound();
    }

    const joinedDate = new Date(user.createdAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header Profile */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-4xl">
                                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {user.name || "Utilisateur"}
                            </h1>
                            {user.bio && (
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {user.bio}
                                </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Membre depuis {joinedDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    <span className="font-bold text-orange-500">{user.karma} karma</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-orange-500">{user.conversations.length}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                <FileText className="w-3 h-3" />
                                Posts
                            </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-blue-500">{user.messages.length}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Commentaires
                            </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-green-500">{user.karma}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                <Award className="w-3 h-3" />
                                Karma
                            </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-purple-500">{user.badges.length}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                <Award className="w-3 h-3" />
                                Badges
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    {user.badges.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Badges</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.badges.map((userBadge) => (
                                    <div
                                        key={userBadge.id}
                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                        style={{
                                            backgroundColor: `${userBadge.badge.color}20`,
                                            color: userBadge.badge.color,
                                        }}
                                    >
                                        {userBadge.badge.icon} {userBadge.badge.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Posts */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Publications récentes
                    </h2>
                    <div className="space-y-2.5">
                        {user.conversations.length > 0 ? (
                            user.conversations.map((conversation) => (
                                <ConversationCard key={conversation.id} conversation={conversation as any} />
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-12 text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    Aucune publication pour le moment
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

