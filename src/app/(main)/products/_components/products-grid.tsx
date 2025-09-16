"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Image as ImageIcon, Package } from "lucide-react"
import { UpsertProductDialog } from "./upsert-product-dialog"
import { DeleteProductDialog } from "./delete-product-dialog"
import type { Product } from "@/types/products.type"
import { t } from "@/lib/translations"

interface ProductsGridProps {
	groupId: number
	products: Product[]
}

export function ProductsGrid({ groupId, products }: ProductsGridProps) {
	const navigate = useNavigate()
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

	return (
		<div className="space-y-6">
			{/* Header with Create Button */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("products.products")}
					</h1>
					<p className="text-muted-foreground">
						{t("products.manageProductsInGroup")}
					</p>
				</div>
				<Button onClick={() => setShowCreateDialog(true)}>
					<Plus className="mr-2 h-4 w-4" />
					{t("products.addProduct")}
				</Button>
			</div>

			{/* Products Grid */}
			{products.length === 0 ? (
				<div className="flex items-center justify-center p-12">
					<div className="text-center">
						<Package className="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 className="mt-4 text-lg font-semibold">
							{t("products.noProductsFound")}
						</h3>
						<p className="text-muted-foreground mb-4">
							{t("products.startByAddingFirstProduct")}
						</p>
						<Button onClick={() => setShowCreateDialog(true)}>
							<Plus className="mr-2 h-4 w-4" />
							{t("products.addProduct")}
						</Button>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							onView={() =>
								navigate(`/products/${groupId}/${product.id}`)
							}
							onEdit={() => setEditingProduct(product)}
							onDelete={() => setDeletingProduct(product)}
						/>
					))}
				</div>
			)}

			{/* Dialogs */}
			<UpsertProductDialog
				mode="create"
				groupId={groupId}
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
			/>

			{editingProduct && (
				<UpsertProductDialog
					mode="edit"
					groupId={groupId}
					product={editingProduct}
					open={!!editingProduct}
					onOpenChange={(open) => !open && setEditingProduct(null)}
				/>
			)}

			{deletingProduct && (
				<DeleteProductDialog
					product={deletingProduct}
					open={!!deletingProduct}
					onOpenChange={(open) => !open && setDeletingProduct(null)}
				/>
			)}
		</div>
	)
}

interface ProductCardProps {
	product: Product
	onView: () => void
	onEdit: () => void
	onDelete: () => void
}

function ProductCard({ product, onView }: ProductCardProps) {
	const primaryImage = product.imageUrls.find((img) => img.index === 0)

	return (
		<Card
			className="cursor-pointer transition-all duration-200 hover:shadow-lg group pt-0"
			onClick={onView}
		>
			{/* Product Image */}
			<div className="aspect-square w-full relative overflow-hidden rounded-t-lg bg-muted">
				{primaryImage?.presignedUrl ? (
					<img
						src={primaryImage.presignedUrl}
						alt={primaryImage.altText || product.name}
						className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<ImageIcon className="h-12 w-12 text-muted-foreground" />
					</div>
				)}

				{/* Image Count Badge */}
				{product.imageUrls.length > 1 && (
					<Badge
						variant="secondary"
						className="absolute bottom-2 right-2"
					>
						+{product.imageUrls.length - 1}
					</Badge>
				)}
			</div>

			<CardHeader className="pb-2">
				<CardTitle className="text-base line-clamp-1">
					{product.name}
				</CardTitle>
				{product.description && (
					<CardDescription className="text-sm line-clamp-2">
						{product.description}
					</CardDescription>
				)}
			</CardHeader>

			<CardContent className="pb-2">
				<div className="text-lg font-bold text-primary">
					{Intl.NumberFormat("vi-VN", {
						style: "currency",
						currency: "VND",
					}).format(product.price)}
				</div>
			</CardContent>
		</Card>
	)
}
