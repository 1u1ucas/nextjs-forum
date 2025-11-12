import { ConversationWithExtend } from "@/types/conversation.type";

/**
 * Algorithme Hot inspiré de Reddit
 * Prend en compte les votes et le temps
 */
export function calculateHotScore(conversation: ConversationWithExtend): number {
    const votes = conversation.votes || 0;
    const now = new Date().getTime();
    const created = new Date(conversation.createdAt).getTime();
    const ageInHours = (now - created) / (1000 * 60 * 60);
    
    // Score basé sur les votes avec décroissance temporelle
    const score = votes / Math.pow(ageInHours + 2, 1.5);
    return score;
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
        case "hot":
            return filtered.sort((a, b) => calculateHotScore(b) - calculateHotScore(a));
        
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

