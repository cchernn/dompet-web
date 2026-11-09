import { useEffect, useState } from "react"

// Module-level, not component state — apiClient.ts (which reports these)
// has no React tree of its own to hold state in, and the dialog that reads
// it (mounted once in App.tsx) needs to see every report regardless of
// which page triggered it.
let open = false
const listeners = new Set<() => void>()

function emit() {
    listeners.forEach((listener) => listener())
}

// Called by apiClient.ts whenever a request fails before reaching the
// server (fetch throws) — i.e. offline, DNS failure, timeout, CORS, etc.
// Distinct from a request that reaches the server and comes back with an
// error status or envelope, which keeps surfacing as a toast.
export function reportConnectionError() {
    if (open) return
    open = true
    emit()
}

// Called on the next successful request, so the dialog doesn't linger
// claiming the connection is down once it's back.
export function clearConnectionError() {
    if (!open) return
    open = false
    emit()
}

export function useConnectionError(): boolean {
    const [, setTick] = useState(0)

    useEffect(() => {
        const listener = () => setTick((tick) => tick + 1)
        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    }, [])

    return open
}
