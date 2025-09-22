import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { metaKeys } from "@/queries/meta.query"
import { BE_URL } from "@/lib/constant"

interface MessageInsertedPayload {
	conversationId: string
}

type Connection = { es: EventSource; refCount: number }
const connectionPool = new Map<string, Connection>()

function getOrCreateConnection(pageId: string): EventSource {
	const existing = connectionPool.get(pageId)
	if (existing) {
		existing.refCount += 1
		return existing.es
	}
	const url = `${BE_URL}/meta/pages/${encodeURIComponent(pageId)}/sse`
	const es = new EventSource(url, { withCredentials: true })
	connectionPool.set(pageId, { es, refCount: 1 })
	return es
}

function releaseConnection(pageId: string) {
	const existing = connectionPool.get(pageId)
	if (!existing) return
	existing.refCount -= 1
	if (existing.refCount <= 0) {
		try {
			existing.es.close()
		} finally {
			connectionPool.delete(pageId)
		}
	}
}

/**
 * Subscribe to backend SSE for a specific pageId and invalidate queries
 * whenever a new message arrives. The backend emits events:
 * - event: "ready"                data: "ok"
 * - event: "keepalive"            data: "ping"
 * - event: "message-inserted"     data: { conversationId }
 */
export function useMetaSSE({
	pageId,
	enabled = true,
}: {
	pageId?: string
	enabled?: boolean
}) {
	const queryClient = useQueryClient()
	const esRef = useRef<EventSource | null>(null)

	useEffect(() => {
		if (!enabled || !pageId) return

		// Acquire a shared connection for this pageId
		const es = getOrCreateConnection(pageId)
		esRef.current = es

		const onReady = () => {
			// no-op; could set connection state here
		}

		const onKeepAlive = () => {
			// no-op
		}

		const onMessageInserted = (e: MessageEvent) => {
			try {
				const payload: MessageInsertedPayload = JSON.parse(e.data)
				if (payload?.conversationId) {
					// Invalidate the specific conversation's messages
					queryClient.invalidateQueries({
						queryKey: metaKeys.conversationMessages(
							pageId,
							payload.conversationId
						),
					})
					// Invalidate the page's conversation list (for last message/ordering)
					queryClient.invalidateQueries({
						queryKey: metaKeys.pageConversations(pageId),
					})
				}
			} catch (err) {
				console.error("Failed to parse SSE message payload", err)
			}
		}

		es.addEventListener("ready", onReady as EventListener)
		es.addEventListener("keepalive", onKeepAlive as EventListener)
		es.addEventListener(
			"message-inserted",
			onMessageInserted as EventListener
		)

		es.onerror = () => {
			// Let the browser/EventSource handle reconnection automatically
		}

		return () => {
			es.removeEventListener("ready", onReady as EventListener)
			es.removeEventListener("keepalive", onKeepAlive as EventListener)
			es.removeEventListener(
				"message-inserted",
				onMessageInserted as EventListener
			)
			// Release shared connection
			esRef.current = null
			if (pageId) releaseConnection(pageId)
		}
	}, [enabled, pageId, queryClient])
}
