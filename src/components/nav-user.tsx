import { CircleUserRound } from "lucide-react"
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar"
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"

interface NavUserProps {
    user?: unknown
}

export function NavUser({
    user
}: NavUserProps) {
    void user

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <a href="/signout">
                        <Avatar>
                            <AvatarImage />
                            <AvatarFallback><CircleUserRound /></AvatarFallback>
                        </Avatar>
                        <span>Sign Out</span>
                    </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
