import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { Bill, BillInput, BillPatch, BillSearchResult, BillStatus } from "@/api/types"
import type { ListParams } from "@/api/accounts"

export const listBills = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Bill[]>("/bills", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export interface BillSearchParams {
    page?: number
    pageSize?: number
    q?: string
    // category/account match on exact joined name (dompet.vw_bills), same
    // convention as the budgets/transactions filter dropdowns.
    category?: string
    account?: string
    isRecurring?: boolean
    status?: BillStatus
    from?: string
    to?: string
}

// Denormalized view used by the Bills list page -- joined category/account
// names plus status/paid_amount/is_overdue derived from bill_payments.
export const searchBills = ({ page = 1, pageSize = 25, q, category, account, isRecurring, status, from, to }: BillSearchParams = {}) =>
    apiClient.get<BillSearchResult[]>("/bills/search", {
        page, page_size: pageSize, q, category, account,
        is_recurring: isRecurring, status, from, to,
    })

export const getBill = (billId: string) => apiClient.get<Bill>(`/bills/${billId}`)

export const createBill = (body: BillInput) =>
    apiClient.post<Bill>("/bills", body).then((result) => { invalidateResource("bills"); return result })

export const updateBill = (billId: string, body: BillPatch) =>
    apiClient.put<Bill>(`/bills/${billId}`, body).then((result) => { invalidateResource("bills"); return result })

// One-way soft delete (is_active=false) -- no reactivate route exists.
export const deleteBill = (billId: string) =>
    apiClient.delete<Bill>(`/bills/${billId}`).then((result) => { invalidateResource("bills"); return result })
