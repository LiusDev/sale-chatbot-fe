import type { PaginationParams } from "./common.type"

// ===== AI Agent Types =====
export interface AIAgent {
	id: number
	name: string
	description?: string
	model: AIModel
	system_prompt: string
	knowledge_source_group_id?: number
	knowledge_source_name?: string
	top_k: number
	temperature: number
	max_tokens: number
	created_by: number
	creator_name?: string
	created_at: string
	updated_at: string
}

export interface CreateAIAgentRequest {
	name: string
	description?: string
	model: AIModel
	system_prompt: string
	knowledge_source_group_id?: number
	top_k?: number
	temperature?: number
	max_tokens?: number
}

export interface UpdateAIAgentRequest {
	name?: string
	description?: string
	model?: AIModel
	system_prompt?: string
	knowledge_source_group_id?: number
	top_k?: number
	temperature?: number
	max_tokens?: number
}

export type GetAIAgentsParams = PaginationParams

// ===== Service Method Parameters =====
export interface AIAgentParams {
	agentId: number
}

// ===== AI Agent Configuration Constants =====
export const AI_MODELS = {
	GPT_4_MINI: "gpt-4.1-mini-2025-04-14",
} as const

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS]

export const AI_AGENT_LIMITS = {
	TOP_K: { min: 1, max: 50, default: 5 },
	TEMPERATURE: { min: 0, max: 100, default: 70 },
	MAX_TOKENS: { min: 100, max: 8000, default: 5000 },
} as const

// ===== AI Agent Tool Types =====
export interface AIAgentTool {
	name: string
	description: string
	type: "sqlQueryTool" | "semanticSearchTool" | "productDetailsTool"
}

// ===== Error Types =====
export interface AIAgentError {
	code:
		| "INVALID_INPUT"
		| "UNAUTHORIZED"
		| "AGENT_NOT_FOUND"
		| "INTERNAL_ERROR"
	message: string
}
