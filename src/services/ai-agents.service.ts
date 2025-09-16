import type {
	// AI Agent types
	GetAIAgentsParams,
	AIAgent,
	CreateAIAgentRequest,
	UpdateAIAgentRequest,
	
	// Parameter types
	AIAgentParams,
} from "@/types/ai-agents.type"
import type { ApiResponse } from "@/types/common.type"
import { BaseApi } from "./base-api"

const AI_PREFIX = "ai"

class AIAgentsService extends BaseApi {
	constructor() {
		super()
	}

	// ===== AI Agents API =====

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
	 * GET /ai/{agentId}
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
	 * PUT /ai/{agentId}
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
	 * DELETE /ai/{agentId}
	 */
	async deleteAIAgent({ agentId }: AIAgentParams) {
		return this.api
			.delete(`${AI_PREFIX}/${agentId}`)
			.json<ApiResponse<{ message: string }>>()
	}
}

const aiAgentsService = new AIAgentsService()
export default aiAgentsService
