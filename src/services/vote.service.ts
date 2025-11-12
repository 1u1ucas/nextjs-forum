async function vote(conversationId: string, type: "up" | "down") {
    const response = await fetch(`/api/conversations/${conversationId}/vote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
    });

    if (!response.ok) {
        throw new Error("Erreur lors du vote");
    }

    return response.json();
}

export const voteService = {
    vote,
};

