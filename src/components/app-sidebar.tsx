import type { ComponentProps } from "react"
import { Link } from "react-router-dom"
import {
    ChartColumn,
    FileText,
    Landmark,
    Tag,
    Shapes,
    Paperclip,
    MapPin,
    Wallet,
    PiggyBank,
    type LucideIcon,
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
    useSidebar,
} from "@/components/ui/sidebar"

// The modules that get real analytics/summary pages (vs. Catalog below,
// which stays plain lists with a totals widget at most).
const financeItems = [
    {
        title: "Overview",
        url: "/",
        icon: ChartColumn,
    },
    {
        title: "Budgets",
        url: "/budgets",
        icon: PiggyBank,
    },
    {
        title: "Transactions",
        url: "/transactions",
        icon: FileText,
    },
]

// Supporting records that transactions reference — not activity in themselves.
const catalogItems = [
    {
        title: "Accounts",
        url: "/accounts",
        icon: Landmark,
    },
    {
        title: "Categories",
        url: "/categories",
        icon: Shapes,
    },
    {
        title: "Tags",
        url: "/tags",
        icon: Tag,
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

interface NavItem {
    title: string
    url: string
    icon: LucideIcon
}

interface NavGroupProps {
    label: string
    items: NavItem[]
    onNavigate: () => void
}

function NavGroup({ label, items, onNavigate }: NavGroupProps) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild onClick={onNavigate}>
                                <Link to={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const { isMobile, setOpenMobile } = useSidebar()
    const closeOnMobile = () => {
        if (isMobile) setOpenMobile(false)
    }

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
            <NavGroup label="Finances" items={financeItems} onNavigate={closeOnMobile} />
            <NavGroup label="Catalog" items={catalogItems} onNavigate={closeOnMobile} />
        </SidebarContent>
        <SidebarFooter>
            <NavUser />
        </SidebarFooter>
        </Sidebar>
    )
}
