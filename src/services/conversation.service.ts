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
import { apiFetch } from "@/lib/api";

type ConversationListDto = {
    conversations: ConversationDto[];
    pagination: Pagination;
};

async function fetchConversations(page?: number, limit?: number): Promise<ConversationList> {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    const data = await apiFetch<ConversationListDto>(`/api/conversations${qs ? `?${qs}` : ""}`);
    return {
        conversations: data.conversations.map(normalizeConversation),
        pagination: data.pagination,
    };
}

async function createConversation(title: string, content: string, images: string[] = []): Promise<ConversationWithExtend> {
    const data = await apiFetch<ConversationDto>("/api/conversations/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, images }),
    });

    return normalizeConversation(data);
}

async function getConversation(id: string): Promise<ConversationWithExtend> {
    const data = await apiFetch<ConversationDto>(`/api/conversations/${id}`);
    return normalizeConversation(data);
}

async function addMessage(conversationId: string, content: string, parentId?: string): Promise<ConversationMessageSummary> {
    const data = await apiFetch<ConversationMessageDto>(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, parentId }),
    });
    return normalizeMessage(data);
}

async function deleteConversation(id: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/api/conversations/${id}/delete`, {
        method: "DELETE",
    });
}

export const conversationService = {
    fetchConversations,
    createConversation,
    getConversation,
    addMessage,
    deleteConversation,
};
