import type {
	// AI Agent types
	GetAIAgentsParams,
	AIAgent,
	CreateAIAgentRequest,
	UpdateAIAgentRequest,
	AIAgentParams,

	// Chat types
	SendMessageRequest,
	SendMessageResponse,
} from "@/types/ai.type"
import type { ApiResponse } from "@/types/common.type"
import { BaseApi } from "./base-api"

const AI_PREFIX = "ai"

class AIService extends BaseApi {
	constructor() {
		super()
	}

	// ===== AI Agents CRUD =====

	/**
	 * Get all AI agents with pagination and search
	 * GET /ai
	 */
	async getAIAgents(params: GetAIAgentsParams = {}) {
		const searchParams = this.createSearchParams(params)
		return this.api
			.get(AI_PREFIX, { searchParams })
			.json<ApiResponse<AIAgent[]>>()
	}

	/**
	 * Get single AI agent by ID
	 * GET /ai/:agentId
	 */
	async getAIAgent({ agentId }: AIAgentParams) {
		return this.api
			.get(`${AI_PREFIX}/${agentId}`)
			.json<ApiResponse<AIAgent>>()
	}

	/**
	 * Create a new AI agent
	 * POST /ai
	 */
	async createAIAgent(data: CreateAIAgentRequest) {
		return this.api
			.post(AI_PREFIX, { json: data })
			.json<ApiResponse<AIAgent>>()
	}

	/**
	 * Update an AI agent
	 * PUT /ai/:agentId
	 */
	async updateAIAgent(
		{ agentId }: AIAgentParams,
		data: UpdateAIAgentRequest
	) {
		return this.api
			.put(`${AI_PREFIX}/${agentId}`, { json: data })
			.json<ApiResponse<AIAgent>>()
	}

	/**
	 * Delete an AI agent
	 * DELETE /ai/:agentId
	 */
	async deleteAIAgent({ agentId }: AIAgentParams) {
		return this.api
			.delete(`${AI_PREFIX}/${agentId}`)
			.json<ApiResponse<{ message: string }>>()
	}

	// ===== Chat/Conversation Methods =====

	/**
	 * Send a message to an AI agent
	 * POST /ai/:agentId/chat
	 */
	async sendMessage({ agentId }: AIAgentParams, data: SendMessageRequest) {
		return this.api
			.post(`${AI_PREFIX}/${agentId}/chat`, { json: data })
			.json<ApiResponse<SendMessageResponse>>()
	}

	/**
	 * Stream a message to an AI agent (for real-time responses)
	 * POST /ai/:agentId/chat/stream
	 */
	async sendMessageStream(
		{ agentId }: AIAgentParams,
		data: SendMessageRequest
	): Promise<ReadableStream<Uint8Array>> {
		const response = await this.api.post(
			`${AI_PREFIX}/${agentId}/chat/stream`,
			{
				json: data,
			}
		)

		if (!response.body) {
			throw new Error("No response body for streaming")
		}

		return response.body
	}
}

const aiService = new AIService()
export default aiService
