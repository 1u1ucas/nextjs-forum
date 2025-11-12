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

