import { apiFetch } from "@/lib/api";

type EditMessageResponse = {
    message: string;
    data: {
        id: string;
        content: string;
        updatedAt: string;
    };
};

type DeleteMessageResponse = {
    message: string;
};

async function edit(messageId: string, content: string): Promise<EditMessageResponse> {
    return apiFetch<EditMessageResponse>(`/api/messages/${messageId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
}

async function remove(messageId: string): Promise<DeleteMessageResponse> {
    return apiFetch<DeleteMessageResponse>(`/api/messages/${messageId}/delete`, {
        method: "DELETE",
    });
}

export const messageService = {
    edit,
    remove,
} as const;


