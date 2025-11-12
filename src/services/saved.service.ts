import { SavedConversationItem } from "@/types/saved.type";
import { ConversationDto, normalizeConversation } from "@/utils/conversation-normalizer";
import { ApiError, apiFetch } from "@/lib/api";

interface SavedConversationDto {
    conversation: ConversationDto;
}

async function listSaved(): Promise<SavedConversationItem[]> {
    const data = await apiFetch<SavedConversationDto[]>("/api/saved");
    return data.map((item) => ({
        conversation: normalizeConversation(item.conversation),
    }));
}

async function isSaved(conversationId: string): Promise<boolean> {
    try {
        const data = await apiFetch<{ saved: boolean }>(`/api/saved?conversationId=${conversationId}`);
        return data.saved;
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return false;
        }
        throw error;
    }
}

async function save(conversationId: string): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
    });
}

async function unsave(conversationId: string): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>(`/api/saved?conversationId=${conversationId}`, {
        method: "DELETE",
    });
}

export const savedService = { listSaved, isSaved, save, unsave } as const;
