import apiClient from "@/lib/apiClient"

// Returns Attachment objects (not raw link rows).
export const listTransactionAttachments = (transactionId, { page = 1, pageSize = 25 } = {}) =>
    apiClient.get(`/transactions/${transactionId}/attachments`, { page, page_size: pageSize })

export const linkAttachment = (transactionId, attachmentId) =>
    apiClient.post(`/transactions/${transactionId}/attachments`, { attachment_id: attachmentId })

export const unlinkAttachment = (transactionId, attachmentId) =>
    apiClient.delete(`/transactions/${transactionId}/attachments/${attachmentId}`)
