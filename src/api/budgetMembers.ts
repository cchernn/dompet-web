import apiClient from "@/lib/apiClient"
import type { BudgetMember } from "@/api/types"

export const listBudgetMembers = (budgetId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<BudgetMember[]>(`/budgets/${budgetId}/members`, { page, page_size: pageSize })

// Resolved server-side via the public username directory (dompet.vw_users_public).
export const addBudgetMember = (budgetId: string, username: string) =>
    apiClient.post<BudgetMember>(`/budgets/${budgetId}/members`, { username })

export const removeBudgetMember = (budgetId: string, memberUserId: string) =>
    apiClient.delete<{ removed: boolean }>(`/budgets/${budgetId}/members/${memberUserId}`)
