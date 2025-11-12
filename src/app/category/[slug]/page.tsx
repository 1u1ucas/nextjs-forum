import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ConversationCard from "@/components/app/conversation/ConversationCard";
import { Tag, TrendingUp, Clock } from "lucide-react";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
    const category = await prisma.category.findUnique({
        where: { slug: params.slug },
        include: {
            conversations: {
                where: {
                    deletedAt: null,
                },
                orderBy: { createdAt: "desc" },
                take: 50,
                include: {
                    messages: true,
                    user: true,
                    category: true,
                },
            },
        },
    });

    if (!category) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Category Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${category.color}20` }}
                        >
                            {category.icon || <Tag className="w-8 h-8" style={{ color: category.color }} />}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {category.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {category.conversations.length} publication{category.conversations.length > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold" style={{ color: category.color }}>
                                {category.conversations.length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                <Tag className="w-3 h-3" />
                                Publications
                            </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-blue-500">
                                {category.conversations.reduce((acc, conv) => acc + conv.messages.length, 0)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" />
                                Commentaires
                            </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-green-500">
                                {category.conversations.reduce((acc, conv) => acc + conv.votes, 0)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Votes
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversations List */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Publications dans {category.name}
                    </h2>
                    <div className="space-y-2.5">
                        {category.conversations.length > 0 ? (
                            category.conversations.map((conversation) => (
                                <ConversationCard key={conversation.id} conversation={conversation as any} />
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-12 text-center">
                                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    Aucune publication dans cette catégorie pour le moment
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                    Soyez le premier à créer une discussion !
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

