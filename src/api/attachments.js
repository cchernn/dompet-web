import apiClient from "@/lib/apiClient"

export const listAttachments = ({ page = 1, pageSize = 25, includeInactive = false } = {}) =>
    apiClient.get("/attachments", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getAttachment = (attachmentId) => apiClient.get(`/attachments/${attachmentId}`)

// POST /attachments returns { attachment, upload_url } — the record is created
// before the file exists in S3, and the caller must PUT the file to upload_url
// (a presigned URL — no Authorization header) to finish the upload.
export const createAttachmentRecord = ({ filename, contentType, sizeBytes }) =>
    apiClient.post("/attachments", { filename, content_type: contentType, size_bytes: sizeBytes })

export const uploadAttachmentFile = (uploadUrl, file, contentType) =>
    apiClient.uploadToPresignedUrl(uploadUrl, file, contentType)

// Convenience wrapper for the full two-step flow used by the Attachments add page.
export const createAndUploadAttachment = async (file) => {
    const { data } = await createAttachmentRecord({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
    })
    await uploadAttachmentFile(data.upload_url, file, file.type)
    return data.attachment
}

// filename rename only — re-uploading a new file is a new Attachment, not an edit.
export const updateAttachment = (attachmentId, body) => apiClient.put(`/attachments/${attachmentId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteAttachment = (attachmentId) => apiClient.delete(`/attachments/${attachmentId}`)
