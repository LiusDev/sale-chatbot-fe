import type {
	MetaFanpagesResponse,
	MetaPagesResponse,
	UpsertMetaPagesRequest,
	UpsertMetaPagesResponse,
	DeleteMetaPageResponse,
	MetaPagesParams,
} from "@/types/meta.type"
import type { ApiResponse } from "@/types/common.type"
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
	 * Get a specific page by ID from database
	 * @param pageId - The Meta page ID
	 */
	async getPageById(pageId: string) {
		return this.api
			.get(`${GROUP_PREFIX}/pages/${pageId}`)
			.json<ApiResponse<MetaPagesResponse["data"][0]>>()
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
}

const metaService = new MetaService()
export default metaService
