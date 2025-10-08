import { BE_URL } from "@/lib/constant"
import { useAuthStore } from "@/stores/auth.store"
import ky, { type KyInstance } from "ky"

export class BaseApi {
	protected api: KyInstance

	constructor({
		baseUrl = BE_URL,
		headers = {
			"Content-Type": "application/json",
		},
	}: {
		baseUrl?: string
		headers?: Record<string, string>
	} = {}) {
		const defaultBaseUrl =
			typeof window !== "undefined" &&
			window.location.hostname !== "localhost"
				? `https://${window.location.hostname}:8787`
				: `http://localhost:8787`

		const finalBaseUrl = baseUrl || defaultBaseUrl

		this.api = ky.create({
			prefixUrl: finalBaseUrl,
			headers,
			credentials: "include", // Enable cookies for cross-origin requests
			timeout: 60000, // 60 seconds timeout
			hooks: {
				afterResponse: [
					async (_req, _opts, res) => {
						if (!res.ok) {
							// Handle 401 Unauthorized - show auth dialog
							if (res.status === 401) {
								// Trigger auth dialog via zustand store
								useAuthStore.getState().showAuthDialog()
								return res
							}

							let errorBody: Record<string, unknown> = {}
							try {
								errorBody = await res.json()
							} catch {
								errorBody = {
									message: res.statusText,
								}
							}
							throw new Error(
								`API Error: ${res.status} - ${
									errorBody.message ?? "Unknown error"
								}`
							)
						}
						return res
					},
				],
			},
		})
	}

	/**
	 * @params params: Record<string, any>
	 * @returns URLSearchParams
	 *
	 *
	 * Build URLSearchParams from a plain object
	 * - Removes undefined, null, and empty strings
	 * - Supports arrays: turns { tags: ["tag1", "tag2"] } into tags=tag1&tags=tag2
	 */
	protected createSearchParams(params: Record<string, any>): URLSearchParams {
		const searchParams = new URLSearchParams()
		Object.entries(params).forEach(([key, value]) => {
			if (value === undefined || value === null || value === "") return

			if (Array.isArray(value)) {
				value.forEach((v) => searchParams.append(key, v))
			} else {
				searchParams.append(key, value)
			}
		})
		return searchParams
	}
}
