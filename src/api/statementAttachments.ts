import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { Attachment, StatementAttachmentLink } from "@/api/types"

// Returns full Attachment objects (minus download_url -- this is a list
// endpoint, see _to_attachment_summary on the backend), same shape as
// listBillAttachments.
export const listStatementAttachments = (statementId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Attachment[]>(`/statements/${statementId}/attachments`, { page, page_size: pageSize })

export const linkStatementAttachment = (statementId: string, attachmentId: string) =>
    apiClient.post<StatementAttachmentLink>(`/statements/${statementId}/attachments`, { attachment_id: attachmentId })
        .then((result) => { invalidateResource("statements"); return result })

export const unlinkStatementAttachment = (statementId: string, attachmentId: string) =>
    apiClient.delete<{ unlinked: boolean }>(`/statements/${statementId}/attachments/${attachmentId}`)
        .then((result) => { invalidateResource("statements"); return result })
