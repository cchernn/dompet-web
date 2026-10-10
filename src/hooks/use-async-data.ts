import { useEffect, useRef, useState } from "react"
import { toast } from "@/lib/toast"
import type { ApiResult } from "@/lib/apiClient"

// Fetches a single resource driven by caller-supplied filter state —
// refetches whenever `deps` changes. fetchFn is read via a ref, same
// pattern as usePaginatedList, so callers can pass a fresh inline arrow
// on every render without memoizing it themselves.
export function useAsyncData<T>(fetchFn: () => Promise<ApiResult<T>>, deps: unknown[]) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchFnRef = useRef(fetchFn)
    fetchFnRef.current = fetchFn

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        fetchFnRef.current()
            .then(({ data }) => {
                if (!cancelled) setData(data)
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
    }, deps)

    return { data, loading }
}
