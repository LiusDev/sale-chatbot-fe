import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
	// AI Agent types
	GetAIAgentsParams,
	CreateAIAgentRequest,
	UpdateAIAgentRequest,
	AIAgentParams,

	// Chat types
	SendMessageRequest,

	// Enhance Prompt types
	EnhanceSystemPromptRequest,
} from "@/types/ai.type"
import aiService from "@/services/ai.service"

// ===== Query Keys Factory =====
export const aiQueryKeys = {
	all: ["ai"] as const,
	agents: () => [...aiQueryKeys.all, "agents"] as const,
	agent: (id: number) => [...aiQueryKeys.agents(), id] as const,
	agentsList: (params?: GetAIAgentsParams) =>
		[...aiQueryKeys.agents(), "list", params] as const,

	chats: () => [...aiQueryKeys.all, "chats"] as const,
	chatSession: (agentId: number, sessionId?: string) =>
		[...aiQueryKeys.chats(), agentId, sessionId] as const,
}

// ===== AI Agents Queries =====

/**
 * Get AI agents with pagination and search
 */
export const useGetAIAgents = (params: GetAIAgentsParams = {}) => {
	return useQuery({
		queryKey: aiQueryKeys.agentsList(params),
		queryFn: () => aiService.getAIAgents(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

/**
 * Get single AI agent
 */
export const useGetAIAgent = (
	params: AIAgentParams,
	options?: { enabled?: boolean }
) => {
	return useQuery({
		queryKey: aiQueryKeys.agent(params.agentId),
		queryFn: () => aiService.getAIAgent(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: options?.enabled ?? true,
	})
}

/**
 * Create AI agent mutation
 */
export const useCreateAIAgent = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateAIAgentRequest) =>
			aiService.createAIAgent(data),
		onSuccess: () => {
			// Invalidate AI agents list
			queryClient.invalidateQueries({
				queryKey: aiQueryKeys.agents(),
			})
		},
	})
}

/**
 * Update AI agent mutation
 */
export const useUpdateAIAgent = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			params,
			data,
		}: {
			params: AIAgentParams
			data: UpdateAIAgentRequest
		}) => aiService.updateAIAgent(params, data),
		onSuccess: (_, variables) => {
			// Invalidate specific agent and agents list
			queryClient.invalidateQueries({
				queryKey: aiQueryKeys.agent(variables.params.agentId),
			})
			queryClient.invalidateQueries({
				queryKey: aiQueryKeys.agents(),
			})
		},
	})
}

/**
 * Delete AI agent mutation
 */
export const useDeleteAIAgent = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (params: AIAgentParams) => aiService.deleteAIAgent(params),
		onSuccess: (_, variables) => {
			// Remove from cache and invalidate agents list
			queryClient.removeQueries({
				queryKey: aiQueryKeys.agent(variables.agentId),
			})
			queryClient.invalidateQueries({
				queryKey: aiQueryKeys.agents(),
			})
		},
	})
}

// ===== Chat/Conversation Mutations =====

/**
 * Send message to AI agent mutation
 */
export const useSendMessage = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			params,
			data,
		}: {
			params: AIAgentParams
			data: SendMessageRequest
		}) => aiService.sendMessage(params, data),
		onSuccess: (_, variables) => {
			// Invalidate chat sessions for this agent
			queryClient.invalidateQueries({
				queryKey: aiQueryKeys.chatSession(variables.params.agentId),
			})
		},
	})
}

/**
 * Send streaming message to AI agent mutation
 * Note: For streaming, you might want to handle the response differently
 * This is a basic setup - you'll need to implement proper streaming handling
 */
export const useSendMessageStream = () => {
	return useMutation({
		mutationFn: ({
			params,
			data,
		}: {
			params: AIAgentParams
			data: SendMessageRequest
		}) => aiService.sendMessageStream(params, data),
	})
}

// ===== Prefetch Helpers =====

/**
 * Prefetch AI agents
 */
export const usePrefetchAIAgents = () => {
	const queryClient = useQueryClient()

	return (params: GetAIAgentsParams = {}) => {
		queryClient.prefetchQuery({
			queryKey: aiQueryKeys.agentsList(params),
			queryFn: () => aiService.getAIAgents(params),
			staleTime: 5 * 60 * 1000,
		})
	}
}

/**
 * Prefetch single AI agent
 */
export const usePrefetchAIAgent = () => {
	const queryClient = useQueryClient()

	return (params: AIAgentParams) => {
		queryClient.prefetchQuery({
			queryKey: aiQueryKeys.agent(params.agentId),
			queryFn: () => aiService.getAIAgent(params),
			staleTime: 5 * 60 * 1000,
		})
	}
}

// ===== Enhance System Prompt =====

/**
 * Enhance system prompt mutation
 */
export const useEnhanceSystemPrompt = () => {
	return useMutation({
		mutationFn: (data: EnhanceSystemPromptRequest) =>
			aiService.enhanceSystemPrompt(data),
	})
}
