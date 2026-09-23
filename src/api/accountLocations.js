import apiClient from "@/lib/apiClient"

export const listAccountLocations = (accountId, { page = 1, pageSize = 25 } = {}) =>
    apiClient.get(`/accounts/${accountId}/locations`, { page, page_size: pageSize })

export const linkLocation = (accountId, locationId) =>
    apiClient.post(`/accounts/${accountId}/locations`, { location_id: locationId })

export const unlinkLocation = (accountId, locationId) =>
    apiClient.delete(`/accounts/${accountId}/locations/${locationId}`)
