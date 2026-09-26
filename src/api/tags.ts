import apiClient from "@/lib/apiClient"
import type { Tag, TagInput, TagPatch } from "@/api/types"
import type { ListParams } from "@/api/accounts"

export const listTags = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Tag[]>("/tags", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// No GET-by-id route exists — edit pages must seed from already-fetched list data.
export const createTag = (body: TagInput) => apiClient.post<Tag>("/tags", body)

export const updateTag = (tagId: string, body: TagPatch) => apiClient.put<Tag>(`/tags/${tagId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteTag = (tagId: string) => apiClient.delete<Tag>(`/tags/${tagId}`)
