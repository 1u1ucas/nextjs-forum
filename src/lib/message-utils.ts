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

export type MessageTreeNode<T> = Omit<T, "replies"> & {
    replies: Array<MessageTreeNode<T>>;
};

/**
 * Organise une liste plate de messages en arborescence
 */
export function buildMessageTree<
    T extends { id: string; parentId?: string | null; createdAt: Date | string; replies?: unknown }
>(messages: T[]): Array<MessageTreeNode<T>> {
    const messageMap = new Map<string, MessageTreeNode<T>>();
    const rootMessages: Array<MessageTreeNode<T>> = [];

    messages.forEach((message) => {
        const { replies: _ignored, ...rest } = message as T & { replies?: unknown };
        messageMap.set(message.id, {
            ...(rest as Omit<T, "replies">),
            replies: [],
        });
    });

    messages.forEach((message) => {
        const messageNode = messageMap.get(message.id)!;

        if (message.parentId) {
            const parent = messageMap.get(message.parentId);
            if (parent) {
                parent.replies.push(messageNode);
                return;
            }
        }

        rootMessages.push(messageNode);
    });

    const sortAsc = (a: { createdAt: Date | string }, b: { createdAt: Date | string }) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

    const sortDesc = (a: { createdAt: Date | string }, b: { createdAt: Date | string }) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const sortRepliesRecursively = (nodes: Array<MessageTreeNode<T>>) => {
        nodes.forEach((node) => {
            if (node.replies.length > 0) {
                node.replies.sort(sortAsc);
                sortRepliesRecursively(node.replies);
            }
        });
    };

    rootMessages.sort(sortDesc);
    sortRepliesRecursively(rootMessages);

    return rootMessages;
}


