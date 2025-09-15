import type { SSOUrlData, UserData, SSOProvider } from "@/types/auth.type"
import type { ApiResponse } from "@/types/common.type"
import { BaseApi } from "./base-api"

const GROUP_PREFIX = "auth"

class AuthService extends BaseApi {
	constructor() {
		super()
	}

	async getSSOUrl({
		provider,
		redirectUri,
	}: {
		provider: SSOProvider
		redirectUri?: string
	}) {
		const searchParams = this.createSearchParams({
			redirect_uri: redirectUri,
		})
		return this.api
			.get(`${GROUP_PREFIX}/url/${provider}`, {
				searchParams,
			})
			.json<ApiResponse<SSOUrlData>>()
	}

	async logout() {
		return this.api
			.get(`${GROUP_PREFIX}/logout`)
			.json<ApiResponse<{ message: string }>>()
	}

	async getMe() {
		return this.api.get(`${GROUP_PREFIX}/me`).json<ApiResponse<UserData>>()
	}
}

const authService = new AuthService()
export default authService
