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
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    if (!user) return <div className="p-6">Utilisateur introuvable</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold dark:text-white">{user.name || user.email}</h1>
                <p className="text-gray-600 dark:text-gray-400">Karma: {user.karma}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h2 className="font-semibold mb-2 dark:text-white">Dernières conversations</h2>
                    <ul className="space-y-2 text-sm">
                        {user.conversations.map((c) => (
                            <li key={c.id} className="p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                {c.title}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="font-semibold mb-2 dark:text-white">Derniers messages</h2>
                    <ul className="space-y-2 text-sm">
                        {user.messages.map((m) => (
                            <li key={m.id} className="p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                {m.content}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}


