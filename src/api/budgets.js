import apiClient from "@/lib/apiClient"

export const listBudgets = ({ page = 1, pageSize = 25, includeInactive = false } = {}) =>
    apiClient.get("/budgets", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getBudget = (budgetId) => apiClient.get(`/budgets/${budgetId}`)

export const createBudget = (body) => apiClient.post("/budgets", body)

export const updateBudget = (budgetId, body) => apiClient.put(`/budgets/${budgetId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteBudget = (budgetId) => apiClient.delete(`/budgets/${budgetId}`)

// Read-only sub-list. As of this backend version it does NOT filter out
// deactivated transactions (a known backend gap) — don't filter client-side.
export const listBudgetTransactions = (budgetId, { page = 1, pageSize = 25 } = {}) =>
    apiClient.get(`/budgets/${budgetId}/transactions`, { page, page_size: pageSize })
