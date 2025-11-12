import { SavedConversationItem } from "@/types/saved.type";
import { ConversationDto, normalizeConversation } from "@/utils/conversation-normalizer";

interface SavedConversationDto {
    conversation: ConversationDto;
}

async function listSaved(): Promise<SavedConversationItem[]> {
    const res = await fetch("/api/saved");
    if (!res.ok) throw new Error("Erreur chargement favoris");
    const data: SavedConversationDto[] = await res.json();
    return data.map((item) => ({
        conversation: normalizeConversation(item.conversation),
    }));
}

async function save(conversationId: string): Promise<{ ok: boolean }> {
    const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
    });
    if (!res.ok) throw new Error("Erreur sauvegarde");
    return res.json();
}

async function unsave(conversationId: string): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/saved?conversationId=${conversationId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Erreur désauvegarde");
    return res.json();
}

export const savedService = { listSaved, save, unsave } as const;
