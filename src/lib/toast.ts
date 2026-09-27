import { toast as sonnerToast } from "sonner"
import { createNotification } from "@/api/notifications"
import { pushNotification } from "@/lib/notifications"
import type { NotificationType } from "@/api/types"

// Thin wrapper around sonner's toast — same call signature, so every page
// just imports `toast` from here instead of from "sonner" directly, with
// no other changes needed at the call site. On top of showing the toast as
// before, success/error/warning/info calls are also persisted to the
// backend notification log (GET /notifications), which is what powers the
// sidebar's notification bell.
function persist(type: NotificationType, message: unknown) {
    if (typeof message !== "string" || !message) return
    createNotification({ type, message })
        .then(({ data }) => pushNotification(data))
        .catch(() => {
            // Best-effort — the toast itself already showed; losing the
            // persisted log entry for it shouldn't surface as its own error.
        })
}

type SuccessArgs = Parameters<typeof sonnerToast.success>
type ErrorArgs = Parameters<typeof sonnerToast.error>
type WarningArgs = Parameters<typeof sonnerToast.warning>
type InfoArgs = Parameters<typeof sonnerToast.info>

// sonner's `toast` is itself callable (bare `toast(message)`) as well as
// carrying methods (.success/.error/etc.) — a new function wrapper (rather
// than a plain object) preserves that, and Object.assign copies every
// pass-through method (message/loading/dismiss/promise/custom/getHistory/
// getToasts) onto it without needing to relist them here, before the
// overrides below replace the four that also persist to the backend.
function callableToast(...args: Parameters<typeof sonnerToast>) {
    return sonnerToast(...args)
}

export const toast = Object.assign(callableToast, sonnerToast, {
    success: (message: SuccessArgs[0], data?: SuccessArgs[1]) => {
        persist("success", message)
        return sonnerToast.success(message, data)
    },
    error: (message: ErrorArgs[0], data?: ErrorArgs[1]) => {
        persist("error", message)
        return sonnerToast.error(message, data)
    },
    warning: (message: WarningArgs[0], data?: WarningArgs[1]) => {
        persist("warning", message)
        return sonnerToast.warning(message, data)
    },
    info: (message: InfoArgs[0], data?: InfoArgs[1]) => {
        persist("info", message)
        return sonnerToast.info(message, data)
    },
})
