import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { ApiResult } from "@/lib/apiClient"

export interface PageRequest {
    page: number
    pageSize: number
}

export interface UsePaginatedListOptions {
    pageSize?: number
}

// Server-side pagination: the backend returns a full page of rows plus
// {page, page_size, total_count, total_pages} metadata on every list call.
//
// fetchFn is (PageRequest) => Promise<ApiResult<T[]>>. It's read via a ref
// rather than a hook dependency, so callers can pass a plain inline arrow
// function on every render without memoizing it — only page/pageSize/reloadKey
// changes trigger a refetch.
export function usePaginatedList<T>(
    fetchFn: (request: PageRequest) => Promise<ApiResult<T[]>>,
    { pageSize = 25 }: UsePaginatedListOptions = {}
) {
    const [items, setItems] = useState<T[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [reloadKey, setReloadKey] = useState(0)

    const fetchFnRef = useRef(fetchFn)
    fetchFnRef.current = fetchFn

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        fetchFnRef.current({ page, pageSize })
            .then(({ data, metadata }) => {
                if (cancelled) return
                setItems(data ?? [])
                setTotalPages(metadata?.total_pages ?? 1)
                setTotalCount(metadata?.total_count ?? (data ?? []).length)
            })
            .catch((error: Error) => {
                if (cancelled) return
                toast.error(error.message)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [page, pageSize, reloadKey])

    return {
        items,
        page,
        setPage,
        totalPages,
        totalCount,
        loading,
        nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
        previousPage: () => setPage((p) => Math.max(p - 1, 1)),
        reload: () => setReloadKey((k) => k + 1),
    }
}
