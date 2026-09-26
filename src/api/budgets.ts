import apiClient from "@/lib/apiClient"
import type { Budget, BudgetInput, BudgetPatch, Transaction } from "@/api/types"
import type { ListParams } from "@/api/accounts"

export const listBudgets = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Budget[]>("/budgets", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getBudget = (budgetId: string) => apiClient.get<Budget>(`/budgets/${budgetId}`)

export const createBudget = (body: BudgetInput) => apiClient.post<Budget>("/budgets", body)

export const updateBudget = (budgetId: string, body: BudgetPatch) => apiClient.put<Budget>(`/budgets/${budgetId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteBudget = (budgetId: string) => apiClient.delete<Budget>(`/budgets/${budgetId}`)

// Read-only sub-list. Returns the plain Transaction model (raw account/
// category ids, `datetime` not `date`) — NOT the denormalized search-view
// shape (TransactionSearchResult) that /transactions/search returns. As of
// this backend version it also does NOT filter out deactivated transactions
// (a known backend gap) — don't filter client-side.
export const listBudgetTransactions = (budgetId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Transaction[]>(`/budgets/${budgetId}/transactions`, { page, page_size: pageSize })
