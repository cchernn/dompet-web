import apiClient from "@/lib/apiClient"
import type {
    Transaction, TransactionInput, TransactionPatch, TransactionSearchResult, TransactionType,
    TransactionSummary, TransactionTrend, TrendBucket,
} from "@/api/types"
import type { ListParams } from "@/api/accounts"

export const listTransactions = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Transaction[]>("/transactions", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export interface SearchTransactionsParams {
    page?: number
    pageSize?: number
    from?: string
    to?: string
    category?: string
    type?: TransactionType | ""
    source?: string
    destination?: string
    tags?: string
    budgets?: string
    source_location?: string
    destination_location?: string
}

// Denormalized search view (vw_transactions): joined account/category names
// instead of ids, tags/attachments as arrays, active transactions only (the
// view is pre-filtered — there's no includeInactive here). Supports filtering
// by date range, category (exact name match), and type — NOT by tag; tags
// are only returned per-row, not filterable server-side yet.
// `tags` and `budgets` are substring matches (LIKE %term%) against the
// view's pipe-delimited tag/budget strings — a transaction with several
// tags/budgets still matches on any one of them.
export const searchTransactions = ({
    page = 1, pageSize = 25, from, to, category, type, source, destination, tags, budgets,
    source_location, destination_location,
}: SearchTransactionsParams = {}) =>
    apiClient.get<TransactionSearchResult[]>("/transactions/search", {
        page, page_size: pageSize, from, to, category, type, source, destination, tags, budgets,
        source_location, destination_location,
    })

// Same filter contract as searchTransactions, minus pagination — the
// backend reuses transaction_search's WHERE-building for these.
export interface TransactionInsightsParams {
    from?: string
    to?: string
    category?: string
    type?: TransactionType | ""
    source?: string
    destination?: string
    tags?: string
    budgets?: string
}

export const getTransactionSummary = ({ from, to, category, type, source, destination, tags, budgets }: TransactionInsightsParams = {}) =>
    apiClient.get<TransactionSummary>("/transactions/summary", { from, to, category, type, source, destination, tags, budgets })

export const getTransactionTrend = (
    bucket: TrendBucket,
    { from, to, category, type, source, destination, tags, budgets }: TransactionInsightsParams = {}
) =>
    apiClient.get<TransactionTrend>("/transactions/trend", { bucket, from, to, category, type, source, destination, tags, budgets })

export const getTransaction = (transactionId: string) => apiClient.get<Transaction>(`/transactions/${transactionId}`)

export const createTransaction = (body: TransactionInput) => apiClient.post<Transaction>("/transactions", body)

export const updateTransaction = (transactionId: string, body: TransactionPatch) =>
    apiClient.put<Transaction>(`/transactions/${transactionId}`, body)

export const deactivateTransaction = (transactionId: string) =>
    apiClient.post<Transaction>(`/transactions/${transactionId}/deactivate`)

export const reactivateTransaction = (transactionId: string) =>
    apiClient.post<Transaction>(`/transactions/${transactionId}/reactivate`)

// No endpoint exists to list a transaction's operation history, so there is
// no way to enumerate valid operationId choices for this from the UI yet.
export const rollbackTransaction = (transactionId: string, operationId: string) =>
    apiClient.post<Transaction>(`/transactions/${transactionId}/rollback`, { operation_id: operationId })
