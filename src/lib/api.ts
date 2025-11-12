export class ApiError extends Error {
    status: number;
    payload?: unknown;

    constructor(message: string, status: number, payload?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;
    }
}

const isJsonResponse = (contentType: string | null) =>
    Boolean(contentType && contentType.toLowerCase().includes("application/json"));

/**
 * Wrapper autour de fetch avec gestion d'erreurs centralisée
 */
export async function apiFetch<TResponse>(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<TResponse> {
    const response = await fetch(input, init);
    const contentType = response.headers.get("content-type");
    let payload: unknown = null;

    if (isJsonResponse(contentType)) {
        try {
            payload = await response.json();
        } catch {
            payload = null;
        }
    } else {
        try {
            const text = await response.text();
            payload = text || null;
        } catch {
            payload = null;
        }
    }

    if (!response.ok) {
        const message =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof (payload as Record<string, unknown>).error === "string"
                ? (payload as Record<string, string>).error
                : `Requête échouée (${response.status})`;

        throw new ApiError(message, response.status, payload);
    }

    return payload as TResponse;
}


