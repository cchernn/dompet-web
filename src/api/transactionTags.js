import apiClient from "@/lib/apiClient"

// Returns Tag objects (not raw link rows).
export const listTransactionTags = (transactionId, { page = 1, pageSize = 25 } = {}) =>
    apiClient.get(`/transactions/${transactionId}/tags`, { page, page_size: pageSize })

export const linkTag = (transactionId, tagId) =>
    apiClient.post(`/transactions/${transactionId}/tags`, { tag_id: tagId })

export const unlinkTag = (transactionId, tagId) =>
    apiClient.delete(`/transactions/${transactionId}/tags/${tagId}`)
