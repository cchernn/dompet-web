import apiClient from "@/lib/apiClient"

export const listLocations = ({ page = 1, pageSize = 25, includeInactive = false } = {}) =>
    apiClient.get("/locations", { page, page_size: pageSize, include_inactive: includeInactive || undefined })

export const getLocation = (locationId) => apiClient.get(`/locations/${locationId}`)

export const createLocation = (body) => apiClient.post("/locations", body)

export const updateLocation = (locationId, body) => apiClient.put(`/locations/${locationId}`, body)

// One-way soft delete (is_active=false) — no reactivate route exists.
export const deleteLocation = (locationId) => apiClient.delete(`/locations/${locationId}`)
