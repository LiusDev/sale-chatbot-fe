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
	id: string
	name: string
	access_token?: string
	category?: string
	agent_id?: number
	agent?: {
		id: number
		name: string
		description?: string
		model: string
		system_prompt: string
		knowledge_source_group_id?: number
		top_k: number
		temperature: number
		max_tokens: number
		created_by: number
	}
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

// ===== Meta Conversations Types =====

// Meta Page Conversation from Meta Graph API
export interface MetaPageConversation {
	id: string
	messages?: {
		data: MetaPageConversationMessage[]
		paging: {
			cursors: {
				before: string
				after: string
			}
		}
	}
}

// Meta Page Conversation Message from Meta Graph API
export interface MetaPageConversationMessage {
	id: string
	created_time: string
	from: {
		id: string
		name: string
	}
	message: string
	attachments?: {
		data: {
			id: string
			mime_type: string
			name: string
			size: number
			image_data?: {
				url: string
			}
			video_data?: {
				url: string
			}
		}[]
	}
}

// Stored Meta Page Conversation in Database
export interface MetaPageConversationStored {
	id: string
	page_id: string
	recipientId?: string
	recipientName?: string
	agentmode: string
	isConfirmOrder: boolean
}

// Stored Meta Page Conversation Message in Database
export interface MetaPageConversationMessageStored {
	id: string
	conversation_id: string
	created_time: string
	message: string
	from: string // JSON string containing { name: string, id: string }
	attachments?: any | null
}

// Webhook Payload Types
export interface MetaWebhookPayload {
	object: string
	entry: Array<{
		id: string
		time: number
		messaging?: Array<{
			sender: {
				id: string
			}
			recipient: {
				id: string
			}
			timestamp: number
			message?: {
				mid: string
				text: string
				attachments?: any
			}
		}>
	}>
}

// Response for sync conversations operation
export interface SyncPageConversationsResponse {
	success: true
	data: MetaPageConversationStored[]
}

// Request for sync conversations operation
export interface SyncPageConversationsRequest {
	pageId: string
}

// ===== New API Response Types =====

// Get Page Conversations Response
export interface GetPageConversationsResponse {
	success: true
	data: MetaPageConversationStored[]
	meta: {
		total: number
		page: number
		limit: number
	}
}

// Get Conversation Messages Response
export interface GetConversationMessagesResponse {
	success: true
	data: MetaPageConversationMessageStored[]
	meta: {
		total: number
		page: number
		limit: number
	}
}

// Send Message Request
export interface SendMessageRequest {
	message: string
}

// Send Message Response
export interface SendMessageResponse {
	success: true
	data: null
}

// Webhook Verification Response
export interface WebhookVerificationResponse {
	message: string
}

// Webhook Event Response
export interface WebhookEventResponse {
	message: string
}

// Error Response Types
export interface MetaErrorResponse {
	success: false
	error: {
		message: string
		status: number
	}
}

// ===== Query Parameters =====

export interface GetPageConversationsParams {
	pageId: string
}

export interface GetConversationMessagesParams {
	pageId: string
	conversationId: string
}

export interface SendMessageParams {
	pageId: string
	conversationId: string
}

// ===== Agent Management Types =====

// Assign Agent Request
export interface AssignAgentRequest {
	agentId: number
}

// Assign Agent Response
export interface AssignAgentResponse {
	success: true
	data: {
		message: string
	}
}

// Update Agent Mode Request
export interface UpdateAgentModeRequest {
	agentMode: "auto" | "manual"
}

// Update Agent Mode Response
export interface UpdateAgentModeResponse {
	success: true
	data: {
		message: string
	}
}

// Agent Assignment Parameters
export interface AssignAgentParams {
	pageId: string
}

// Agent Mode Update Parameters
export interface UpdateAgentModeParams {
	pageId: string
	conversationId: string
}
