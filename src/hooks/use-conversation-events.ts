import { useEffect, useRef, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { metaKeys } from "@/queries/meta.query"
import { toast } from "sonner"

interface ConversationEvent {
	type: "message" | "conversation" | "error"
	data: any
	timestamp: string
}

interface UseConversationEventsProps {
	pageId: string
	conversationId?: string
	enabled?: boolean
	onMessage?: (data: any) => void
	onConversation?: (data: any) => void
	onError?: (error: Event) => void
}

export const useConversationEvents = ({
	pageId,
	conversationId,
	enabled = true,
	onMessage,
	onConversation,
	onError,
}: UseConversationEventsProps) => {
	const queryClient = useQueryClient()
	const eventSourceRef = useRef<EventSource | null>(null)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const reconnectAttempts = useRef(0)
	const maxReconnectAttempts = 5

	// Cleanup function
	const cleanup = useCallback(() => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close()
			eventSourceRef.current = null
		}
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current)
			reconnectTimeoutRef.current = null
		}
	}, [])

	// Reconnect function
	const reconnect = useCallback(() => {
		if (reconnectAttempts.current >= maxReconnectAttempts) {
			console.error("Max reconnection attempts reached")
			toast.error("Connection lost. Please refresh the page.")
			return
		}

		reconnectAttempts.current += 1
		const delay = Math.min(
			1000 * Math.pow(2, reconnectAttempts.current),
			30000
		) // Exponential backoff, max 30s

		reconnectTimeoutRef.current = setTimeout(() => {
			console.log(
				`Reconnecting... (attempt ${reconnectAttempts.current})`
			)
			// Re-initialize the connection
			cleanup()
			setTimeout(() => {
				// This will trigger the useEffect to reconnect
				reconnectAttempts.current = 0
			}, 100)
		}, delay)
	}, [cleanup])

	// Handle incoming events
	const handleEvent = useCallback(
		(event: MessageEvent) => {
			try {
				const eventData: ConversationEvent = JSON.parse(event.data)

				switch (eventData.type) {
					case "message":
						// Invalidate conversation messages
						if (conversationId) {
							queryClient.invalidateQueries({
								queryKey: metaKeys.conversationMessages(
									pageId,
									conversationId
								),
							})
						}

						// Invalidate page conversations to update last message info
						queryClient.invalidateQueries({
							queryKey: metaKeys.pageConversations(pageId),
						})

						onMessage?.(eventData.data)
						break

					case "conversation":
						// Invalidate page conversations
						queryClient.invalidateQueries({
							queryKey: metaKeys.pageConversations(pageId),
						})

						onConversation?.(eventData.data)
						break

					case "error":
						console.error("SSE Error:", eventData.data)
						toast.error("Connection error occurred")
						break

					default:
						console.warn("Unknown event type:", eventData.type)
				}
			} catch (error) {
				console.error("Error parsing SSE event:", error)
			}
		},
		[queryClient, pageId, conversationId, onMessage, onConversation]
	)

	// Initialize EventSource connection
	useEffect(() => {
		if (!enabled || !pageId) return

		const url = new URL("/meta/events", window.location.origin)
		url.searchParams.set("pageId", pageId)
		if (conversationId) {
			url.searchParams.set("conversationId", conversationId)
		}

		// Cleanup previous connection
		cleanup()

		// Create new EventSource
		const eventSource = new EventSource(url.toString())
		eventSourceRef.current = eventSource

		// Event handlers
		eventSource.onopen = () => {
			console.log("SSE connection opened")
			reconnectAttempts.current = 0
		}

		eventSource.onmessage = handleEvent

		eventSource.onerror = (error) => {
			console.error("SSE connection error:", error)
			onError?.(error)

			// Attempt to reconnect if connection was lost
			if (eventSource.readyState === EventSource.CLOSED) {
				reconnect()
			}
		}

		// Cleanup on unmount or dependency change
		return cleanup
	}, [
		enabled,
		pageId,
		conversationId,
		handleEvent,
		onError,
		cleanup,
		reconnect,
	])

	// Cleanup on unmount
	useEffect(() => {
		return cleanup
	}, [cleanup])

	// Return connection status and manual controls
	return {
		isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
		reconnect: () => {
			reconnectAttempts.current = 0
			cleanup()
		},
		disconnect: cleanup,
	}
}
