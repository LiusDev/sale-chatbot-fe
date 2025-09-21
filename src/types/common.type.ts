// ===== Common Types =====
export interface PaginationParams {
	page?: number
	limit?: number
	keyword?: string
	sort?: string
	order?: "asc" | "desc"
}

export interface PaginationResponse {
	total: number
	page: number
	limit: number
}

export interface ApiResponse<T> {
	success: boolean
	data: T
	pagination?: PaginationResponse
}

export interface ApiError {
	success: false
	error: {
		message: string
		status: number
		details?: Array<{
			field: string
			message: string
		}>
	}
}

// ===== App Info Types =====
export interface AppInfo {
	zalo: string
	shopName: string
	metaAccessToken: string
	metaAppSecret: string
	metaWebhookVerifyKey: string
}

export interface AppInfoUpdate {
	zalo?: string
	shopName?: string
	metaAccessToken?: string
	metaAppSecret?: string
	metaWebhookVerifyKey?: string
}

export type AppInfoKey = keyof AppInfo

export const APP_INFO_KEYS: AppInfoKey[] = [
	"zalo",
	"shopName",
	"metaAccessToken",
	"metaAppSecret",
	"metaWebhookVerifyKey",
] as const

export interface AppInfoValidationError {
	message: string
	allowedKeys: string[]
	providedKeys: string[]
}
