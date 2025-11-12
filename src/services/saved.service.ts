async function listSaved() {
    const res = await fetch("/api/saved");
    if (!res.ok) throw new Error("Erreur chargement favoris");
    return res.json();
}

async function save(conversationId: string) {
    const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
    });
    if (!res.ok) throw new Error("Erreur sauvegarde");
    return res.json();
}

async function unsave(conversationId: string) {
    const res = await fetch(`/api/saved?conversationId=${conversationId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Erreur désauvegarde");
    return res.json();
}

export const savedService = { listSaved, save, unsave };


