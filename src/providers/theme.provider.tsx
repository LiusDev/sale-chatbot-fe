"use client"

import { useEffect } from "react"
import { useTernaryDarkMode } from "@/hooks/use-ternary-dark-mode"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { isDarkMode } = useTernaryDarkMode()

	useEffect(() => {
		const root = window.document.documentElement

		if (isDarkMode) {
			root.classList.add("dark")
		} else {
			root.classList.remove("dark")
		}
	}, [isDarkMode])

	return <>{children}</>
}
