import apiClient from "@/lib/apiClient"
import type { Location, LocationInput, LocationPatch } from "@/api/types"
import type { ListParams } from "@/api/accounts"

export const listLocations = ({ page = 1, pageSize = 25, includeInactive = false }: ListParams = {}) =>
    apiClient.get<Location[]>("/locations", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getLocation = (locationId: string) => apiClient.get<Location>(`/locations/${locationId}`)

export const createLocation = (body: LocationInput) => apiClient.post<Location>("/locations", body)

export const updateLocation = (locationId: string, body: LocationPatch) =>
    apiClient.put<Location>(`/locations/${locationId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteLocation = (locationId: string) => apiClient.delete<Location>(`/locations/${locationId}`)
