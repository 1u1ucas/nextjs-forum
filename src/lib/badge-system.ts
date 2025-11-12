import { prisma } from "@/lib/prisma";

export interface BadgeDefinition {
    name: string;
    description: string;
    icon: string;
    color: string;
    requirement: string;
    checkFunction: (userId: string) => Promise<boolean>;
}

// Définitions des badges
export const BADGES: BadgeDefinition[] = [
    {
        name: "Premier Pas",
        description: "Créez votre première publication",
        icon: "🎯",
        color: "#3B82F6",
        requirement: "Créer 1 conversation",
        checkFunction: async (userId: string) => {
            const count = await prisma.conversation.count({
                where: { userId, deletedAt: null },
            });
            return count >= 1;
        },
    },
    {
        name: "Contributeur",
        description: "Créez 10 publications",
        icon: "✍️",
        color: "#10B981",
        requirement: "Créer 10 conversations",
        checkFunction: async (userId: string) => {
            const count = await prisma.conversation.count({
                where: { userId, deletedAt: null },
            });
            return count >= 10;
        },
    },
    {
        name: "Expert",
        description: "Créez 50 publications",
        icon: "🏆",
        color: "#F59E0B",
        requirement: "Créer 50 conversations",
        checkFunction: async (userId: string) => {
            const count = await prisma.conversation.count({
                where: { userId, deletedAt: null },
            });
            return count >= 50;
        },
    },
    {
        name: "Commentateur",
        description: "Postez 25 commentaires",
        icon: "💬",
        color: "#8B5CF6",
        requirement: "Poster 25 messages",
        checkFunction: async (userId: string) => {
            const count = await prisma.message.count({
                where: { userId, deletedAt: null },
            });
            return count >= 25;
        },
    },
    {
        name: "Populaire",
        description: "Recevez 100 votes positifs",
        icon: "⭐",
        color: "#EF4444",
        requirement: "Obtenir 100 karma",
        checkFunction: async (userId: string) => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            return (user?.karma || 0) >= 100;
        },
    },
    {
        name: "Influenceur",
        description: "Recevez 500 votes positifs",
        icon: "🌟",
        color: "#F59E0B",
        requirement: "Obtenir 500 karma",
        checkFunction: async (userId: string) => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            return (user?.karma || 0) >= 500;
        },
    },
    {
        name: "Vétéran",
        description: "Membre depuis plus d'un an",
        icon: "🎖️",
        color: "#6366F1",
        requirement: "Être membre depuis 1 an",
        checkFunction: async (userId: string) => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) return false;
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            return user.createdAt <= oneYearAgo;
        },
    },
    {
        name: "Social",
        description: "Répondez à 50 commentaires",
        icon: "🤝",
        color: "#14B8A6",
        requirement: "Répondre 50 fois",
        checkFunction: async (userId: string) => {
            const count = await prisma.message.count({
                where: {
                    userId,
                    parentId: { not: null },
                    deletedAt: null,
                },
            });
            return count >= 50;
        },
    },
];

/**
 * Vérifie et attribue les badges pour un utilisateur
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
    const newBadges: string[] = [];

    // Récupérer les badges existants de l'utilisateur
    const existingBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
    });

    const existingBadgeNames = new Set(existingBadges.map((ub) => ub.badge.name));

    // Vérifier chaque badge
    for (const badgeDef of BADGES) {
        // Si l'utilisateur a déjà ce badge, passer
        if (existingBadgeNames.has(badgeDef.name)) continue;

        // Vérifier si l'utilisateur mérite ce badge
        const earned = await badgeDef.checkFunction(userId);

        if (earned) {
            // Créer le badge s'il n'existe pas
            let badge = await prisma.badge.findUnique({
                where: { name: badgeDef.name },
            });

            if (!badge) {
                badge = await prisma.badge.create({
                    data: {
                        name: badgeDef.name,
                        description: badgeDef.description,
                        icon: badgeDef.icon,
                        color: badgeDef.color,
                        requirement: badgeDef.requirement,
                    },
                });
            }

            // Attribuer le badge à l'utilisateur
            await prisma.userBadge.create({
                data: {
                    userId,
                    badgeId: badge.id,
                },
            });

            // Créer une notification
            await prisma.notification.create({
                data: {
                    userId,
                    type: "badge",
                    title: "Nouveau badge !",
                    message: `Vous avez obtenu le badge "${badgeDef.name}" : ${badgeDef.description}`,
                    link: "/profile",
                },
            });

            newBadges.push(badgeDef.name);
        }
    }

    return newBadges;
}

/**
 * Initialise tous les badges dans la base de données
 */
export async function initializeBadges(): Promise<void> {
    for (const badgeDef of BADGES) {
        const exists = await prisma.badge.findUnique({
            where: { name: badgeDef.name },
        });

        if (!exists) {
            await prisma.badge.create({
                data: {
                    name: badgeDef.name,
                    description: badgeDef.description,
                    icon: badgeDef.icon,
                    color: badgeDef.color,
                    requirement: badgeDef.requirement,
                },
            });
        }
    }
}

