import apiClient from "@/lib/apiClient"

export const listTransactions = ({ page = 1, pageSize = 25, includeInactive = false } = {}) =>
    apiClient.get("/transactions", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// Denormalized search view (vw_transactions): joined account/category names
// instead of ids, tags/attachments as arrays, active transactions only (the
// view is pre-filtered — there's no includeInactive here). Supports filtering
// by date range, category (exact name match), and type — NOT by tag; tags
// are only returned per-row, not filterable server-side yet.
// `tags` and `budgets` are substring matches (LIKE %term%) against the
// view's pipe-delimited tag/budget strings — a transaction with several
// tags/budgets still matches on any one of them.
export const searchTransactions = ({ page = 1, pageSize = 25, from, to, category, type, source, destination, tags, budgets } = {}) =>
    apiClient.get("/transactions/search", { page, page_size: pageSize, from, to, category, type, source, destination, tags, budgets })

export const getTransaction = (transactionId) => apiClient.get(`/transactions/${transactionId}`)

export const createTransaction = (body) => apiClient.post("/transactions", body)

export const updateTransaction = (transactionId, body) => apiClient.put(`/transactions/${transactionId}`, body)

export const deactivateTransaction = (transactionId) => apiClient.post(`/transactions/${transactionId}/deactivate`)

export const reactivateTransaction = (transactionId) => apiClient.post(`/transactions/${transactionId}/reactivate`)

// No endpoint exists to list a transaction's operation history, so there is
// no way to enumerate valid operationId choices for this from the UI yet.
export const rollbackTransaction = (transactionId, operationId) =>
    apiClient.post(`/transactions/${transactionId}/rollback`, { operation_id: operationId })
