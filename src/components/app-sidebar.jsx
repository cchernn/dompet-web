import {
    ChartColumn,
    FileText,
    Group,
    Paperclip,
    MapPin,
    Wallet,
} from "lucide-react"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "@/components/ui/sidebar"

const items = [
    {
        title: "Overview",
        url: "/",
        icon: ChartColumn,
    },
    {
        title: "Transactions",
        url: "/transactions",
        icon: FileText,
    },
    {
        title: "Groups",
        url: "/transactions/groups",
        icon: Group,
    },
    {
        title: "Attachments",
        url: "/attachments",
        icon: Paperclip,
    },
    {
        title: "Locations",
        url: "/locations",
        icon: MapPin,
    },
]
export function AppSidebar({ ...props }) {
    return (
        <Sidebar collapsible="icon" { ...props }>
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                        <div>
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-secondary-foreground border shadow-lg">
                                <Wallet className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left">
                                <span className="truncate font-semibold">dompet</span>
                            </div>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Expenditure</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <a href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <NavUser />
        </SidebarFooter>
        </Sidebar>
    )
}