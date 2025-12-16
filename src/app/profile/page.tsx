import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) {
        return <div className="p-6 text-gray-500">Veuillez vous connecter.</div>;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            conversations: {
                where: { deletedAt: null },
                orderBy: { createdAt: "desc" },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    votes: true,
                },
            },
            messages: {
                where: { deletedAt: null },
                orderBy: { createdAt: "desc" },
                take: 10,
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    conversationId: true,
                    conversation: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            },
            badges: {
                include: { badge: true },
                orderBy: { earnedAt: "desc" },
            },
        },
    });

    if (!user) return <div className="p-6">Utilisateur introuvable</div>;

    const formatDate = (date: Date) =>
        date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">{user.name || user.email}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Karma&nbsp;: <span className="font-semibold text-orange-500">{user.karma}</span>
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <section>
                    <h2 className="font-semibold mb-3 text-lg dark:text-white">Dernières conversations</h2>
                    {user.conversations.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {user.conversations.map((c) => (
                                <li key={c.id}>
                                    <Link
                                        href={`/conversation/${c.id}`}
                                        className="block p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-orange-500 dark:hover:border-orange-500/70 transition-colors"
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <span className="font-medium line-clamp-2">{c.title || "Sans titre"}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                {formatDate(c.createdAt)}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {c.votes ?? 0} vote{(c.votes ?? 0) > 1 ? "s" : ""}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Vous n&apos;avez pas encore créé de conversation.
                        </p>
                    )}
                </section>

                <section>
                    <h2 className="font-semibold mb-3 text-lg dark:text-white">Derniers messages</h2>
                    {user.messages.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {user.messages.map((m) => {
                                const conversationId = m.conversationId ?? m.conversation?.id;
                                return (
                                    <li key={m.id}>
                                        {conversationId ? (
                                            <Link
                                                href={`/conversation/${conversationId}?focus=${m.id}`}
                                                className="block p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-orange-500 dark:hover:border-orange-500/70 transition-colors"
                                            >
                                                <p className="line-clamp-3 text-sm">{m.content}</p>
                                                <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                                    <span>{m.conversation?.title || "Conversation"}</span>
                                                    <span>{formatDate(m.createdAt)}</span>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                <p className="line-clamp-3 text-sm">{m.content}</p>
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    Conversation introuvable
                                                </p>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Vous n&apos;avez pas encore écrit de message.
                        </p>
                    )}
                </section>
            </div>

            <section>
                <h2 className="font-semibold mb-3 text-lg dark:text-white">Badges obtenus</h2>
                {user.badges.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {user.badges.map(({ id, badge, earnedAt }) => (
                            <div
                                key={id}
                                className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 flex items-start gap-3"
                            >
                                <div className="text-2xl" aria-hidden>
                                    {badge.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{badge.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{badge.description}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                        Obtenu le {formatDate(earnedAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vous n&apos;avez pas encore obtenu de badge. Continuez à participer pour en débloquer&nbsp;!
                    </p>
                )}
            </section>
        </div>
    );
}

