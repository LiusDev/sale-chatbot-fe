"use client"

import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/queries/auth.query"
import {
	useTernaryDarkMode,
	type TernaryDarkMode,
} from "@/hooks/use-ternary-dark-mode"
import authService from "@/services/auth.service"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

const themeIcons = {
	light: Sun,
	dark: Moon,
	system: Monitor,
}

const themeLabels = {
	light: "Light",
	dark: "Dark",
	system: "System",
}

export function NavUser({
	user,
}: {
	user: {
		name: string
		email: string
		avatar: string
	}
}) {
	const { data } = useAuth()
	const { isMobile } = useSidebar()
	const { ternaryDarkMode, setTernaryDarkMode } = useTernaryDarkMode()
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const handleThemeChange = (theme: TernaryDarkMode) => {
		setTernaryDarkMode(theme)
	}

	const handleLogout = async () => {
		await authService.logout()
		queryClient.clear()
		navigate("/auth/login")
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									src={user.avatar}
									alt={user.name}
								/>
								<AvatarFallback className="rounded-lg">
									{data?.user.name.charAt(0) || "TYB"}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{data?.user.name || "Tuan Yen Bai"}
								</span>
								<span className="truncate text-xs">
									{data?.user.email ||
										"tuanngoanbaoai@gmail.com"}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={user.avatar}
										alt={user.name}
									/>
									<AvatarFallback className="rounded-lg">
										{data?.user.name.charAt(0) || "TYB"}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{data?.user.name || "Tuan Yen Bai"}
									</span>
									<span className="truncate text-xs">
										{data?.user.email ||
											"tuanngoanbaoai@gmail.com"}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							{Object.entries(themeLabels).map(
								([value, label]) => {
									const Icon =
										themeIcons[value as TernaryDarkMode]
									const isActive = ternaryDarkMode === value
									return (
										<DropdownMenuItem
											key={value}
											onClick={() =>
												handleThemeChange(
													value as TernaryDarkMode
												)
											}
											className="flex items-center gap-2"
										>
											<Icon className="h-4 w-4" />
											<span>{label}</span>
											{isActive && (
												<span className="ml-auto text-xs opacity-60">
													✓
												</span>
											)}
										</DropdownMenuItem>
									)
								}
							)}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
