import apiClient from "@/lib/apiClient"

export const listCategories = ({ page = 1, pageSize = 25, includeInactive = false } = {}) =>
    apiClient.get("/categories", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// No GET-by-id route exists — edit pages must seed from already-fetched list data.
export const createCategory = (body) => apiClient.post("/categories", body)

export const updateCategory = (categoryId, body) => apiClient.put(`/categories/${categoryId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteCategory = (categoryId) => apiClient.delete(`/categories/${categoryId}`)
