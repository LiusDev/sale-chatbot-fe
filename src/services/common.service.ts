import type { AppInfo, AppInfoUpdate } from "@/types/common.type"
import type { ApiResponse } from "@/types/common.type"
import { BaseApi } from "./base-api"

const GROUP_PREFIX = "common"

class CommonService extends BaseApi {
	constructor() {
		super()
	}

	/**
	 * Get all app configuration information
	 * Private fields will be masked with ********
	 */
	async getAppInfo() {
		return this.api.get(GROUP_PREFIX).json<ApiResponse<AppInfo>>()
	}

	/**
	 * Update app configuration information
	 * Only allows updating predefined keys
	 * @param updates - Key-value pairs to update
	 */
	async updateAppInfo(updates: AppInfoUpdate) {
		return this.api
			.put(GROUP_PREFIX, {
				json: updates,
			})
			.json<ApiResponse<AppInfo>>()
	}
}

const commonService = new CommonService()
export default commonService
