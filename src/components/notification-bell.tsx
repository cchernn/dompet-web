import { Bell, CheckCircle2, XCircle, Info, AlertTriangle, type LucideIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useNotifications, markAllRead } from "@/lib/notifications"

const TYPE_META: Record<string, { Icon: LucideIcon; className: string }> = {
    success: { Icon: CheckCircle2, className: "text-green-600" },
    error: { Icon: XCircle, className: "text-red-600" },
    warning: { Icon: AlertTriangle, className: "text-yellow-600" },
    info: { Icon: Info, className: "text-blue-600" },
}

export function NotificationBell() {
    const { items, unreadCount } = useNotifications()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Popover onOpenChange={(open) => { if (open) markAllRead() }}>
                    <PopoverTrigger asChild>
                        <SidebarMenuButton>
                            <span className="relative inline-flex">
                                <Bell />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-medium leading-none text-destructive-foreground">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </span>
                            <span>Notifications</span>
                        </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent side="right" align="end" className="w-80 p-0">
                        <div className="px-3 py-2 border-b">
                            <span className="text-sm font-semibold">Notifications</span>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {items.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No notifications yet.</p>
                            ) : (
                                items.map((item) => {
                                    const meta = TYPE_META[item.type] ?? { Icon: Bell, className: "text-muted-foreground" }
                                    return (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "flex items-start gap-2 px-3 py-2 border-b last:border-0",
                                                !item.is_read && "bg-muted/50"
                                            )}
                                        >
                                            <meta.Icon className={cn("size-4 mt-0.5 shrink-0", meta.className)} />
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="text-sm truncate">{item.message}</span>
                                                {item.description && (
                                                    <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
