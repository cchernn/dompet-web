import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { User, UserInput, UserPatch } from "@/api/types"

// 404 ("User profile not found") just means this account hasn't created a
// dompet.users row yet — Cognito sign-up doesn't create one automatically.
export const getMe = () => apiClient.get<User>("/users/me")

export const createProfile = (body: UserInput) =>
    apiClient.post<User>("/users", body).then((result) => { invalidateResource("users"); return result })

export const updateProfile = (body: UserPatch) =>
    apiClient.put<User>("/users/me", body).then((result) => { invalidateResource("users"); return result })
