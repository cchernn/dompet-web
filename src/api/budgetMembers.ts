import apiClient from "@/lib/apiClient"
import type { BudgetMember } from "@/api/types"

export const listBudgetMembers = (budgetId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<BudgetMember[]>(`/budgets/${budgetId}/members`, { page, page_size: pageSize })

// No user-search endpoint exists — members are added by raw Cognito user_id.
export const addBudgetMember = (budgetId: string, userId: string) =>
    apiClient.post<BudgetMember>(`/budgets/${budgetId}/members`, { user_id: userId })

export const removeBudgetMember = (budgetId: string, memberUserId: string) =>
    apiClient.delete<{ removed: boolean }>(`/budgets/${budgetId}/members/${memberUserId}`)
