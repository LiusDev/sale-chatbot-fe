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
	systemPrompt: string
	knowledgeSourceGroupId?: number
	topK?: number
	temperature?: number
	maxTokens?: number
}

export interface UpdateAIAgentRequest {
	name?: string
	description?: string
	model?: AIModel
	systemPrompt?: string
	knowledgeSourceGroupId?: number
	topK?: number
	temperature?: number
	maxTokens?: number
}

export type GetAIAgentsParams = PaginationParams

// ===== Service Method Parameters =====
export interface AIAgentParams {
	agentId: number
}

// ===== AI Model Configuration =====
export type AIModel = "gpt-4.1-mini-2025-04-14"

export interface AIModelConfig {
	name: AIModel
	displayName: string
	maxTokens: number
	description?: string
}

export const AI_MODELS: AIModelConfig[] = [
	{
		name: "gpt-4.1-mini-2025-04-14",
		displayName: "GPT-4.1 Mini",
		maxTokens: 8000,
		description: "Mô hình AI có khả năng tư vấn sản phẩm thông minh",
	},
]

// ===== Temperature and Parameter Ranges =====
export const AI_PARAMETER_RANGES = {
	temperature: { min: 0, max: 100, default: 70 },
	topK: { min: 1, max: 50, default: 5 },
	maxTokens: { min: 100, max: 4000, default: 1000 },
} as const

// ===== Chat/Conversation Types =====
export interface ChatMessage {
	role: "user" | "assistant" | "system"
	content: string
	timestamp?: string
}

export interface ChatSession {
	id: string
	agentId: number
	messages: ChatMessage[]
	created_at: string
	updated_at: string
}

export interface SendMessageRequest {
	message: string
	sessionId?: string
}

export interface SendMessageResponse {
	message: ChatMessage
	sessionId: string
}

// ===== Enhance System Prompt Types =====
export interface EnhanceSystemPromptRequest {
	prompt: string
}

export interface EnhanceSystemPromptResponse {
	enhancedPrompt: string
}
