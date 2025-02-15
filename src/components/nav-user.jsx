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
    useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
    user
}) {
    const { isMobile } = useSidebar()

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