import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { Tag, TagInput, TagPatch, TagSearchResult } from "@/api/types"
import type { ListParams, SearchParams } from "@/api/accounts"

export const listTags = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Tag[]>("/tags", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// Filter-dropdown source: up to 1000 rows in one call, ordered by
// usage_count desc then name asc (most-used tags sort first).
export const searchTags = ({ page = 1, pageSize = 25, q }: SearchParams = {}) =>
    apiClient.get<TagSearchResult[]>("/tags/search", { page, page_size: pageSize, q })

// No GET-by-id route exists — edit pages must seed from already-fetched list data.
export const createTag = (body: TagInput) =>
    apiClient.post<Tag>("/tags", body).then((result) => { invalidateResource("tags"); return result })

export const updateTag = (tagId: string, body: TagPatch) =>
    apiClient.put<Tag>(`/tags/${tagId}`, body).then((result) => { invalidateResource("tags"); return result })

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteTag = (tagId: string) =>
    apiClient.delete<Tag>(`/tags/${tagId}`).then((result) => { invalidateResource("tags"); return result })
