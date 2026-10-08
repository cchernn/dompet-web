import { CircleUserRound, User as UserIcon, Bell, LogOut } from "lucide-react"
import { Link } from "react-router-dom"
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { useNotifications } from "@/lib/notifications"

export function NavUser() {
    const profile = useCurrentUserProfile()
    const { unreadCount } = useNotifications()
    const { isMobile, setOpenMobile } = useSidebar()
    const closeOnMobile = () => {
        if (isMobile) setOpenMobile(false)
    }

    const label = profile ? (profile.display_name || profile.username) : "Set up profile"

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton>
                            <Avatar>
                                <AvatarImage />
                                <AvatarFallback>
                                    {profile?.username ? profile.username[0].toUpperCase() : <CircleUserRound />}
                                </AvatarFallback>
                            </Avatar>
                            <span>{label}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" className="w-56">
                        <DropdownMenuItem asChild onClick={closeOnMobile}>
                            <Link to="/profile">
                                <UserIcon />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild onClick={closeOnMobile}>
                            <Link to="/notifications">
                                <Bell />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-destructive-foreground">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild onClick={closeOnMobile}>
                            <Link to="/signout">
                                <LogOut />
                                Sign Out
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
