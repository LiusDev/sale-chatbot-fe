import { useState } from "react"
import type { MetaPagesParams, UpsertMetaPagesRequest } from "@/types/meta.type"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import metaService from "@/services/meta.service"

// Query Keys
export const metaKeys = {
	all: ["meta"] as const,
	fanpages: () => [...metaKeys.all, "fanpages"] as const,
	pages: () => [...metaKeys.all, "pages"] as const,
	page: (id: string) => [...metaKeys.pages(), id] as const,
	conversations: () => [...metaKeys.all, "conversations"] as const,
	pageConversations: (pageId: string) =>
		[...metaKeys.conversations(), "page", pageId] as const,
	conversationMessages: (pageId: string, conversationId: string) =>
		[
			...metaKeys.conversations(),
			"page",
			pageId,
			"conversation",
			conversationId,
		] as const,
	webhooks: () => [...metaKeys.all, "webhooks"] as const,
}

/**
 * Hook to get fanpages from Meta API
 * Fetches real-time data directly from Meta Graph API
 */
export const useMetaFanpages = () => {
	return useQuery({
		queryKey: metaKeys.fanpages(),
		queryFn: () => metaService.getMetaFanpages(),
	})
}

/**
 * Hook to get stored pages from database
 * Returns local data with pagination support
 */
export const useStoredPages = (params?: MetaPagesParams) => {
	return useQuery({
		queryKey: [...metaKeys.pages(), params],
		queryFn: () => metaService.getStoredPages(params),
	})
}

/**
 * Hook to upsert Meta pages to database
 * Automatically invalidates and refetches related queries
 */
export const useUpsertMetaPages = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (pages: UpsertMetaPagesRequest[]) =>
			metaService.upsertMetaPages(pages),
		onSuccess: () => {
			// Invalidate and refetch stored pages queries
			queryClient.invalidateQueries({ queryKey: metaKeys.pages() })
		},
		onError: (error) => {
			console.error("Failed to upsert Meta pages:", error)
		},
	})
}

/**
 * Hook to sync Meta fanpages to database
 * Fetches from Meta API and syncs to database in one operation
 */
export const useSyncMetaPages = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: () => metaService.syncMetaPages(),
		onSuccess: () => {
			// Invalidate both fanpages and stored pages queries
			queryClient.invalidateQueries({ queryKey: metaKeys.fanpages() })
			queryClient.invalidateQueries({ queryKey: metaKeys.pages() })
		},
		onError: (error) => {
			console.error("Failed to sync Meta pages:", error)
		},
	})
}

/**
 * Hook to delete a page from database
 */
export const useDeletePage = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (pageId: string) => metaService.deletePage(pageId),
		onSuccess: (_, pageId) => {
			// Remove the specific page from cache
			queryClient.removeQueries({ queryKey: metaKeys.page(pageId) })
			// Invalidate stored pages list
			queryClient.invalidateQueries({ queryKey: metaKeys.pages() })
		},
		onError: (error) => {
			console.error("Failed to delete page:", error)
		},
	})
}

/**
 * Hook to get Meta fanpages with optimistic updates
 * Provides immediate UI feedback while API call is in progress
 */
export const useMetaFanpagesWithOptimisticUpdate = () => {
	const queryClient = useQueryClient()
	const syncMutation = useSyncMetaPages()

	const optimisticSync = () => {
		// Cancel outgoing refetches
		queryClient.cancelQueries({ queryKey: metaKeys.fanpages() })
		queryClient.cancelQueries({ queryKey: metaKeys.pages() })

		// Snapshot the previous values
		const previousFanpages = queryClient.getQueryData(metaKeys.fanpages())
		const previousPages = queryClient.getQueryData(metaKeys.pages())

		// Optimistically mark as syncing
		queryClient.setQueryData(metaKeys.fanpages(), (old: any) => {
			if (!old?.success) return old
			return {
				...old,
				data: old.data.map((page: any) => ({
					...page,
					_syncing: true,
				})),
			}
		})

		// Return context object with snapshotted values
		return { previousFanpages, previousPages }
	}

	const rollback = (context: {
		previousFanpages: any
		previousPages: any
	}) => {
		queryClient.setQueryData(metaKeys.fanpages(), context.previousFanpages)
		queryClient.setQueryData(metaKeys.pages(), context.previousPages)
	}

	const syncWithOptimisticUpdate = () => {
		const context = optimisticSync()

		return syncMutation.mutateAsync(undefined, {
			onError: () => {
				rollback(context)
			},
		})
	}

	return {
		...syncMutation,
		syncWithOptimisticUpdate,
	}
}

/**
 * Hook to get both Meta fanpages and stored pages
 * Useful for comparison views
 */
export const useMetaPagesComparison = (params?: MetaPagesParams) => {
	const fanpagesQuery = useMetaFanpages()
	const storedPagesQuery = useStoredPages(params)

	return {
		fanpages: fanpagesQuery,
		storedPages: storedPagesQuery,
		isLoading: fanpagesQuery.isLoading || storedPagesQuery.isLoading,
		isError: fanpagesQuery.isError || storedPagesQuery.isError,
		error: fanpagesQuery.error || storedPagesQuery.error,
	}
}

/**
 * Hook to get Meta pages with pagination
 * Provides pagination controls and data
 */
export const useMetaPagesWithPagination = (initialParams?: MetaPagesParams) => {
	const [params, setParams] = useState<MetaPagesParams>({
		page: 1,
		limit: 10,
		...initialParams,
	})

	const query = useStoredPages(params)

	const pagination = {
		currentPage: params.page || 1,
		pageSize: params.limit || 10,
		total: query.data?.meta?.total || 0,
		totalPages: Math.ceil(
			(query.data?.meta?.total || 0) / (params.limit || 10)
		),
	}

	const setPage = (page: number) => {
		setParams((prev) => ({ ...prev, page }))
	}

	const setPageSize = (limit: number) => {
		setParams((prev) => ({ ...prev, limit, page: 1 }))
	}

	const nextPage = () => {
		if (pagination.currentPage < pagination.totalPages) {
			setPage(pagination.currentPage + 1)
		}
	}

	const prevPage = () => {
		if (pagination.currentPage > 1) {
			setPage(pagination.currentPage - 1)
		}
	}

	return {
		...query,
		pagination,
		setPage,
		setPageSize,
		nextPage,
		prevPage,
		canGoNext: pagination.currentPage < pagination.totalPages,
		canGoPrev: pagination.currentPage > 1,
	}
}

/**
 * Hook to sync page conversations from Meta API to database
 * Automatically invalidates and refetches related queries
 */
export const useSyncPageConversations = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (pageId: string) =>
			metaService.syncPageConversations(pageId),
		onSuccess: (_, pageId) => {
			// Invalidate conversations for this page
			queryClient.invalidateQueries({
				queryKey: metaKeys.pageConversations(pageId),
			})
			// Invalidate all conversations queries
			queryClient.invalidateQueries({
				queryKey: metaKeys.conversations(),
			})
		},
		onError: (error) => {
			console.error("Failed to sync page conversations:", error)
		},
	})
}

/**
 * Hook to sync page conversations with optimistic updates
 * Provides immediate UI feedback while API call is in progress
 */
export const useSyncPageConversationsWithOptimisticUpdate = () => {
	const queryClient = useQueryClient()
	const syncMutation = useSyncPageConversations()

	const optimisticSync = (pageId: string) => {
		// Cancel outgoing refetches
		queryClient.cancelQueries({
			queryKey: metaKeys.pageConversations(pageId),
		})
		queryClient.cancelQueries({
			queryKey: metaKeys.conversations(),
		})

		// Snapshot the previous values
		const previousConversations = queryClient.getQueryData(
			metaKeys.pageConversations(pageId)
		)

		// Optimistically mark as syncing
		queryClient.setQueryData(
			metaKeys.pageConversations(pageId),
			(old: any) => {
				if (!old?.success) return old
				return {
					...old,
					data: old.data.map((conversation: any) => ({
						...conversation,
						_syncing: true,
					})),
				}
			}
		)

		// Return context object with snapshotted values
		return { previousConversations }
	}

	const rollback = (
		pageId: string,
		context: { previousConversations: any }
	) => {
		queryClient.setQueryData(
			metaKeys.pageConversations(pageId),
			context.previousConversations
		)
	}

	const syncWithOptimisticUpdate = (pageId: string) => {
		const context = optimisticSync(pageId)

		return syncMutation.mutateAsync(pageId, {
			onError: () => {
				rollback(pageId, context)
			},
		})
	}

	return {
		...syncMutation,
		syncWithOptimisticUpdate,
	}
}

/**
 * Hook to get page conversations from database
 * Useful for displaying conversations list
 */
export const usePageConversations = (pageId: string) => {
	return useQuery({
		queryKey: metaKeys.pageConversations(pageId),
		queryFn: () => metaService.getPageConversations({ pageId }),
		enabled: !!pageId,
		// Cache for 5 minutes
		staleTime: 5 * 60 * 1000,
		// Keep in cache for 10 minutes
		gcTime: 10 * 60 * 1000,
	})
}

// ===== New Query Hooks for Conversations =====

/**
 * Hook to get conversation messages from database
 * Messages are sorted by creation time in descending order
 */
export const useConversationMessages = (
	pageId: string,
	conversationId: string
) => {
	return useQuery({
		queryKey: metaKeys.conversationMessages(pageId, conversationId),
		queryFn: () =>
			metaService.getConversationMessages({ pageId, conversationId }),
		enabled: !!pageId && !!conversationId,
		// Cache for 2 minutes (messages change more frequently)
		staleTime: 2 * 60 * 1000,
		// Keep in cache for 5 minutes
		gcTime: 5 * 60 * 1000,
	})
}

/**
 * Hook to send a message to a conversation
 * Automatically invalidates and refetches conversation messages
 */
export const useSendMessageToConversation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			pageId,
			conversationId,
			message,
		}: {
			pageId: string
			conversationId: string
			message: string
		}) =>
			metaService.sendMessageToConversation(
				{ pageId, conversationId },
				{ message }
			),
		onSuccess: (_, { pageId, conversationId }) => {
			// Invalidate and refetch conversation messages
			queryClient.invalidateQueries({
				queryKey: metaKeys.conversationMessages(pageId, conversationId),
			})
			// Also invalidate page conversations to update last message info
			queryClient.invalidateQueries({
				queryKey: metaKeys.pageConversations(pageId),
			})
		},
		onError: (error) => {
			console.error("Failed to send message:", error)
		},
	})
}

// ===== Webhook Query Hooks =====

/**
 * Hook to verify Meta webhook
 * Used during webhook setup process
 */
export const useVerifyWebhook = () => {
	return useMutation({
		mutationFn: (params: {
			"hub.mode": string
			"hub.challenge": string
			"hub.verify_token": string
		}) => metaService.verifyWebhook(params),
		onError: (error) => {
			console.error("Failed to verify webhook:", error)
		},
	})
}

/**
 * Hook to handle webhook events
 * Used for processing incoming Meta webhook events
 */
export const useHandleWebhookEvent = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			payload,
			signature,
		}: {
			payload: any
			signature?: string
		}) => metaService.handleWebhookEvent(payload, signature),
		onSuccess: () => {
			// Invalidate conversations and messages queries
			// since webhook events might contain new messages
			queryClient.invalidateQueries({
				queryKey: metaKeys.conversations(),
			})
		},
		onError: (error) => {
			console.error("Failed to handle webhook event:", error)
		},
	})
}

// ===== Combined Query Hooks =====

/**
 * Hook to get page conversations with messages
 * Combines conversations and their latest messages
 */
export const usePageConversationsWithMessages = (pageId: string) => {
	const conversationsQuery = usePageConversations(pageId)

	// Get the first conversation's messages for preview
	const firstConversation = conversationsQuery.data?.data?.[0]
	const messagesQuery = useConversationMessages(
		pageId,
		firstConversation?.id || ""
	)

	return {
		conversations: conversationsQuery,
		messages: messagesQuery,
		isLoading: conversationsQuery.isLoading,
		isError: conversationsQuery.isError || messagesQuery.isError,
		error: conversationsQuery.error || messagesQuery.error,
	}
}

/**
 * Hook for real-time conversation management
 * Provides optimistic updates for sending messages
 */
export const useConversationWithOptimisticUpdates = (
	pageId: string,
	conversationId: string
) => {
	const queryClient = useQueryClient()
	const sendMessageMutation = useSendMessageToConversation()
	const messagesQuery = useConversationMessages(pageId, conversationId)

	const sendMessageWithOptimisticUpdate = (message: string) => {
		// Cancel outgoing refetches
		queryClient.cancelQueries({
			queryKey: metaKeys.conversationMessages(pageId, conversationId),
		})

		// Snapshot the previous value
		const previousMessages = queryClient.getQueryData(
			metaKeys.conversationMessages(pageId, conversationId)
		)

		// Optimistically add the message
		queryClient.setQueryData(
			metaKeys.conversationMessages(pageId, conversationId),
			(old: any) => {
				if (!old?.success) return old

				const optimisticMessage = {
					id: `temp_${Date.now()}`,
					conversation_id: conversationId,
					created_time: new Date().toISOString(),
					message,
					from: JSON.stringify({
						name: "You", // This should come from user context
						id: pageId, // Message from the page (assistant)
					}),
					attachments: null,
					_optimistic: true, // Mark as optimistic
				}

				return {
					...old,
					data: [optimisticMessage, ...old.data],
					meta: {
						...old.meta,
						total: old.meta.total + 1,
					},
				}
			}
		)

		// Send the message
		return sendMessageMutation.mutateAsync(
			{
				pageId,
				conversationId,
				message,
			},
			{
				onError: () => {
					// Rollback on error
					queryClient.setQueryData(
						metaKeys.conversationMessages(pageId, conversationId),
						previousMessages
					)
				},
			}
		)
	}

	return {
		messages: messagesQuery,
		sendMessage: sendMessageMutation,
		sendMessageWithOptimisticUpdate,
		isSending: sendMessageMutation.isPending,
	}
}
