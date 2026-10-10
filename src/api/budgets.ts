import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { Budget, BudgetInput, BudgetPatch, BudgetSearchResult, BudgetSummary, BudgetTrend, Transaction, TrendBucket } from "@/api/types"
import type { ListParams, SearchParams } from "@/api/accounts"

export const listBudgets = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Budget[]>("/budgets", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// Filter-dropdown source: up to 1000 rows in one call, ordered by
// transaction_count desc then name asc (most-used budgets sort first).
export const searchBudgets = ({ page = 1, pageSize = 25, q }: SearchParams = {}) =>
    apiClient.get<BudgetSearchResult[]>("/budgets/search", { page, page_size: pageSize, q })

export const getBudgetSummary = (q?: string) => apiClient.get<BudgetSummary>("/budgets/summary", { q })

export const getBudgetTrend = (bucket: TrendBucket, { from, to, q }: { from?: string; to?: string; q?: string } = {}) =>
    apiClient.get<BudgetTrend>("/budgets/trend", { bucket, from, to, q })

export const getBudget = (budgetId: string) => apiClient.get<Budget>(`/budgets/${budgetId}`)

export const createBudget = (body: BudgetInput) =>
    apiClient.post<Budget>("/budgets", body).then((result) => { invalidateResource("budgets"); return result })

export const updateBudget = (budgetId: string, body: BudgetPatch) =>
    apiClient.put<Budget>(`/budgets/${budgetId}`, body).then((result) => { invalidateResource("budgets"); return result })

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteBudget = (budgetId: string) =>
    apiClient.delete<Budget>(`/budgets/${budgetId}`).then((result) => { invalidateResource("budgets"); return result })

// Read-only sub-list. Returns the plain Transaction model (raw account/
// category ids, `datetime` not `date`) — NOT the denormalized search-view
// shape (TransactionSearchResult) that /transactions/search returns. As of
// this backend version it also does NOT filter out deactivated transactions
// (a known backend gap) — don't filter client-side.
export const listBudgetTransactions = (budgetId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Transaction[]>(`/budgets/${budgetId}/transactions`, { page, page_size: pageSize })
