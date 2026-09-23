import apiClient from "@/lib/apiClient"

export const listBudgetMembers = (budgetId, { page = 1, pageSize = 25 } = {}) =>
    apiClient.get(`/budgets/${budgetId}/members`, { page, page_size: pageSize })

// No user-search endpoint exists — members are added by raw Cognito user_id.
export const addBudgetMember = (budgetId, userId) =>
    apiClient.post(`/budgets/${budgetId}/members`, { user_id: userId })

export const removeBudgetMember = (budgetId, memberUserId) =>
    apiClient.delete(`/budgets/${budgetId}/members/${memberUserId}`)
