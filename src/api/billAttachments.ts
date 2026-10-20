import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { Attachment, BillAttachmentLink } from "@/api/types"

// Returns full Attachment objects (minus download_url -- this is a list
// endpoint, see _to_attachment_summary on the backend), same shape as
// listTransactionAttachments.
export const listBillAttachments = (billId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Attachment[]>(`/bills/${billId}/attachments`, { page, page_size: pageSize })

export const linkBillAttachment = (billId: string, attachmentId: string) =>
    apiClient.post<BillAttachmentLink>(`/bills/${billId}/attachments`, { attachment_id: attachmentId })
        .then((result) => { invalidateResource("bills"); return result })

export const unlinkBillAttachment = (billId: string, attachmentId: string) =>
    apiClient.delete<{ unlinked: boolean }>(`/bills/${billId}/attachments/${attachmentId}`)
        .then((result) => { invalidateResource("bills"); return result })
