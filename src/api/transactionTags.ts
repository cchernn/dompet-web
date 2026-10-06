import apiClient from "@/lib/apiClient"
import type { Tag, TransactionTagLink } from "@/api/types"

// Returns Tag objects (not raw link rows).
export const listTransactionTags = (transactionId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Tag[]>(`/transactions/${transactionId}/tags`, { page, page_size: pageSize })

export const linkTag = (transactionId: string, tagId: string) =>
    apiClient.post<TransactionTagLink>(`/transactions/${transactionId}/tags`, { tag_id: tagId })

export const unlinkTag = (transactionId: string, tagId: string) =>
    apiClient.delete<{ unlinked: boolean }>(`/transactions/${transactionId}/tags/${tagId}`)
