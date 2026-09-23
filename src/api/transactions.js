import apiClient from "@/lib/apiClient"

export const listTransactions = ({ page = 1, pageSize = 25, includeInactive = false } = {}) =>
    apiClient.get("/transactions", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getTransaction = (transactionId) => apiClient.get(`/transactions/${transactionId}`)

export const createTransaction = (body) => apiClient.post("/transactions", body)

export const updateTransaction = (transactionId, body) => apiClient.put(`/transactions/${transactionId}`, body)

export const deactivateTransaction = (transactionId) => apiClient.post(`/transactions/${transactionId}/deactivate`)

export const reactivateTransaction = (transactionId) => apiClient.post(`/transactions/${transactionId}/reactivate`)

// No endpoint exists to list a transaction's operation history, so there is
// no way to enumerate valid operationId choices for this from the UI yet.
export const rollbackTransaction = (transactionId, operationId) =>
    apiClient.post(`/transactions/${transactionId}/rollback`, { operation_id: operationId })
