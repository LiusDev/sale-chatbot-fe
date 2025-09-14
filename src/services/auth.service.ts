import type {
	GetMeResponse,
	GetSSOUrlResponse,
	SSOProvider,
} from "@/types/auth.type"
import { BaseApi } from "./base-api"

class AuthService extends BaseApi {
	constructor() {
		super({
			groupPrefix: "auth",
		})
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
			.get(`url/${provider}`, {
				searchParams,
			})
			.json<GetSSOUrlResponse>()
	}

	async logout() {
		return this.api.get("logout").json()
	}

	async getMe() {
		return this.api.get("me").json<GetMeResponse>()
	}
}

const authService = new AuthService()
export default authService
