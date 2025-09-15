import type { PaginationParams } from "./common.type"

// ===== Product Group Types =====
export interface ProductGroup {
	id: number
	name: string
	description: string
	productCount?: number
}

export interface CreateProductGroupRequest {
	name: string
	description?: string
}

export interface UpdateProductGroupRequest {
	name?: string
	description?: string
}

export type GetProductGroupsParams = PaginationParams

// Product Group response types removed - use ApiResponse<T> directly in service

// ===== Product Types =====
export interface ProductImage {
	url: string
	altText?: string
	index: number
	presignedUrl?: string
	isExisting?: boolean // Used for update operations
}

export interface Product {
	id: number
	name: string
	description?: string
	price: number
	metadata?: string
	product_group_id: number
	imageUrls: ProductImage[]
}

export interface CreateProductImage {
	url: string // Base64 data for new images
	altText?: string
	index: number
}

export interface UpdateProductImage extends CreateProductImage {
	isExisting?: boolean // true for existing images, false for new uploads
}

export interface CreateProductRequest {
	name: string
	description?: string
	price: number
	metadata?: string
	images?: CreateProductImage[]
}

export interface UpdateProductRequest {
	name?: string
	description?: string
	price?: number
	metadata?: string
	images?: UpdateProductImage[]
}

export interface GetProductsParams extends PaginationParams {
	// Additional sort options for products
	sort?: "id" | "name" | "description" | "price"
}

export interface DeleteProductData {
	success: boolean
	deletedProduct: Omit<Product, "imageUrls">
}

// Product response types removed - use ApiResponse<T> directly in service

// ===== Service Method Parameters =====
export interface ProductGroupParams {
	groupId: number
}

export interface ProductParams extends ProductGroupParams {
	productId: number
}

// ===== Helper Types for File Upload =====
export interface FileToBase64Result {
	url: string
	type: string
	size: number
}

export type SupportedImageType =
	| "image/jpeg"
	| "image/png"
	| "image/webp"
	| "image/gif"

export interface ImageUploadError {
	file: File
	error: string
}
