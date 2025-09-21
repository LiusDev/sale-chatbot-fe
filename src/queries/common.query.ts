import type { AppInfoUpdate } from "@/types/common.type"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import commonService from "@/services/common.service"

// Query Keys
export const commonKeys = {
	all: ["common"] as const,
	appInfo: () => [...commonKeys.all, "appInfo"] as const,
}

/**
 * Hook to get app configuration information
 * Private fields are masked with ********
 */
export const useAppInfo = () => {
	return useQuery({
		queryKey: commonKeys.appInfo(),
		queryFn: () => commonService.getAppInfo(),
	})
}

/**
 * Hook to update app configuration information
 * Automatically invalidates and refetches related queries
 */
export const useUpdateAppInfo = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (updates: AppInfoUpdate) =>
			commonService.updateAppInfo(updates),
		onSuccess: () => {
			// Invalidate and refetch app info queries
			queryClient.invalidateQueries({ queryKey: commonKeys.appInfo() })
		},
		onError: (error) => {
			console.error("Failed to update app info:", error)
		},
	})
}

/**
 * Hook to update specific app info field
 * Convenience wrapper around useUpdateAppInfo
 */
export const useUpdateAppInfoField = () => {
	const updateMutation = useUpdateAppInfo()

	const updateField = <K extends keyof AppInfoUpdate>(
		field: K,
		value: AppInfoUpdate[K]
	) => {
		return updateMutation.mutateAsync({ [field]: value } as AppInfoUpdate)
	}

	return {
		...updateMutation,
		updateField,
	}
}

/**
 * Hook to get app info with optimistic updates
 * Provides immediate UI feedback while API call is in progress
 */
export const useAppInfoWithOptimisticUpdate = () => {
	const queryClient = useQueryClient()
	const updateMutation = useUpdateAppInfo()

	const optimisticUpdate = (updates: AppInfoUpdate) => {
		// Cancel outgoing refetches
		queryClient.cancelQueries({ queryKey: commonKeys.appInfo() })

		// Snapshot the previous value
		const previousAppInfo = queryClient.getQueryData(commonKeys.appInfo())

		// Optimistically update to the new value
		queryClient.setQueryData(commonKeys.appInfo(), (old: any) => {
			if (!old?.success) return old
			return {
				...old,
				data: {
					...old.data,
					...updates,
				},
			}
		})

		// Return a context object with the snapshotted value
		return { previousAppInfo }
	}

	const rollback = (context: { previousAppInfo: any }) => {
		queryClient.setQueryData(commonKeys.appInfo(), context.previousAppInfo)
	}

	const mutateWithOptimisticUpdate = (updates: AppInfoUpdate) => {
		const context = optimisticUpdate(updates)

		return updateMutation.mutateAsync(updates, {
			onError: () => {
				rollback(context)
			},
		})
	}

	return {
		...updateMutation,
		mutateWithOptimisticUpdate,
	}
}

/**
 * Hook to generate new webhook verify key
 * Automatically invalidates and refetches app info queries
 */
export const useGenerateWebhookVerifyKey = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: () => commonService.generateWebhookVerifyKey(),
		onSuccess: (response) => {
			// Update the app info with the new webhook verify key
			queryClient.setQueryData(commonKeys.appInfo(), (old: any) => {
				if (!old?.success) return old
				return {
					...old,
					data: {
						...old.data,
						metaWebhookVerifyKey: response.data,
					},
				}
			})
		},
		onError: (error) => {
			console.error("Failed to generate webhook verify key:", error)
		},
	})
}
