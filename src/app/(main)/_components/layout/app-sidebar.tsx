"use client"

import * as React from "react"
import {
	Bot,
	BotMessageSquare,
	ChartNoAxesCombined,
	Package,
	Rss,
} from "lucide-react"

import { NavItems } from "./nav-items"
import { NavUser } from "./nav-user"
import { t } from "@/lib/translations"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

const data = {
	user: {
		name: "Tuan Yen Bai",
		email: "tuanngoanbaoai@gmail.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			name: t("navigation.home"),
			url: "/",
			icon: ChartNoAxesCombined,
		},
		{
			name: t("navigation.products"),
			url: "/products",
			icon: Package,
		},
		{
			name: t("navigation.agents"),
			url: "/agents",
			icon: Bot,
		},
		{
			name: t("navigation.playground"),
			url: "/playground",
			icon: BotMessageSquare,
		},
		{
			name: t("navigation.channels"),
			url: "/channels",
			icon: Rss,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/">
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<BotMessageSquare className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{t("app.name")}
									</span>
									<span className="truncate text-xs">
										{t("app.author")}
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{/* <NavMain items={data.navMain} /> */}
				<NavItems items={data.navMain} />
				{/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	)
}
