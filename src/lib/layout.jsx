import { 
    SidebarProvider,
    SidebarInset,
    SidebarTrigger, 
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SidebarTrigger />
                <main>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}