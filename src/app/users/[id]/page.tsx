import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { PublicProfileResponse } from "@/types/profile.type";

async function getPublicProfile(userId: string): Promise<PublicProfileResponse | null> {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
        cache: "no-store",
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Impossible de charger le profil utilisateur");
    }

    return response.json() as Promise<PublicProfileResponse>;
}

function formatRelativeDate(date: string) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export default async function PublicProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const profile = await getPublicProfile(id);

    if (!profile) {
        notFound();
    }

    const { user, conversations, messages, badges } = profile;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name ?? "Avatar utilisateur"}
                                width={80}
                                height={80}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold">
                                {user.name?.[0]?.toUpperCase() ?? "U"}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.name ?? "Utilisateur"}
                                </h1>
                                {user.role !== "USER" && (
                                    <span className="text-xs font-semibold uppercase bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full">
                                        {user.role}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Membre depuis {formatRelativeDate(user.createdAt)}
                            </p>
                            {user.bio && (
                                <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-lg">{user.bio}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg px-4 py-3">
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Karma</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.karma}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg px-4 py-3">
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Conversations</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.stats.conversations}
                            </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg px-4 py-3">
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Messages</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.stats.messages}
                            </p>
                        </div>
                    </div>
                </div>

                <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Badges obtenus
                    </h2>
                    {badges.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {badges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-start gap-3"
                                >
                                    <div className="text-2xl" aria-hidden>
                                        {badge.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {badge.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {badge.description}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                            Obtenu {formatRelativeDate(badge.earnedAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Aucun badge pour le moment.
                        </p>
                    )}
                </section>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Conversations récentes
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {user.stats.conversations} au total
                            </span>
                        </div>
                        {conversations.length > 0 ? (
                            <ul className="space-y-4">
                                {conversations.map((conversation) => (
                                    <li key={conversation.id}>
                                        <Link
                                            href={`/conversation/${conversation.id}`}
                                            className="block group"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                                                        {conversation.title ?? "Sans titre"}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Publié {formatRelativeDate(conversation.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                                    <p>{conversation.votes} votes</p>
                                                    <p>{conversation.messagesCount} réponses</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Aucune conversation publique pour le moment.
                            </p>
                        )}
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Messages récents
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {user.stats.messages} au total
                            </span>
                        </div>
                        {messages.length > 0 ? (
                            <ul className="space-y-4">
                                {messages.map((message) => (
                                    <li key={message.id} className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                            {message.content}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>{formatRelativeDate(message.createdAt)}</span>
                                            {message.conversation && (
                                                <Link
                                                    href={`/conversation/${message.conversation.id}?focus=${message.id}`}
                                                    className="text-orange-500 hover:text-orange-600 font-medium"
                                                >
                                                    Voir la discussion
                                                </Link>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Aucun message public pour le moment.
                            </p>
                        )}
                    </section>
                </div>

            </div>
        </div>
    );
}


