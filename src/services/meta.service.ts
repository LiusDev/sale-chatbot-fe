import type {
	MetaFanpagesResponse,
	MetaPagesResponse,
	UpsertMetaPagesRequest,
	UpsertMetaPagesResponse,
	DeleteMetaPageResponse,
	MetaPagesParams,
	SyncPageConversationsResponse,
	GetPageConversationsResponse,
	GetConversationMessagesResponse,
	SendMessageRequest,
	SendMessageResponse,
	WebhookEventResponse,
	GetPageConversationsParams,
	GetConversationMessagesParams,
	SendMessageParams,
} from "@/types/meta.type"
import { BaseApi } from "./base-api"

const GROUP_PREFIX = "meta"

class MetaService extends BaseApi {
	constructor() {
		super()
	}

	/**
	 * Get fanpages from Meta API
	 * Fetches real-time data directly from Meta Graph API
	 */
	async getMetaFanpages() {
		return this.api
			.get(`${GROUP_PREFIX}/meta-pages`)
			.json<MetaFanpagesResponse>()
	}

	/**
	 * Get stored pages from database
	 * Returns local data that may differ from real-time Meta API data
	 */
	async getStoredPages(params?: MetaPagesParams) {
		const searchParams = params
			? this.createSearchParams(params)
			: undefined
		const url = searchParams
			? `${GROUP_PREFIX}/pages?${searchParams.toString()}`
			: `${GROUP_PREFIX}/pages`

		return this.api.get(url).json<MetaPagesResponse>()
	}

	/**
	 * Upsert Meta pages to database
	 * Creates new pages or updates existing ones based on page_id
	 * @param pages - Array of pages to upsert
	 */
	async upsertMetaPages(pages: UpsertMetaPagesRequest[]) {
		return this.api
			.patch(`${GROUP_PREFIX}/pages`, {
				json: pages,
			})
			.json<UpsertMetaPagesResponse>()
	}

	/**
	 * Sync Meta fanpages to database
	 * Convenience method that fetches from Meta API and syncs to database
	 */
	async syncMetaPages() {
		// First, get fanpages from Meta API
		const fanpagesResponse = await this.getMetaFanpages()

		// Transform the data to match upsert format
		const pagesToSync: UpsertMetaPagesRequest[] = fanpagesResponse.data.map(
			(page) => ({
				id: page.id,
				name: page.name,
				accessToken: page.accessToken,
				category: page.category,
			})
		)

		// Upsert to database
		return this.upsertMetaPages(pagesToSync)
	}

	/**
	 * Delete a page from database
	 * @param pageId - The Meta page ID
	 */
	async deletePage(pageId: string) {
		return this.api
			.delete(`${GROUP_PREFIX}/pages/${pageId}`)
			.json<DeleteMetaPageResponse>()
	}

	/**
	 * Sync page conversations from Meta API to database
	 * Fetches conversations and messages from Meta API and stores them in database
	 * @param pageId - The Meta page ID
	 */
	async syncPageConversations(pageId: string) {
		return this.api
			.patch(`${GROUP_PREFIX}/pages/${pageId}/sync`)
			.json<SyncPageConversationsResponse>()
	}

	// ===== Webhook Endpoints =====

	/**
	 * Webhook verification endpoint for Meta webhook setup
	 * Meta calls this endpoint to verify the webhook URL
	 * @param params - Query parameters for webhook verification
	 */
	async verifyWebhook(params: {
		"hub.mode": string
		"hub.challenge": string
		"hub.verify_token": string
	}) {
		const searchParams = new URLSearchParams(params)
		return this.api
			.get(`${GROUP_PREFIX}/webhook?${searchParams.toString()}`)
			.text()
	}

	/**
	 * Webhook endpoint to receive events from Meta
	 * This endpoint receives webhook events (messages, conversations, etc.)
	 * @param payload - The webhook payload from Meta
	 * @param signature - The X-Hub-Signature-256 header value
	 */
	async handleWebhookEvent(payload: any, signature?: string) {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		}

		if (signature) {
			headers["X-Hub-Signature-256"] = signature
		}

		return this.api
			.post(`${GROUP_PREFIX}/webhook`, {
				json: payload,
				headers,
			})
			.json<WebhookEventResponse>()
	}

	// ===== Conversation Management =====

	/**
	 * Get all conversations of a Meta page from database
	 * @param params - Parameters containing pageId
	 */
	async getPageConversations(params: GetPageConversationsParams) {
		return this.api
			.get(`${GROUP_PREFIX}/pages/${params.pageId}`)
			.json<GetPageConversationsResponse>()
	}

	// ===== Message Management =====

	/**
	 * Get all messages in a conversation from database
	 * Messages are sorted by creation time in descending order
	 * @param params - Parameters containing pageId and conversationId
	 */
	async getConversationMessages(params: GetConversationMessagesParams) {
		return this.api
			.get(
				`${GROUP_PREFIX}/pages/${params.pageId}/${params.conversationId}`
			)
			.json<GetConversationMessagesResponse>()
	}

	/**
	 * Send a message to a conversation via Meta API and save to database
	 * @param params - Parameters containing pageId and conversationId
	 * @param messageData - The message data to send
	 */
	async sendMessageToConversation(
		params: SendMessageParams,
		messageData: SendMessageRequest
	) {
		return this.api
			.post(
				`${GROUP_PREFIX}/pages/${params.pageId}/${params.conversationId}`,
				{
					json: messageData,
				}
			)
			.json<SendMessageResponse>()
	}
}

const metaService = new MetaService()
export default metaService
