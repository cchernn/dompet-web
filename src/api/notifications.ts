import apiClient from "@/lib/apiClient"
import type { Notification, NotificationInput } from "@/api/types"

export const listNotifications = ({ page = 1, pageSize = 25 }: { page?: number; pageSize?: number } = {}) =>
    apiClient.get<Notification[]>("/notifications", { page, page_size: pageSize })

export const createNotification = (body: NotificationInput) =>
    apiClient.post<Notification>("/notifications", body)

export const markNotificationRead = (notificationId: string) =>
    apiClient.post<Notification>(`/notifications/${notificationId}/read`)

// Bulk mark-read returns a count, not a Notification — distinct shape from
// the rest of this module (see backend's app/handlers/notification.py).
export const markAllNotificationsRead = () =>
    apiClient.post<{ marked_read: number }>("/notifications/read-all")

// Hard delete — {deleted: true}, not a Notification.
export const deleteNotification = (notificationId: string) =>
    apiClient.delete<{ deleted: boolean }>(`/notifications/${notificationId}`)
