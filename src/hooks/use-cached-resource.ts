import { useEffect, useState } from "react"
import { toast } from "@/lib/toast"
import type { ApiResult } from "@/lib/apiClient"
import { getCached } from "@/lib/resourceCache"

// Fetches reference/dropdown data (accounts, categories, tags, budgets,
// locations, attachments) once per cache key and reuses it across every
// page that asks for the same key, instead of re-querying on every mount.
// The cache is invalidated per-resource by src/api/*.ts right after a
// mutating call for that resource succeeds, so the next mount anywhere
// picks up fresh data — this hook itself doesn't need to know about that.
export function useCachedResource<T>(key: string, fetcher: () => Promise<ApiResult<T>>) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        getCached(key, fetcher)
            .then((result) => {
                if (!cancelled) setData(result.data)
            })
            .catch((error: Error) => {
                if (!cancelled) toast.error(error.message)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    return { data, loading }
}
