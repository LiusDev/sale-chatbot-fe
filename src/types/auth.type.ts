export type SSOProvider = "google"

export interface SSOUrlData {
	authUrl: string
	state: string
}

export interface UserData {
	user: {
		id: number
		name: string
		email: string
		avatar: string
	}
}
