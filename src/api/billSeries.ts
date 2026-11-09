import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { BillSeries, BillSeriesInput, BillSeriesPatch } from "@/api/types"
import type { ListParams } from "@/api/accounts"

export const listBillSeries = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<BillSeries[]>("/bills/series", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getBillSeries = (seriesId: string) => apiClient.get<BillSeries>(`/bills/series/${seriesId}`)

// Materializes the first occurrence immediately server-side, so it shows up
// in GET /bills right away rather than waiting for the next on-demand sync.
export const createBillSeries = (body: BillSeriesInput) =>
    apiClient.post<BillSeries>("/bills/series", body).then((result) => { invalidateResource("bills"); return result })

// Only affects occurrences generated after the edit -- past/current
// occurrences already copied their own name/amount/etc. and are never
// rewritten. anchor_date can't be changed this way (see BillSeriesPatch).
export const updateBillSeries = (seriesId: string, body: BillSeriesPatch) =>
    apiClient.put<BillSeries>(`/bills/series/${seriesId}`, body).then((result) => { invalidateResource("bills"); return result })

// One-way soft delete (is_active=false) -- stops future occurrences from
// being generated; existing ones are untouched. No reactivate route exists.
export const deleteBillSeries = (seriesId: string) =>
    apiClient.delete<BillSeries>(`/bills/series/${seriesId}`).then((result) => { invalidateResource("bills"); return result })
