export interface MessageWithReplies {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    parentId: string | null;
    votes: number;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    replies: MessageWithReplies[];
}

/**
 * Organise une liste plate de messages en arborescence
 */
export function buildMessageTree(messages: any[]): MessageWithReplies[] {
    const messageMap = new Map<string, MessageWithReplies>();
    const rootMessages: MessageWithReplies[] = [];

    // Créer une map de tous les messages
    messages.forEach((message) => {
        messageMap.set(message.id, {
            ...message,
            replies: [],
        });
    });

    // Construire l'arborescence
    messages.forEach((message) => {
        const messageNode = messageMap.get(message.id)!;
        
        if (message.parentId) {
            // Ce message est une réponse
            const parent = messageMap.get(message.parentId);
            if (parent) {
                parent.replies.push(messageNode);
                // Trier les réponses par date
                parent.replies.sort((a, b) => 
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
            } else {
                // Le parent n'existe pas (peut-être supprimé), on le met à la racine
                rootMessages.push(messageNode);
            }
        } else {
            // Message racine
            rootMessages.push(messageNode);
        }
    });

    // Trier les messages racines par date (plus récent en premier)
    return rootMessages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

