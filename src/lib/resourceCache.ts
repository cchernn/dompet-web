// In-memory cache for reference/dropdown data (accounts, categories, tags,
// budgets, locations, attachments) that's fetched identically across many
// pages — avoids re-querying it on every page load. Invalidated wholesale
// per resource right after any create/update/delete/deactivate/reactivate
// call for that resource succeeds (see the invalidate() calls in src/api/*.ts).
// Deliberately page-session-only (no persistence, no cross-tab sync) — a
// hard refresh or a change made in another tab just means the next mount
// here re-fetches, which is the same cost as not caching at all.
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
// every sidebar click used to trigger).
export function clearResourceCache(): void {
    cache.clear()
}
