import {
    ConversationList,
    ConversationMessageSummary,
    ConversationWithExtend,
} from "@/types/conversation.type";
import { Pagination } from "@/types/pagination.type";
import {
    ConversationDto,
    ConversationMessageDto,
    normalizeConversation,
    normalizeMessage,
} from "@/utils/conversation-normalizer";

type ConversationListDto = {
    conversations: ConversationDto[];
    pagination: Pagination;
};

async function fetchConversations(page?: number, limit?: number): Promise<ConversationList> {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    const response = await fetch(`/api/conversations${qs ? `?${qs}` : ""}`);
    if (!response.ok) {
        throw new Error("Failed to fetch conversations");
    }
    const data = (await response.json()) as ConversationListDto;
    return {
        conversations: data.conversations.map(normalizeConversation),
        pagination: data.pagination,
    };
}

async function createConversation(title: string, content: string, images: string[] = []): Promise<ConversationWithExtend> {
    const response = await fetch("/api/conversations/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, images }),
    });

    if (!response.ok) {
        throw new Error("Erreur lors de la création");
    }

    const data = (await response.json()) as ConversationDto;
    return normalizeConversation(data);
}

async function getConversation(id: string): Promise<ConversationWithExtend> {
    const response = await fetch(`/api/conversations/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch conversation");
    }
    const data = (await response.json()) as ConversationDto;
    return normalizeConversation(data);
}

async function addMessage(conversationId: string, content: string, parentId?: string): Promise<ConversationMessageSummary> {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, parentId }),
    });

    if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du message");
    }

    const data = (await response.json()) as ConversationMessageDto;
    return normalizeMessage(data);
}

async function deleteConversation(id: string): Promise<{ message: string }> {
    const response = await fetch(`/api/conversations/${id}/delete`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
    }

    return response.json() as Promise<{ message: string }>;
}

export const conversationService = {
    fetchConversations,
    createConversation,
    getConversation,
    addMessage,
    deleteConversation,
};
