import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserBadgeProps {
    username?: string | null
    displayName?: string | null
    className?: string
    avatarClassName?: string
}

// Avatar + name pairing for a resolved owner — no AvatarImage, since none of
// the endpoints that expose username/display_name for someone other than
// the viewer (transaction/category/location/budget search, budget members)
// also expose avatar_url; that's only ever returned on the viewer's own
// GET/PUT/POST /users* calls (see src/pages/main/profile). Falls back to
// the initial letter, same as NavUser.
export function UserBadge({ username, displayName, className, avatarClassName }: UserBadgeProps) {
    const label = displayName || username || "No profile yet"
    const initial = username ? username[0].toUpperCase() : "?"

    return (
        <span className={cn("inline-flex items-center gap-1.5 min-w-0", className)}>
            <Avatar className={cn("h-5 w-5 shrink-0", avatarClassName)}>
                <AvatarFallback className="text-[10px]">{initial}</AvatarFallback>
            </Avatar>
            <span className="truncate">{label}</span>
        </span>
    )
}
