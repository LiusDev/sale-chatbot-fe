import { BE_URL } from "@/lib/constant"
import ky, { type KyInstance } from "ky"
import { redirect } from "react-router-dom"

export class BaseApi {
	protected api: KyInstance

	constructor({
		baseUrl = BE_URL,
		groupPrefix = "",
		headers = {
			"Content-Type": "application/json",
		},
	}: {
		baseUrl?: string
		groupPrefix?: string
		headers?: Record<string, string>
	} = {}) {
		const defaultBaseUrl =
			typeof window !== "undefined" &&
			window.location.hostname !== "localhost"
				? `https://${window.location.hostname}:8787`
				: `http://localhost:8787`

		this.api = ky.create({
			prefixUrl: `${baseUrl || defaultBaseUrl}/${groupPrefix}`,
			headers,
			credentials: "include", // Enable cookies for cross-origin requests
			hooks: {
				afterResponse: [
					async (_req, _opts, res) => {
						if (!res.ok) {
							// Handle 401 Unauthorized - redirect to login
							if (res.status === 401) {
								redirect("/auth/login")
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
