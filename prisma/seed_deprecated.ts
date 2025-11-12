import { prisma } from "../src/lib/prisma";

const NB_CONVERSATIONS = 12;
const NB_MESSAGE_PER_CONVERSATION = 6;

const conversationTitles = [
    "Quelle est votre stack technologique préférée en 2024 ?",
    "Comment gérer l'authentification avec Next.js ?",
    "Prisma vs TypeORM : lequel choisir ?",
    "Meilleures pratiques pour optimiser les performances React",
    "Débuter avec Docker : conseils et ressources",
    "PostgreSQL vs MongoDB : votre avis ?",
    "Comment structurer un projet Next.js de grande envergure ?",
    "Tailwind CSS : êtes-vous fan ou sceptique ?",
    "Gestion d'état en 2024 : Redux, Zustand ou Context API ?",
    "Conseils pour réussir son premier projet open source",
    "Afficher du Markdown dans vos messages ? Voici comment",
    "Vos indispensables VS Code en 2024"
];

const messageTemplates = [
    "C'est une excellente question ! Je pense que...",
    "D'après mon expérience, je dirais que...",
    "Je suis totalement d'accord avec toi sur ce point.",
    "Intéressant ! J'ai une approche un peu différente...",
    "Merci pour ce partage ! Ça m'a beaucoup aidé.",
    "Je ne suis pas sûr de comprendre, tu peux clarifier ?",
    "Voici un lien utile qui pourrait vous aider.",
    "J'ai eu le même problème la semaine dernière !",
    "Super conseil, je vais essayer ça demain.",
    "Quelqu'un a-t-il une autre solution à proposer ?",
    "```ts\nconst x = 1;\nconsole.log(x);\n```",
    "- point 1\n- point 2\n- point 3",
];

const categories = [
    { name: "Tech", slug: "tech", color: "#3B82F6", icon: "💻" },
    { name: "Design", slug: "design", color: "#8B5CF6", icon: "🎨" },
    { name: "Business", slug: "business", color: "#10B981", icon: "💼" },
    { name: "Science", slug: "science", color: "#F59E0B", icon: "🔬" },
    { name: "Gaming", slug: "gaming", color: "#EF4444", icon: "🎮" },
];

const users = [
    {
        email: "seed@example.com",
        name: "Utilisateur Seed",
        // "password"
        password: "$2a$10$B0Qw2S2Cx2nK8nqgqQY9lO4g8o2C0yQb7iW6p9Lq6mXGk2fHqZtXS",
    },
    {
        email: "alice@example.com",
        name: "Alice",
        password: "$2a$10$B0Qw2S2Cx2nK8nqgqQY9lO4g8o2C0yQb7iW6p9Lq6mXGk2fHqZtXS",
    },
    {
        email: "bob@example.com",
        name: "Bob",
        password: "$2a$10$B0Qw2S2Cx2nK8nqgqQY9lO4g8o2C0yQb7iW6p9Lq6mXGk2fHqZtXS",
    },
];

function rand<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log("🌱 Début du seed global...");

    // Nettoyage minimal (conversations/messages/favoris) pour éviter les doublons
    await prisma.savedConversation.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();

    // Upsert des catégories
    console.log("🗂️  Catégories...");
    const createdCategories = [] as { id: string; name: string }[];
    for (const c of categories) {
        const cat = await prisma.category.upsert({
            where: { slug: c.slug },
            update: c,
            create: c,
        });
        createdCategories.push({ id: cat.id, name: cat.name });
    }

    // Upsert des utilisateurs seed
    console.log("👤 Utilisateurs...");
    const createdUsers = [] as { id: string; email: string }[];
    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name },
            create: u,
        });
        createdUsers.push({ id: user.id, email: user.email });
    }

    // Conversations + Messages (+ quelques réponses imbriquées)
    console.log("💬 Conversations et messages...");
    const createdConversationsIds: string[] = [];
    for (let i = 0; i < NB_CONVERSATIONS; i++) {
        const author = rand(createdUsers);
        const cat = rand(createdCategories);

        const conversation = await prisma.conversation.create({
            data: {
                title: conversationTitles[i % conversationTitles.length],
                votes: Math.floor(Math.random() * 500) + 10,
                userId: author.id,
                categoryId: cat.id,
                messages: {
                    create: {
                        // premier message markdown parfois
                        content: rand([
                            "Bonjour à tous !",
                            "**Bienvenue** dans cette conversation.",
                            "Voici un exemple de code:\n\n```js\nconsole.log('Hello');\n```",
                        ]),
                        userId: author.id,
                    },
                },
            },
        });

        createdConversationsIds.push(conversation.id);
        console.log(`✅ Conversation: ${conversation.title} (${cat.name})`);

        // autres messages
        const createdMessageIds: string[] = [];
        for (let j = 0; j < NB_MESSAGE_PER_CONVERSATION; j++) {
            const mAuthor = rand(createdUsers);
            // 25% de chance d'être une réponse à un message précédent
            const isReply = createdMessageIds.length > 0 && Math.random() < 0.25;
            const parentId = isReply ? rand(createdMessageIds) : undefined;
            const msg = await prisma.message.create({
                data: {
                    content: messageTemplates[Math.floor(Math.random() * messageTemplates.length)],
                    conversationId: conversation.id,
                    userId: mAuthor.id,
                    parentId,
                },
            });
            createdMessageIds.push(msg.id);
        }
    }

    // Sauvegardes: l'utilisateur seed sauvegarde quelques conversations
    console.log("⭐ Sauvegardes...");
    const seedUser = await prisma.user.findUnique({ where: { email: "seed@example.com" } });
    if (seedUser) {
        for (const id of createdConversationsIds.slice(0, 3)) {
            await prisma.savedConversation.upsert({
                where: { userId_conversationId: { userId: seedUser.id, conversationId: id } },
                update: {},
                create: { userId: seedUser.id, conversationId: id },
            });
        }
    }

    console.log(`\n🎉 Seed terminé ! ${createdConversationsIds.length} conversations, catégories: ${createdCategories.length}, utilisateurs: ${createdUsers.length}.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log("Seed completed");
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });