import apiClient from "@/lib/apiClient"
import type { Budget, BillBudgetLink } from "@/api/types"

// Returns Budget objects (not raw link rows), same convention as
// listTransactionBudgets. Sharing a bill to a budget widens who can SELECT
// it (and its payments) server-side -- a budget co-member can list this
// even when they don't own the bill, so unlike billAttachments this isn't
// gated to owners-only on read; only link/unlink (POST/DELETE) are.
export const listBillBudgets = (billId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Budget[]>(`/bills/${billId}/budgets`, { page, page_size: pageSize })

export const linkBillBudget = (billId: string, budgetId: string) =>
    apiClient.post<BillBudgetLink>(`/bills/${billId}/budgets`, { budget_id: budgetId })

export const unlinkBillBudget = (billId: string, budgetId: string) =>
    apiClient.delete<{ unlinked: boolean }>(`/bills/${billId}/budgets/${budgetId}`)
