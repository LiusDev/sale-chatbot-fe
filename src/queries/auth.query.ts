import type { SSOProvider } from "@/types/auth.type"
import { useQuery } from "@tanstack/react-query"
import authService from "@/services/auth.service"

export const useGetSSOUrl = (provider: SSOProvider, redirectUri?: string) => {
	return useQuery({
		queryKey: ["auth", "sso", provider],
		queryFn: () => authService.getSSOUrl({ provider, redirectUri }),
	})
}

export const useAuth = () => {
	return useQuery({
		queryKey: ["auth", "me"],
		queryFn: () => authService.getMe(),
	})
}
