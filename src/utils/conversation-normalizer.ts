import {
    ConversationMessageSummary,
    ConversationUserSummary,
    ConversationWithExtend,
} from "@/types/conversation.type";

export type ConversationMessageDto = Omit<
    ConversationMessageSummary,
    "createdAt" | "updatedAt"
> & {
    createdAt: string;
    updatedAt?: string | null;
    replies?: ConversationMessageDto[];
    user?: ConversationUserSummary;
};

export type ConversationDto = Omit<
    ConversationWithExtend,
    "createdAt" | "updatedAt" | "deletedAt" | "archivedAt" | "messages"
> & {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    archivedAt?: string | null;
    messages?: ConversationMessageDto[];
    user?: ConversationUserSummary;
};

export function normalizeMessage(message: ConversationMessageDto): ConversationMessageSummary {
    return {
        ...message,
        createdAt: new Date(message.createdAt),
        updatedAt: message.updatedAt ? new Date(message.updatedAt) : undefined,
        replies: message.replies?.map(normalizeMessage) ?? [],
    };
}

export function normalizeConversation(dto: ConversationDto): ConversationWithExtend {
    return {
        ...dto,
        content: dto.content ?? null,
        imageUrl: dto.imageUrl ?? null,
        votes: dto.votes ?? 0,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
        deletedAt: dto.deletedAt ? new Date(dto.deletedAt) : null,
        archivedAt: dto.archivedAt ? new Date(dto.archivedAt) : null,
        messages: (dto.messages ?? []).map(normalizeMessage),
    };
}

