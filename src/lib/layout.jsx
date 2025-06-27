import { 
    SidebarProvider,
    SidebarInset,
    SidebarTrigger, 
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export default function Layout({ children, route, paths }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-16 items-center gap-2 px-4 shrink-0 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <AppHeader route={route} paths={paths}/>
                </header>
                <main className="overflow-auto min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}