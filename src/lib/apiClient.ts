import { fetchAuthSession } from "aws-amplify/auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
    constructor(message?: string) {
        super(message || "Request failed")
        this.name = "ApiError"
    }
}

export interface PaginationMetadata {
    page?: number
    page_size?: number
    total_count?: number
    total_pages?: number
}

export interface ApiResult<T> {
    data: T
    metadata: PaginationMetadata
}

interface Envelope<T> {
    success: boolean
    data: T
    metadata?: PaginationMetadata
    message?: string
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>

async function authHeaders(): Promise<Record<string, string>> {
    const session = await fetchAuthSession()
    const token = session.tokens?.accessToken?.toString()
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    }
}

function buildUrl(endpoint: string, params?: QueryParams): string {
    let url = `${API_BASE_URL}${endpoint}`
    if (params) {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
        ) as Record<string, string>
        const queryString = new URLSearchParams(filtered).toString()
        if (queryString) url += `?${queryString}`
    }
    return url
}

async function request<T>(
    method: string,
    endpoint: string,
    { params, body }: { params?: QueryParams; body?: unknown } = {}
): Promise<ApiResult<T>> {
    const url = buildUrl(endpoint, params)
    const options: RequestInit = {
        method,
        headers: await authHeaders(),
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }

    let response: Response
    try {
        response = await fetch(url, options)
    } catch {
        throw new ApiError("Network error — please check your connection and try again.")
    }

    let envelope: Envelope<T>
    try {
        envelope = await response.json()
    } catch {
        throw new ApiError(`Unexpected response from server (status ${response.status}).`)
    }

    if (!envelope.success) {
        throw new ApiError(envelope.message || "Request failed.")
    }

    return { data: envelope.data, metadata: envelope.metadata || {} }
}

const apiClient = {
    get: <T>(endpoint: string, params?: QueryParams) => request<T>("GET", endpoint, { params }),
    post: <T>(endpoint: string, body?: unknown, params?: QueryParams) =>
        request<T>("POST", endpoint, { body: body ?? {}, params }),
    put: <T>(endpoint: string, body?: unknown) => request<T>("PUT", endpoint, { body: body ?? {} }),
    delete: <T>(endpoint: string) => request<T>("DELETE", endpoint),
    // Presigned S3 uploads must NOT carry the Cognito Authorization header.
    uploadToPresignedUrl: async (uploadUrl: string, file: File, contentType: string): Promise<void> => {
        let response: Response
        try {
            response = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": contentType },
            })
        } catch {
            throw new ApiError("Network error while uploading the file — please try again.")
        }
        if (!response.ok) {
            throw new ApiError(`File upload failed (status ${response.status}).`)
        }
    },
}

export default apiClient
