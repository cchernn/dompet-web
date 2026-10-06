import apiClient from "@/lib/apiClient"
import type { Budget, TransactionBudgetLink } from "@/api/types"

// Returns Budget objects (not raw link rows).
export const listTransactionBudgets = (transactionId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Budget[]>(`/transactions/${transactionId}/budgets`, { page, page_size: pageSize })

export const linkBudget = (transactionId: string, budgetId: string) =>
    apiClient.post<TransactionBudgetLink>(`/transactions/${transactionId}/budgets`, { budget_id: budgetId })

export const unlinkBudget = (transactionId: string, budgetId: string) =>
    apiClient.delete<{ unlinked: boolean }>(`/transactions/${transactionId}/budgets/${budgetId}`)
