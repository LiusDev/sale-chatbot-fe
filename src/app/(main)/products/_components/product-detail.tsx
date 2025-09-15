"use client"

import { useState } from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Image as ImageIcon } from "lucide-react"
import type { Product } from "@/types/products.type"
import { t } from "@/lib/translations"
import { UpsertProductDialog } from "./upsert-product-dialog"
import { DeleteProductDialog } from "./delete-product-dialog"

interface ProductDetailProps {
	product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	const selectedImage =
		product.imageUrls[selectedImageIndex] || product.imageUrls[0]

	return (
		<>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							{product.name}
						</h1>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => setIsEditDialogOpen(true)}
						>
							<Edit className="mr-2 h-4 w-4" />
							{t("actions.edit")}
						</Button>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(true)}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							{t("actions.delete")}
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Images Section */}
					<div className="space-y-4">
						{/* Main Image */}
						<div className="aspect-square w-full max-w-md mx-auto rounded-lg border overflow-hidden bg-muted">
							{selectedImage?.presignedUrl ? (
								<img
									src={selectedImage.presignedUrl}
									alt={selectedImage.altText || product.name}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<ImageIcon className="h-16 w-16 text-muted-foreground" />
									<span className="ml-2 text-muted-foreground">
										{t("products.noImageAvailable")}
									</span>
								</div>
							)}
						</div>

						{/* Image Thumbnails */}
						{product.imageUrls.length > 1 && (
							<div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
								{product.imageUrls.map((image, index) => (
									<button
										key={index}
										onClick={() =>
											setSelectedImageIndex(index)
										}
										className={`aspect-square rounded-md border overflow-hidden bg-muted transition-all ${
											selectedImageIndex === index
												? "ring-2 ring-primary"
												: "hover:ring-1 hover:ring-muted-foreground"
										}`}
									>
										{image.presignedUrl ? (
											<img
												src={image.presignedUrl}
												alt={
													image.altText ||
													`${product.name} ${
														index + 1
													}`
												}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<ImageIcon className="h-6 w-6 text-muted-foreground" />
											</div>
										)}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Product Info Section */}
					<div className="space-y-6">
						{/* Price */}
						<Card>
							<CardHeader>
								<CardTitle>{t("products.price")}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-4xl font-bold text-primary">
									{Intl.NumberFormat("vi-VN", {
										style: "currency",
										currency: "VND",
									}).format(product.price)}
								</div>
							</CardContent>
						</Card>

						{/* Description */}
						{product.description && (
							<Card>
								<CardHeader>
									<CardTitle>
										{t("products.productDescription")}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-base leading-relaxed">
										{product.description}
									</p>
								</CardContent>
							</Card>
						)}

						{/* Metadata */}
						{product.metadata && (
							<Card>
								<CardHeader>
									<CardTitle>
										{t("products.metadata")}
									</CardTitle>
									<CardDescription>
										Thông tin bổ sung về sản phẩm
									</CardDescription>
								</CardHeader>
								<CardContent>
									{(() => {
										try {
											const parsed = JSON.parse(
												product.metadata
											)
											const entries =
												Object.entries(parsed)

											if (entries.length === 0) {
												return (
													<p className="text-muted-foreground text-sm">
														Chưa có thông tin bổ
														sung
													</p>
												)
											}

											return (
												<div className="space-y-3">
													{entries.map(
														(
															[key, value],
															index
														) => (
															<div
																key={index}
																className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
															>
																<span className="font-medium text-sm capitalize">
																	{key
																		.replace(
																			/([A-Z])/g,
																			" $1"
																		)
																		.trim()}
																	:
																</span>
																<Badge
																	variant="secondary"
																	className="ml-2"
																>
																	{String(
																		value
																	)}
																</Badge>
															</div>
														)
													)}
												</div>
											)
										} catch {
											return (
												<div className="space-y-2">
													<p className="text-destructive text-sm">
														Lỗi định dạng metadata
													</p>
													<details className="text-xs">
														<summary className="cursor-pointer text-muted-foreground">
															Xem dữ liệu gốc
														</summary>
														<pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
															{product.metadata}
														</pre>
													</details>
												</div>
											)
										}
									})()}
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>

			{/* Dialogs */}
			<UpsertProductDialog
				mode="edit"
				groupId={product.product_group_id}
				product={product}
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
			/>
			<DeleteProductDialog
				product={product}
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			/>
		</>
	)
}
