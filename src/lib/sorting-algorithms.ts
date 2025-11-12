import { ConversationWithExtend } from "@/types/conversation.type";

const SCORE_DECAY_OFFSET = 2;
const SCORE_DECAY_EXPONENT = 1.5;
const HOURS_IN_MS = 1000 * 60 * 60;

/**
 * Algorithme Hot inspiré de Reddit
 * Prend en compte les votes et le temps
 */
export function calculateHotScore(
    conversation: ConversationWithExtend,
    referenceTimestamp: number = Date.now()
): number {
    const votes = conversation.votes ?? 0;
    const created = new Date(conversation.createdAt).getTime();
    const ageInHours = Math.max((referenceTimestamp - created) / HOURS_IN_MS, 0);

    // Score basé sur les votes avec décroissance temporelle
    return votes / Math.pow(ageInHours + SCORE_DECAY_OFFSET, SCORE_DECAY_EXPONENT);
}

/**
 * Tri controversé : ratio entre upvotes et downvotes
 * Plus le ratio est proche de 1:1, plus c'est controversé
 */
export function calculateControversialScore(conversation: ConversationWithExtend): number {
    const votes = conversation.votes || 0;
    const messageCount = conversation.messages?.length || 0;
    
    // Plus il y a de messages avec peu de votes = controversé
    // Plus il y a de votes (positifs ou négatifs) avec beaucoup de messages = controversé
    if (messageCount === 0) return 0;
    
    const controversy = messageCount / (Math.abs(votes) + 1);
    return controversy;
}

/**
 * Filtre par période de temps
 */
export function filterByTimePeriod(
    conversations: ConversationWithExtend[],
    period: "day" | "week" | "month" | "year" | "all"
): ConversationWithExtend[] {
    if (period === "all") return conversations;
    
    const now = new Date();
    const periodInMs = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000,
    };
    
    const cutoff = now.getTime() - periodInMs[period];
    
    return conversations.filter((conv) => {
        const created = new Date(conv.createdAt).getTime();
        return created >= cutoff;
    });
}

/**
 * Tri des conversations selon différents algorithmes
 */
export function sortConversations(
    conversations: ConversationWithExtend[],
    sortBy: "hot" | "top" | "new" | "controversial",
    period?: "day" | "week" | "month" | "year" | "all"
): ConversationWithExtend[] {
    let filtered = [...conversations];
    
    // Filtrer par période pour "top"
    if (sortBy === "top" && period) {
        filtered = filterByTimePeriod(filtered, period);
    }
    
    switch (sortBy) {
        case "hot": {
            const referenceTimestamp = Date.now();
            return filtered.sort(
                (a, b) =>
                    calculateHotScore(b, referenceTimestamp) - calculateHotScore(a, referenceTimestamp)
            );
        }
        
        case "top":
            return filtered.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        
        case "new":
            return filtered.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        
        case "controversial":
            return filtered.sort((a, b) => 
                calculateControversialScore(b) - calculateControversialScore(a)
            );
        
        default:
            return filtered;
    }
}

