import apiClient from "@/lib/apiClient"
import type { Account, AccountInput, AccountPatch } from "@/api/types"

export interface ListParams {
    page?: number
    pageSize?: number
    includeInactive?: boolean
}

export const listAccounts = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Account[]>("/accounts", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getAccount = (accountId: string) => apiClient.get<Account>(`/accounts/${accountId}`)

export const createAccount = (body: AccountInput) => apiClient.post<Account>("/accounts", body)

export const updateAccount = (accountId: string, body: AccountPatch) =>
    apiClient.put<Account>(`/accounts/${accountId}`, body)

export const deactivateAccount = (accountId: string) => apiClient.post<Account>(`/accounts/${accountId}/deactivate`)

export const reactivateAccount = (accountId: string) => apiClient.post<Account>(`/accounts/${accountId}/reactivate`)
