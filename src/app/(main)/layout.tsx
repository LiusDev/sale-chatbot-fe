import { AppSidebar } from "./_components/layout/app-sidebar"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"
import { ReAuthDialog } from "@/components/re-auth-dialog"
import { Toaster } from "sonner"
import { Outlet } from "react-router-dom"

export default function MainLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="max-h-full">
				<header className="flex h-12 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						{/* <Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="#">
										{t('breadcrumbs.buildingApplication')}
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>
										{t('breadcrumbs.dataFetching')}
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb> */}
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-h-[calc(100vh-64px)]">
					<Outlet />
				</div>
			</SidebarInset>
			<ReAuthDialog />
			<Toaster />
		</SidebarProvider>
	)
}
