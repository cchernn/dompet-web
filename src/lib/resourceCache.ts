// In-memory cache for reference/dropdown data (accounts, categories, tags,
// budgets, locations, attachments) that's fetched identically across many
// pages — avoids re-querying it on every page load. Invalidated wholesale
// per resource right after any create/update/delete/deactivate/reactivate
// call for that resource succeeds (see the invalidate() calls in src/api/*.ts).
// Deliberately page-session-only (no persistence) — a hard refresh just means
// the next mount re-fetches. Only sign-out is synced across tabs (see below);
// data mutations made in another tab are not, so they show up on next mount.
const cache = new Map<string, Promise<unknown>>()

export function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = cache.get(key)
    if (existing) return existing as Promise<T>

    const promise = fetcher().catch((error: unknown) => {
        // Don't cache a failed fetch — the next mount should retry, not replay the error.
        cache.delete(key)
        throw error
    })
    cache.set(key, promise)
    return promise
}

// Clears every cached entry for a resource (exact key match, or
// "resource:..." prefix match for resources with multiple cached variants).
export function invalidateResource(resource: string): void {
    for (const key of cache.keys()) {
        if (key === resource || key.startsWith(`${resource}:`)) cache.delete(key)
    }
}

// Used on sign-out so the next signed-in user doesn't see the previous
// user's reference data (previously masked by the full page reload that
// every sidebar click used to trigger). Also broadcast so other open tabs
// drop their copy too — each tab has its own in-memory cache.
const SIGN_OUT_CHANNEL = "dompet-auth"
const signOutChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(SIGN_OUT_CHANNEL) : null

signOutChannel?.addEventListener("message", () => cache.clear())

export function clearResourceCache(): void {
    cache.clear()
    signOutChannel?.postMessage("signed-out")
}
