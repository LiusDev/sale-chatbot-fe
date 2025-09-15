import type {
	// Product Group types
	GetProductGroupsParams,
	ProductGroup,
	CreateProductGroupRequest,
	UpdateProductGroupRequest,

	// Product types
	GetProductsParams,
	Product,
	CreateProductRequest,
	UpdateProductRequest,
	DeleteProductData,

	// Parameter types
	ProductGroupParams,
	ProductParams,
} from "@/types/products.type"
import type { ApiResponse } from "@/types/common.type"
import { BaseApi } from "./base-api"

const GROUP_PREFIX = "products"

class ProductsService extends BaseApi {
	constructor() {
		super()
	}

	// ===== Product Groups API =====

	/**
	 * Get all product groups with pagination and search
	 * GET /products
	 */
	async getProductGroups(params: GetProductGroupsParams = {}) {
		const searchParams = this.createSearchParams(params)
		return this.api
			.get(GROUP_PREFIX, { searchParams })
			.json<ApiResponse<ProductGroup[]>>()
	}

	/**
	 * Create a new product group
	 * POST /products
	 */
	async createProductGroup(data: CreateProductGroupRequest) {
		return this.api
			.post(GROUP_PREFIX, { json: data })
			.json<ApiResponse<ProductGroup>>()
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
			.put(`${GROUP_PREFIX}/${groupId}`, { json: data })
			.json<ApiResponse<ProductGroup>>()
	}

	/**
	 * Delete a product group (only if no products exist)
	 * DELETE /products/:groupId
	 */
	async deleteProductGroup({ groupId }: ProductGroupParams) {
		return this.api
			.delete(`${GROUP_PREFIX}/${groupId}`)
			.json<ApiResponse<object>>()
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
			.get(`${GROUP_PREFIX}/${groupId}`, { searchParams })
			.json<ApiResponse<Product[]>>()
	}

	/**
	 * Get single product by ID
	 * GET /products/:groupId/:productId
	 */
	async getProduct({ groupId, productId }: ProductParams) {
		return this.api
			.get(`${GROUP_PREFIX}/${groupId}/${productId}`)
			.json<ApiResponse<Product>>()
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
			.post(`${GROUP_PREFIX}/${groupId}`, { json: data })
			.json<ApiResponse<Product>>()
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
			.put(`${GROUP_PREFIX}/${groupId}/${productId}`, { json: data })
			.json<ApiResponse<Product>>()
	}

	/**
	 * Delete a product and all related images
	 * DELETE /products/:groupId/:productId
	 */
	async deleteProduct({ groupId, productId }: ProductParams) {
		return this.api
			.delete(`${GROUP_PREFIX}/${groupId}/${productId}`)
			.json<ApiResponse<DeleteProductData>>()
	}
}

const productsService = new ProductsService()
export default productsService
