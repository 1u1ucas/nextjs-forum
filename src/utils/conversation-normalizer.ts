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
    const images = (() => {
        if (!dto.imageUrl) return [];

        const value = dto.imageUrl;

        try {
            const parsed = typeof value === "string" ? JSON.parse(value) : value;
            if (Array.isArray(parsed)) {
                return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
            }
        } catch {
            // noop
        }

        return typeof value === "string" && value.length > 0 ? [value] : [];
    })();

    return {
        ...dto,
        content: dto.content ?? null,
        imageUrl: dto.imageUrl ?? null,
        images,
        votes: dto.votes ?? 0,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
        deletedAt: dto.deletedAt ? new Date(dto.deletedAt) : null,
        archivedAt: dto.archivedAt ? new Date(dto.archivedAt) : null,
        messages: (dto.messages ?? []).map(normalizeMessage),
    };
}

