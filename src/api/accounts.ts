import apiClient from "@/lib/apiClient"
import type { Account, AccountInput, AccountPatch, AccountSearchResult } from "@/api/types"

export interface ListParams {
    page?: number
    pageSize?: number
    includeInactive?: boolean
}

// Shared by accounts/categories/tags/budgets' */search endpoints — page_size
// may go up to 1000 here (vs. 100 on the plain list endpoints above), and
// there's no includeInactive (the backing view is pre-filtered to active
// rows only).
export interface SearchParams {
    page?: number
    pageSize?: number
    q?: string
}

export const listAccounts = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Account[]>("/accounts", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// Filter-dropdown source: up to 1000 rows in one call, ordered by
// usage_count desc then name asc (most-used accounts sort first).
export const searchAccounts = ({ page = 1, pageSize = 25, q }: SearchParams = {}) =>
    apiClient.get<AccountSearchResult[]>("/accounts/search", { page, page_size: pageSize, q })

export const getAccount = (accountId: string) => apiClient.get<Account>(`/accounts/${accountId}`)

export const createAccount = (body: AccountInput) => apiClient.post<Account>("/accounts", body)

export const updateAccount = (accountId: string, body: AccountPatch) =>
    apiClient.put<Account>(`/accounts/${accountId}`, body)

export const deactivateAccount = (accountId: string) => apiClient.post<Account>(`/accounts/${accountId}/deactivate`)

export const reactivateAccount = (accountId: string) => apiClient.post<Account>(`/accounts/${accountId}/reactivate`)
