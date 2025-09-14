export type SSOProvider = "google"

export interface GetSSOUrlResponse {
	authUrl: string
	state: string
}

export interface GetMeResponse {
	user: {
		id: number
		name: string
		email: string
		avatar: string
	}
}
