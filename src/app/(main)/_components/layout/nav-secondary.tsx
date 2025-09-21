import * as React from "react"
import { type LucideIcon } from "lucide-react"

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import { useSpace } from "@/hooks/use-space"

export function NavSecondary({
	items,
	...props
}: {
	items: {
		title: string
		url: string
		icon: LucideIcon
	}[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const space = useSpace()
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								size="sm"
								variant={
									item.url === `/${space}`
										? "outline"
										: "default"
								}
							>
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
