// ===== Meta API Types =====

// Meta Fanpage from Meta Graph API
export interface MetaFanpage {
	id: string
	name: string
	accessToken: string
	category: string
	category_list?: {
		id: string
		name: string
	}[]
	tasks?: string[]
}

// Meta Fanpage List Response from Meta Graph API
export interface MetaFanpageList {
	data: MetaFanpage[]
	paging: {
		cursors: {
			before: string
			after: string
		}
	}
}

// Stored Meta Page in Database
export interface MetaPage {
	id: number
	page_id: string
	name: string
	access_token: string
	category: string
}

// Request/Response Types for API calls
export interface MetaPagesResponse {
	success: true
	data: MetaPage[]
	meta: {
		total: number
		page: number
		limit: number
	}
}

export interface MetaFanpagesResponse {
	success: true
	data: MetaFanpage[]
	meta: {
		total: number
		page: number
		limit: number
	}
}

// Request body for upserting pages
export interface UpsertMetaPagesRequest {
	id: string
	name: string
	accessToken: string
	category: string
}

// Response for upsert operation
export interface UpsertMetaPagesResponse {
	success: true
	data: MetaPage[]
}

// Response for delete operation
export interface DeleteMetaPageResponse {
	success: true
	data: null
}

// Error response types
export interface MetaApiError {
	message: string
	error: string
}

export interface MetaValidationError {
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

// Query parameters for pagination
export interface MetaPagesParams {
	page?: number
	limit?: number
}

// Meta API configuration
export interface MetaApiConfig {
	metaAccessToken: string
	metaAppSecret: string
	metaWebhookVerifyKey: string
}
