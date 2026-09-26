import apiClient from "@/lib/apiClient"
import type { AccountLocationLink, Location } from "@/api/types"

export const listAccountLocations = (accountId: string, { page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Location[]>(`/accounts/${accountId}/locations`, { page, page_size: pageSize })

export const linkLocation = (accountId: string, locationId: string) =>
    apiClient.post<AccountLocationLink>(`/accounts/${accountId}/locations`, { location_id: locationId })

export const unlinkLocation = (accountId: string, locationId: string) =>
    apiClient.delete<{ unlinked: boolean }>(`/accounts/${accountId}/locations/${locationId}`)
