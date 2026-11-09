import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { User, UserInput, UserPatch, UserProfileResult } from "@/api/types"

// Matches ALLOWED_AVATAR_CONTENT_TYPES in the backend (app/db/user.py).
export const ALLOWED_AVATAR_CONTENT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

// 404 ("User profile not found") just means this account hasn't created a
// dompet.users row yet — Cognito sign-up doesn't create one automatically.
export const getMe = () => apiClient.get<User>("/users/me")

// POST /users and PUT /users/me return {user, avatar_upload_url} rather than
// a flat User — see UserProfileResult. Internal; callers use createProfile/
// updateProfile below, which also handle the upload when a file is passed.
const createProfileRaw = (body: UserInput) =>
    apiClient.post<UserProfileResult>("/users", body).then((result) => { invalidateResource("users"); return result })

const updateProfileRaw = (body: UserPatch) =>
    apiClient.put<UserProfileResult>("/users/me", body).then((result) => { invalidateResource("users"); return result })

// Same presign-then-PUT-directly pattern as attachments (src/api/attachments.ts) —
// the upload URL has no Authorization header.
const uploadAvatar = (uploadUrl: string, file: File) => apiClient.uploadToPresignedUrl(uploadUrl, file, file.type)

// Full create (+ optional avatar upload) flow for the Profile page.
export const createProfile = async (body: UserInput, avatarFile?: File | null): Promise<User> => {
    const { data } = await createProfileRaw({
        ...body,
        avatar_content_type: avatarFile ? avatarFile.type : undefined,
    })
    if (avatarFile && data.avatar_upload_url) {
        await uploadAvatar(data.avatar_upload_url, avatarFile)
    }
    return data.user
}

// Full edit (+ optional avatar upload) flow for the Profile page.
export const updateProfile = async (body: UserPatch, avatarFile?: File | null): Promise<User> => {
    const { data } = await updateProfileRaw({
        ...body,
        avatar_content_type: avatarFile ? avatarFile.type : undefined,
    })
    if (avatarFile && data.avatar_upload_url) {
        await uploadAvatar(data.avatar_upload_url, avatarFile)
    }
    return data.user
}
