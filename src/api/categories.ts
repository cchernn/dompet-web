import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { Category, CategoryInput, CategoryPatch, CategorySearchResult } from "@/api/types"
import type { ListParams, SearchParams } from "@/api/accounts"

export const listCategories = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Category[]>("/categories", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// Filter-dropdown source: up to 1000 rows in one call, ordered by
// usage_count desc then name asc (most-used categories sort first).
// user_id is an exact match, not an enum: pass the current user's id for
// "mine", or the literal string "null" for global/shared rows.
export const searchCategories = ({ page = 1, pageSize = 25, q, owner }: SearchParams & { owner?: string } = {}) =>
    apiClient.get<CategorySearchResult[]>("/categories/search", { page, page_size: pageSize, q, user_id: owner })

// No GET-by-id route exists — edit pages must seed from already-fetched list data.
export const createCategory = (body: CategoryInput) =>
    apiClient.post<Category>("/categories", body).then((result) => { invalidateResource("categories"); return result })

export const updateCategory = (categoryId: string, body: CategoryPatch) =>
    apiClient.put<Category>(`/categories/${categoryId}`, body).then((result) => { invalidateResource("categories"); return result })

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteCategory = (categoryId: string) =>
    apiClient.delete<Category>(`/categories/${categoryId}`).then((result) => { invalidateResource("categories"); return result })
