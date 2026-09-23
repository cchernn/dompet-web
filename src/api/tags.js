import apiClient from "@/lib/apiClient"

export const listTags = ({ page = 1, pageSize = 25, includeInactive = false } = {}) =>
    apiClient.get("/tags", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// No GET-by-id route exists — edit pages must seed from already-fetched list data.
export const createTag = (body) => apiClient.post("/tags", body)

export const updateTag = (tagId, body) => apiClient.put(`/tags/${tagId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteTag = (tagId) => apiClient.delete(`/tags/${tagId}`)
