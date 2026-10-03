import apiClient from "@/lib/apiClient"
import type { Location, LocationInput, LocationPatch, LocationSearchResult, LocationType } from "@/api/types"
import type { ListParams, SearchParams } from "@/api/accounts"

export const listLocations = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Location[]>("/locations", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

// Filter-dropdown/listing source. Unlike accounts/categories/tags/budgets,
// locations keep the normal 100-row page-size ceiling (typeahead-only, per
// the backend) — there's no raised ceiling for a one-shot full fetch here.
// user_id is an exact match, not an enum: pass the current user's id for
// "mine", or the literal string "null" for public/shared rows.
export const searchLocations = ({ page = 1, pageSize = 25, q, owner, type }: SearchParams & { owner?: string; type?: LocationType } = {}) =>
    apiClient.get<LocationSearchResult[]>("/locations/search", { page, page_size: pageSize, q, user_id: owner, type })

export const getLocation = (locationId: string) => apiClient.get<Location>(`/locations/${locationId}`)

export const createLocation = (body: LocationInput) => apiClient.post<Location>("/locations", body)

export const updateLocation = (locationId: string, body: LocationPatch) =>
    apiClient.put<Location>(`/locations/${locationId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteLocation = (locationId: string) => apiClient.delete<Location>(`/locations/${locationId}`)
