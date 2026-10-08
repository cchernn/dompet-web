import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
    className?: string
    label?: string
}

// Shared "page/section is waiting on the API" indicator — used in place of
// a bare skeleton wherever a list or edit page's initial data is loading.
export function LoadingState({ className, label = "Loading..." }: LoadingStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground", className)}>
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm">{label}</span>
        </div>
    )
}
