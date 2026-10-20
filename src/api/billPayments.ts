import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { BillPayment, BillPaymentInput } from "@/api/types"

export const listBillPayments = (billId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<BillPayment[]>(`/bills/${billId}/payments`, { page, page_size: pageSize })

// Every field is optional server-side: amount_paid defaults to the bill's
// full amount, paid_date to today -- so {} alone records a full payment.
export const addBillPayment = (billId: string, body: BillPaymentInput = {}) =>
    apiClient.post<BillPayment>(`/bills/${billId}/payments`, body).then((result) => { invalidateResource("bills"); return result })

export const deleteBillPayment = (billId: string, paymentId: string) =>
    apiClient.delete<{ deleted: boolean }>(`/bills/${billId}/payments/${paymentId}`).then((result) => { invalidateResource("bills"); return result })
