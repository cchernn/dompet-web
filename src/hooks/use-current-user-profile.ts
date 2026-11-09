import { useEffect, useState } from "react"
import { ApiError, type ApiResult } from "@/lib/apiClient"
import { getCached } from "@/lib/resourceCache"
import { getMe } from "@/api/users"
import type { User } from "@/api/types"

// A 404 here just means this account hasn't created a dompet.users row yet
// (Cognito sign-up doesn't create one automatically) — not an error worth
// surfacing, so it's folded into the cached value as `data: null` rather
// than left to reject and get toasted by every mount that asks for it.
async function fetchMe(): Promise<ApiResult<User | null>> {
    try {
        return await getMe()
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return { data: null, metadata: {} }
        }
        throw error
    }
}

// Shared with the profile edit/create page via the same "users:me" cache
// key — createProfile/updateProfile (src/api/users.ts) invalidate it on
// success, so this picks up the change on next mount without a hard reload.
export function useCurrentUserProfile(): User | null | undefined {
    const [profile, setProfile] = useState<User | null | undefined>(undefined)

    useEffect(() => {
        let cancelled = false
        getCached("users:me", fetchMe)
            .then(({ data }) => { if (!cancelled) setProfile(data) })
            .catch(() => { if (!cancelled) setProfile(null) })
        return () => {
            cancelled = true
        }
    }, [])

    return profile
}
