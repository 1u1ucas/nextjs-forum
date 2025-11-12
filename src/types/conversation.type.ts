import { Pagination } from "@/types/pagination.type";

export interface ConversationUserSummary {
    id: string;
    name: string | null;
    email?: string | null;
    image: string | null;
}

export interface ConversationMessageSummary {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
    votes?: number;
    parentId?: string | null;
    conversationId?: string | null;
    userId?: string | null;
    user?: ConversationUserSummary;
    replies?: ConversationMessageSummary[];
}

export interface ConversationWithExtend {
    id: string;
    title: string | null;
    content?: string | null;
    votes?: number;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    archivedAt?: Date | null;
    userId?: string | null;
    categoryId?: string | null;
    messages: ConversationMessageSummary[];
    user?: ConversationUserSummary;
}

export interface ConversationList {
    conversations: ConversationWithExtend[];
    pagination: Pagination;
}