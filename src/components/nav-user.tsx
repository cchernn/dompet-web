import { CircleUserRound } from "lucide-react"
import { Link } from "react-router-dom"
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
                    <Link to="/signout">
                        <Avatar>
                            <AvatarImage />
                            <AvatarFallback><CircleUserRound /></AvatarFallback>
                        </Avatar>
                        <span>Sign Out</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
