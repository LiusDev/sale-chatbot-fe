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
 * Hook to get a specific page by ID
 */
export const usePageById = (pageId: string) => {
	return useQuery({
		queryKey: metaKeys.page(pageId),
		queryFn: () => metaService.getPageById(pageId),
		enabled: !!pageId,
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
