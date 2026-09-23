import { fetchAuthSession } from "aws-amplify/auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
    constructor(message) {
        super(message || "Request failed")
        this.name = "ApiError"
    }
}

async function authHeaders() {
    const session = await fetchAuthSession()
    const token = session.tokens?.accessToken?.toString()
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    }
}

function buildUrl(endpoint, params) {
    let url = `${API_BASE_URL}${endpoint}`
    if (params) {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
        )
        const queryString = new URLSearchParams(filtered).toString()
        if (queryString) url += `?${queryString}`
    }
    return url
}

async function request(method, endpoint, { params, body } = {}) {
    const url = buildUrl(endpoint, params)
    const options = {
        method,
        headers: await authHeaders(),
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }

    let response
    try {
        response = await fetch(url, options)
    } catch {
        throw new ApiError("Network error — please check your connection and try again.")
    }

    let envelope
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
    get: (endpoint, params) => request("GET", endpoint, { params }),
    post: (endpoint, body, params) => request("POST", endpoint, { body: body ?? {}, params }),
    put: (endpoint, body) => request("PUT", endpoint, { body: body ?? {} }),
    delete: (endpoint) => request("DELETE", endpoint),
    // Presigned S3 uploads must NOT carry the Cognito Authorization header.
    uploadToPresignedUrl: async (uploadUrl, file, contentType) => {
        let response
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
