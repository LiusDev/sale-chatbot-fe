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
