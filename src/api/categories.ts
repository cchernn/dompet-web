import apiClient from "@/lib/apiClient"
import type { Category, CategoryInput, CategoryPatch } from "@/api/types"
import type { ListParams } from "@/api/accounts"

export const listCategories = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Category[]>("/categories", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// No GET-by-id route exists — edit pages must seed from already-fetched list data.
export const createCategory = (body: CategoryInput) => apiClient.post<Category>("/categories", body)

export const updateCategory = (categoryId: string, body: CategoryPatch) =>
    apiClient.put<Category>(`/categories/${categoryId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteCategory = (categoryId: string) => apiClient.delete<Category>(`/categories/${categoryId}`)
