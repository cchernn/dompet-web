import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
    label: string
    value: ReactNode
    icon?: LucideIcon
    valueClassName?: string
}

export function KpiCard({ label, value, icon: Icon, valueClassName }: KpiCardProps) {
    return (
        <Card className="p-4 rounded-2xl shadow-md border">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                {Icon && <Icon className="size-4 text-muted-foreground" />}
            </div>
            <div className={cn("text-2xl font-semibold mt-1 tabular-nums", valueClassName)}>{value}</div>
        </Card>
    )
}
