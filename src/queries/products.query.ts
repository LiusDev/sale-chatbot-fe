import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
	// Product Group types
	GetProductGroupsParams,
	CreateProductGroupRequest,
	UpdateProductGroupRequest,
	ProductGroupParams,

	// Product types
	GetProductsParams,
	CreateProductRequest,
	UpdateProductRequest,
	ProductParams,
} from "@/types/products.type"
import productsService from "@/services/products.service"

// ===== Query Keys Factory =====
export const productsQueryKeys = {
	all: ["products"] as const,
	groups: () => [...productsQueryKeys.all, "groups"] as const,
	group: (id: number) => [...productsQueryKeys.groups(), id] as const,
	groupsList: (params?: GetProductGroupsParams) =>
		[...productsQueryKeys.groups(), "list", params] as const,

	products: () => [...productsQueryKeys.all, "products"] as const,
	productsByGroup: (groupId: number) =>
		[...productsQueryKeys.products(), "group", groupId] as const,
	productsList: (groupId: number, params?: GetProductsParams) =>
		[
			...productsQueryKeys.productsByGroup(groupId),
			"list",
			params,
		] as const,
	product: (groupId: number, productId: number) =>
		[...productsQueryKeys.productsByGroup(groupId), productId] as const,
}

// ===== Product Groups Queries =====

/**
 * Get product groups with pagination and search
 */
export const useGetProductGroups = (params: GetProductGroupsParams = {}) => {
	return useQuery({
		queryKey: productsQueryKeys.groupsList(params),
		queryFn: () => productsService.getProductGroups(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

/**
 * Create product group mutation
 */
export const useCreateProductGroup = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateProductGroupRequest) =>
			productsService.createProductGroup(data),
		onSuccess: () => {
			// Invalidate product groups list
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.groups(),
			})
		},
	})
}

/**
 * Update product group mutation
 */
export const useUpdateProductGroup = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			params,
			data,
		}: {
			params: ProductGroupParams
			data: UpdateProductGroupRequest
		}) => productsService.updateProductGroup(params, data),
		onSuccess: (_, variables) => {
			// Invalidate specific group and groups list
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.group(variables.params.groupId),
			})
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.groups(),
			})
		},
	})
}

/**
 * Delete product group mutation
 */
export const useDeleteProductGroup = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (params: ProductGroupParams) =>
			productsService.deleteProductGroup(params),
		onSuccess: (_, variables) => {
			// Remove from cache and invalidate groups list
			queryClient.removeQueries({
				queryKey: productsQueryKeys.group(variables.groupId),
			})
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.groups(),
			})
		},
	})
}

// ===== Products Queries =====

/**
 * Get products by group with pagination and search
 */
export const useGetProducts = (
	groupParams: ProductGroupParams,
	queryParams: GetProductsParams = {}
) => {
	return useQuery({
		queryKey: productsQueryKeys.productsList(
			groupParams.groupId,
			queryParams
		),
		queryFn: () => productsService.getProducts(groupParams, queryParams),
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

/**
 * Get single product
 */
export const useGetProduct = (params: ProductParams) => {
	return useQuery({
		queryKey: productsQueryKeys.product(params.groupId, params.productId),
		queryFn: () => productsService.getProduct(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

/**
 * Create product mutation
 */
export const useCreateProduct = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			params,
			data,
		}: {
			params: ProductGroupParams
			data: CreateProductRequest
		}) => productsService.createProduct(params, data),
		onSuccess: (_, variables) => {
			// Invalidate products list for the group
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.productsByGroup(
					variables.params.groupId
				),
			})
			// Also invalidate groups list to update product count
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.groups(),
			})
		},
	})
}

/**
 * Update product mutation
 */
export const useUpdateProduct = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			params,
			data,
		}: {
			params: ProductParams
			data: UpdateProductRequest
		}) => productsService.updateProduct(params, data),
		onSuccess: (_, variables) => {
			// Invalidate specific product and products list
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.product(
					variables.params.groupId,
					variables.params.productId
				),
			})
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.productsByGroup(
					variables.params.groupId
				),
			})
		},
	})
}

/**
 * Delete product mutation
 */
export const useDeleteProduct = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (params: ProductParams) =>
			productsService.deleteProduct(params),
		onSuccess: (_, variables) => {
			// Remove from cache and invalidate products list
			queryClient.removeQueries({
				queryKey: productsQueryKeys.product(
					variables.groupId,
					variables.productId
				),
			})
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.productsByGroup(variables.groupId),
			})
			// Also invalidate groups list to update product count
			queryClient.invalidateQueries({
				queryKey: productsQueryKeys.groups(),
			})
		},
	})
}

// ===== Prefetch Helpers =====

/**
 * Prefetch product groups
 */
export const usePrefetchProductGroups = () => {
	const queryClient = useQueryClient()

	return (params: GetProductGroupsParams = {}) => {
		queryClient.prefetchQuery({
			queryKey: productsQueryKeys.groupsList(params),
			queryFn: () => productsService.getProductGroups(params),
			staleTime: 5 * 60 * 1000,
		})
	}
}

/**
 * Prefetch products by group
 */
export const usePrefetchProducts = () => {
	const queryClient = useQueryClient()

	return (
		groupParams: ProductGroupParams,
		queryParams: GetProductsParams = {}
	) => {
		queryClient.prefetchQuery({
			queryKey: productsQueryKeys.productsList(
				groupParams.groupId,
				queryParams
			),
			queryFn: () =>
				productsService.getProducts(groupParams, queryParams),
			staleTime: 5 * 60 * 1000,
		})
	}
}

/**
 * Prefetch single product
 */
export const usePrefetchProduct = () => {
	const queryClient = useQueryClient()

	return (params: ProductParams) => {
		queryClient.prefetchQuery({
			queryKey: productsQueryKeys.product(
				params.groupId,
				params.productId
			),
			queryFn: () => productsService.getProduct(params),
			staleTime: 5 * 60 * 1000,
		})
	}
}
