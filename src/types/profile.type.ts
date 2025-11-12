export interface ProfileStats {
    posts: number;
    comments: number;
    badges: number;
    karma: number;
}

export interface ProfileResponse {
    user: {
        id: string;
        name: string | null;
        bio: string | null;
        image: string | null;
        karma: number;
        stats: ProfileStats;
    };
}

export interface PublicProfileResponse {
    user: {
        id: string;
        name: string | null;
        bio: string | null;
        image: string | null;
        karma: number;
        role: "USER" | "MODERATOR" | "ADMIN";
        createdAt: string;
        stats: {
            conversations: number;
            messages: number;
        };
    };
    conversations: Array<{
        id: string;
        title: string | null;
        createdAt: string;
        votes: number;
        messagesCount: number;
    }>;
    messages: Array<{
        id: string;
        content: string;
        createdAt: string;
        conversation: {
            id: string;
            title: string | null;
        } | null;
    }>;
    badges: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        earnedAt: string;
    }>;
}

export interface ProfilePatchResponse {
    message: string;
    user: {
        id: string;
        name: string | null;
        bio: string | null;
    };
}

export interface PasswordPatchResponse {
    message?: string;
}

