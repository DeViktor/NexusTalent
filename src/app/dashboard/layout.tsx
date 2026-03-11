import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="min-h-screen flex flex-col">
                <DashboardHeader />
                <SidebarProvider>
                    <Sidebar>
                        <SidebarHeader>
                            <SidebarTrigger />
                        </SidebarHeader>
                        <SidebarContent>
                            <DashboardSidebarNav />
                        </SidebarContent>
                    </Sidebar>
                    <SidebarInset>
                        <div className="flex items-center gap-2 p-2 md:hidden">
                            <SidebarTrigger />
                        </div>
                        <main className="flex-grow p-4 sm:p-6 lg:p-8">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </div>
    );
}
