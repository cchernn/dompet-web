import { useEffect } from "react"
import { Bell, CheckCircle2, XCircle, Info, AlertTriangle, type LucideIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useNotifications, markAllRead } from "@/lib/notifications"

const TYPE_META: Record<string, { Icon: LucideIcon; className: string }> = {
    success: { Icon: CheckCircle2, className: "text-green-600" },
    error: { Icon: XCircle, className: "text-red-600" },
    warning: { Icon: AlertTriangle, className: "text-yellow-600" },
    info: { Icon: Info, className: "text-blue-600" },
}

function NotificationsPage() {
    const { items } = useNotifications()

    useEffect(() => {
        markAllRead()
    }, [])

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{items.length.toLocaleString()}</span>
            </div>

            <Card className="p-0 m-2 rounded-2xl shadow-md border overflow-hidden">
                {items.length === 0 ? (
                    <div className="h-20 flex text-center items-center justify-center w-full">
                        <h2 className="text-sm text-muted-foreground">No notifications yet.</h2>
                    </div>
                ) : (
                    items.map((item) => {
                        const meta = TYPE_META[item.type] ?? { Icon: Bell, className: "text-muted-foreground" }
                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    "flex items-start gap-3 px-4 py-3 border-b last:border-0",
                                    !item.is_read && "bg-muted/50"
                                )}
                            >
                                <meta.Icon className={cn("size-4 mt-0.5 shrink-0", meta.className)} />
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-sm">{item.message}</span>
                                    {item.description && (
                                        <span className="text-xs text-muted-foreground">{item.description}</span>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </Card>
        </div>
    )
}

export default NotificationsPage
