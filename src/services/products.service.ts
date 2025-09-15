import type {
	// Product Group types
	GetProductGroupsParams,
	GetProductGroupsResponse,
	CreateProductGroupRequest,
	CreateProductGroupResponse,
	UpdateProductGroupRequest,
	UpdateProductGroupResponse,
	DeleteProductGroupResponse,

	// Product types
	GetProductsParams,
	GetProductsResponse,
	GetProductResponse,
	CreateProductRequest,
	CreateProductResponse,
	UpdateProductRequest,
	UpdateProductResponse,
	DeleteProductResponse,

	// Parameter types
	ProductGroupParams,
	ProductParams,
} from "@/types/products.type"
import { BaseApi } from "./base-api"

class ProductsService extends BaseApi {
	constructor() {
		super({
			groupPrefix: "products",
		})
	}

	// ===== Product Groups API =====

	/**
	 * Get all product groups with pagination and search
	 * GET /products
	 */
	async getProductGroups(params: GetProductGroupsParams = {}) {
		const searchParams = this.createSearchParams(params)
		return this.api
			.get("", { searchParams })
			.json<GetProductGroupsResponse>()
	}

	/**
	 * Create a new product group
	 * POST /products
	 */
	async createProductGroup(data: CreateProductGroupRequest) {
		return this.api
			.post("", { json: data })
			.json<CreateProductGroupResponse>()
	}

	/**
	 * Update a product group
	 * PUT /products/:groupId
	 */
	async updateProductGroup(
		{ groupId }: ProductGroupParams,
		data: UpdateProductGroupRequest
	) {
		return this.api
			.put(`${groupId}`, { json: data })
			.json<UpdateProductGroupResponse>()
	}

	/**
	 * Delete a product group (only if no products exist)
	 * DELETE /products/:groupId
	 */
	async deleteProductGroup({ groupId }: ProductGroupParams) {
		return this.api.delete(`${groupId}`).json<DeleteProductGroupResponse>()
	}

	// ===== Products API =====

	/**
	 * Get products by group with pagination and search
	 * GET /products/:groupId
	 */
	async getProducts(
		{ groupId }: ProductGroupParams,
		params: GetProductsParams = {}
	) {
		const searchParams = this.createSearchParams(params)
		return this.api
			.get(`${groupId}`, { searchParams })
			.json<GetProductsResponse>()
	}

	/**
	 * Get single product by ID
	 * GET /products/:groupId/:productId
	 */
	async getProduct({ groupId, productId }: ProductParams) {
		return this.api
			.get(`${groupId}/${productId}`)
			.json<GetProductResponse>()
	}

	/**
	 * Create a new product in a group
	 * POST /products/:groupId
	 */
	async createProduct(
		{ groupId }: ProductGroupParams,
		data: CreateProductRequest
	) {
		return this.api
			.post(`${groupId}`, { json: data })
			.json<CreateProductResponse>()
	}

	/**
	 * Update a product with optimized R2 image handling
	 * PUT /products/:groupId/:productId
	 */
	async updateProduct(
		{ groupId, productId }: ProductParams,
		data: UpdateProductRequest
	) {
		return this.api
			.put(`${groupId}/${productId}`, { json: data })
			.json<UpdateProductResponse>()
	}

	/**
	 * Delete a product and all related images
	 * DELETE /products/:groupId/:productId
	 */
	async deleteProduct({ groupId, productId }: ProductParams) {
		return this.api
			.delete(`${groupId}/${productId}`)
			.json<DeleteProductResponse>()
	}

	// ===== Helper Methods =====

	/**
	 * Convert File to base64 string with proper format
	 */
	static async fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => {
				if (typeof reader.result === "string") {
					resolve(reader.result)
				} else {
					reject(new Error("Failed to convert file to base64"))
				}
			}
			reader.onerror = () => reject(new Error("Failed to read file"))
		})
	}

	/**
	 * Validate image file type
	 */
	static isValidImageType(file: File): boolean {
		const validTypes = [
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif",
		]
		return validTypes.includes(file.type)
	}

	/**
	 * Validate image file size (default max 5MB)
	 */
	static isValidImageSize(
		file: File,
		maxSize: number = 5 * 1024 * 1024
	): boolean {
		return file.size <= maxSize
	}

	/**
	 * Convert multiple files to base64 with validation
	 */
	static async processImageFiles(
		files: File[],
		options: {
			maxSize?: number
			validateType?: boolean
		} = {}
	): Promise<Array<{ url: string; file: File; index: number }>> {
		const { maxSize = 5 * 1024 * 1024, validateType = true } = options

		const results = await Promise.allSettled(
			files.map(async (file, index) => {
				// Validate file type
				if (validateType && !this.isValidImageType(file)) {
					throw new Error(
						`Invalid file type: ${file.type}. Supported: JPG, PNG, WebP, GIF`
					)
				}

				// Validate file size
				if (!this.isValidImageSize(file, maxSize)) {
					throw new Error(
						`File too large: ${file.name}. Max size: ${
							maxSize / (1024 * 1024)
						}MB`
					)
				}

				const url = await this.fileToBase64(file)
				return { url, file, index }
			})
		)

		// Filter successful results and throw if any failed
		const successful = results
			.filter(
				(
					result
				): result is PromiseFulfilledResult<{
					url: string
					file: File
					index: number
				}> => result.status === "fulfilled"
			)
			.map((result) => result.value)

		const failed = results
			.filter(
				(result): result is PromiseRejectedResult =>
					result.status === "rejected"
			)
			.map((result) => result.reason)

		if (failed.length > 0) {
			throw new Error(
				`Failed to process ${failed.length} files: ${failed.join(", ")}`
			)
		}

		return successful
	}
}

const productsService = new ProductsService()
export default productsService
