import apiClient from "@/lib/apiClient"
import type { Attachment, TransactionAttachmentLink } from "@/api/types"

// Returns full Attachment objects (minus download_url — this is a list
// endpoint, see _to_attachment_summary on the backend), not raw link rows.
export const listTransactionAttachments = (transactionId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Attachment[]>(`/transactions/${transactionId}/attachments`, { page, page_size: pageSize })

export const linkAttachment = (transactionId: string, attachmentId: string) =>
    apiClient.post<TransactionAttachmentLink>(`/transactions/${transactionId}/attachments`, { attachment_id: attachmentId })

export const unlinkAttachment = (transactionId: string, attachmentId: string) =>
    apiClient.delete<{ unlinked: boolean }>(`/transactions/${transactionId}/attachments/${attachmentId}`)
