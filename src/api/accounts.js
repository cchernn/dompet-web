import apiClient from "@/lib/apiClient"

export const listAccounts = ({ page = 1, pageSize = 25, includeInactive = false } = {}) =>
    apiClient.get("/accounts", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getAccount = (accountId) => apiClient.get(`/accounts/${accountId}`)

export const createAccount = (body) => apiClient.post("/accounts", body)

export const updateAccount = (accountId, body) => apiClient.put(`/accounts/${accountId}`, body)

export const deactivateAccount = (accountId) => apiClient.post(`/accounts/${accountId}/deactivate`)

export const reactivateAccount = (accountId) => apiClient.post(`/accounts/${accountId}/reactivate`)
