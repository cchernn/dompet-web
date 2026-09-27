import { useEffect, useState } from "react"
import { listNotifications, markAllNotificationsRead as apiMarkAllRead } from "@/api/notifications"
import type { Notification } from "@/api/types"

// Module-level cache, not component state — AppSidebar (and this bell with
// it) remounts on every route navigation (each route in routes/index.tsx
// renders its own <Layout> element), so anything living in component state
// would refetch from scratch on every click through the app.
let items: Notification[] = []
let loaded = false
const listeners = new Set<() => void>()

function emit() {
    listeners.forEach((listener) => listener())
}

async function refresh() {
    try {
        const { data } = await listNotifications({ pageSize: 50 })
        items = data
        loaded = true
        emit()
    } catch {
        // Leave the existing cache as-is — the bell shows the last known
        // state rather than erroring the whole sidebar over this.
    }
}

// Called by the toast shim (src/lib/toast.ts) right after it persists a new
// notification, so the bell updates immediately without waiting on a full
// GET /notifications refetch.
export function pushNotification(notification: Notification) {
    items = [notification, ...items]
    emit()
}

export function useNotifications(): { items: Notification[]; unreadCount: number } {
    const [, setTick] = useState(0)

    useEffect(() => {
        const listener = () => setTick((tick) => tick + 1)
        listeners.add(listener)
        if (!loaded) refresh()
        return () => {
            listeners.delete(listener)
        }
    }, [])

    const unreadCount = items.filter((item) => !item.is_read).length
    return { items, unreadCount }
}

export async function markAllRead() {
    if (items.length === 0 || items.every((item) => item.is_read)) return
    items = items.map((item) => (item.is_read ? item : { ...item, is_read: true }))
    emit()
    try {
        await apiMarkAllRead()
    } catch {
        // Best-effort — if this silently failed, the next refresh() will
        // reconcile with the server's actual read state.
    }
}
