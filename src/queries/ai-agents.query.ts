import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
	// AI Agent types
	GetAIAgentsParams,
	CreateAIAgentRequest,
	UpdateAIAgentRequest,
	AIAgentParams,
} from "@/types/ai-agents.type"
import aiAgentsService from "@/services/ai-agents.service"

// ===== Query Keys Factory =====
export const aiAgentsQueryKeys = {
	all: ["ai-agents"] as const,
	lists: () => [...aiAgentsQueryKeys.all, "list"] as const,
	list: (params?: GetAIAgentsParams) =>
		[...aiAgentsQueryKeys.lists(), params] as const,
	details: () => [...aiAgentsQueryKeys.all, "detail"] as const,
	detail: (id: number) => [...aiAgentsQueryKeys.details(), id] as const,
}

// ===== AI Agents Queries =====

/**
 * Get all AI agents with pagination and search
 */
export const useGetAIAgents = (params: GetAIAgentsParams = {}) => {
	return useQuery({
		queryKey: aiAgentsQueryKeys.list(params),
		queryFn: () => aiAgentsService.getAIAgents(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

/**
 * Get single AI agent by ID
 */
export const useGetAIAgent = (params: AIAgentParams) => {
	return useQuery({
		queryKey: aiAgentsQueryKeys.detail(params.agentId),
		queryFn: () => aiAgentsService.getAIAgent(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

// ===== AI Agents Mutations =====

/**
 * Create AI agent mutation
 */
export const useCreateAIAgent = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateAIAgentRequest) =>
			aiAgentsService.createAIAgent(data),
		onSuccess: () => {
			// Invalidate AI agents list
			queryClient.invalidateQueries({
				queryKey: aiAgentsQueryKeys.lists(),
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
		}) => aiAgentsService.updateAIAgent(params, data),
		onSuccess: (_, variables) => {
			// Invalidate specific agent and agents list
			queryClient.invalidateQueries({
				queryKey: aiAgentsQueryKeys.detail(variables.params.agentId),
			})
			queryClient.invalidateQueries({
				queryKey: aiAgentsQueryKeys.lists(),
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
		mutationFn: (params: AIAgentParams) =>
			aiAgentsService.deleteAIAgent(params),
		onSuccess: (_, variables) => {
			// Remove from cache and invalidate agents list
			queryClient.removeQueries({
				queryKey: aiAgentsQueryKeys.detail(variables.agentId),
			})
			queryClient.invalidateQueries({
				queryKey: aiAgentsQueryKeys.lists(),
			})
		},
	})
}

// ===== Prefetch Helpers =====

/**
 * Prefetch AI agents list
 */
export const usePrefetchAIAgents = () => {
	const queryClient = useQueryClient()

	return (params: GetAIAgentsParams = {}) => {
		queryClient.prefetchQuery({
			queryKey: aiAgentsQueryKeys.list(params),
			queryFn: () => aiAgentsService.getAIAgents(params),
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
			queryKey: aiAgentsQueryKeys.detail(params.agentId),
			queryFn: () => aiAgentsService.getAIAgent(params),
			staleTime: 5 * 60 * 1000,
		})
	}
}
