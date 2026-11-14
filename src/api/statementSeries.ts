import apiClient from "@/lib/apiClient"
import { invalidateResource } from "@/lib/resourceCache"
import type { StatementSeries, StatementSeriesInput, StatementSeriesPatch } from "@/api/types"
import type { ListParams } from "@/api/accounts"

export const listStatementSeries = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<StatementSeries[]>("/statements/series", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getStatementSeries = (seriesId: string) => apiClient.get<StatementSeries>(`/statements/series/${seriesId}`)

// Materializes the first occurrence immediately server-side, so it shows up
// in GET /statements right away rather than waiting for the next on-demand
// sync. Rejected with a 409 if the account already has an active series.
export const createStatementSeries = (body: StatementSeriesInput) =>
    apiClient.post<StatementSeries>("/statements/series", body).then((result) => { invalidateResource("statements"); return result })

// Only affects occurrences generated after the edit -- the account and
// anchor_date are fixed at creation (see StatementSeriesPatch).
export const updateStatementSeries = (seriesId: string, body: StatementSeriesPatch) =>
    apiClient.put<StatementSeries>(`/statements/series/${seriesId}`, body).then((result) => { invalidateResource("statements"); return result })

// One-way soft delete (is_active=false) -- stops future occurrences from
// being generated, and frees the account for a new series; existing ones
// are untouched. No reactivate route exists.
export const deleteStatementSeries = (seriesId: string) =>
    apiClient.delete<StatementSeries>(`/statements/series/${seriesId}`).then((result) => { invalidateResource("statements"); return result })
