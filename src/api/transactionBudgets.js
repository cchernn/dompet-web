import apiClient from "@/lib/apiClient"

// Returns Budget objects (not raw link rows).
export const listTransactionBudgets = (transactionId, { page = 1, pageSize = 25 } = {}) =>
    apiClient.get(`/transactions/${transactionId}/budgets`, { page, page_size: pageSize })

export const linkBudget = (transactionId, budgetId) =>
    apiClient.post(`/transactions/${transactionId}/budgets`, { budget_id: budgetId })

export const unlinkBudget = (transactionId, budgetId) =>
    apiClient.delete(`/transactions/${transactionId}/budgets/${budgetId}`)
