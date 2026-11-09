import { useEffect, useState } from "react"
import authService from "@/lib/authService"

// undefined while loading, null if there's no signed-in user.
export function useCurrentUserId(): string | null | undefined {
    const [userId, setUserId] = useState<string | null | undefined>(undefined)

    useEffect(() => {
        let cancelled = false
        authService.getUser()
            .then((id) => {
                if (!cancelled) setUserId(id ?? null)
            })
            .catch(() => {
                if (!cancelled) setUserId(null)
            })
        return () => {
            cancelled = true
        }
    }, [])

    return userId
}

// Edit/Delete stay hidden until the current user id is known, so a record
// never looks editable just because the id hasn't loaded yet.
export function isOwnedBy(recordUserId: string | null | undefined, currentUserId: string | null | undefined): boolean {
    return currentUserId != null && recordUserId === currentUserId
}
