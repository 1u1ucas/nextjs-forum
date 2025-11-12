async function fetchConversations(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    const response = await fetch(`/api/conversations${qs ? `?${qs}` : ""}`);
    if (!response.ok) {
        throw new Error("Failed to fetch conversations");
    }
    return response.json();
}

async function createConversation(title: string, content: string, images: string[] = []) {
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

    return response.json();
}

async function getConversation(id: string) {
    const response = await fetch(`/api/conversations/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch conversation");
    }
    return response.json();
}

async function addMessage(conversationId: string, content: string, parentId?: string) {
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

    return response.json();
}

async function deleteConversation(id: string) {
    const response = await fetch(`/api/conversations/${id}/delete`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
    }

    return response.json();
}

export const conversationService = {
    fetchConversations,
    createConversation,
    getConversation,
    addMessage,
    deleteConversation,
};
