"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react"
import { useCreateProduct, useUpdateProduct } from "@/queries/products.query"
import { toast } from "sonner"
import { t } from "@/lib/translations"
import {
	isValidImageType,
	isValidImageSize,
	processImageFiles,
} from "@/lib/utils"
import type { Product } from "@/types/products.type"

const upsertProductSchema = z.object({
	name: z
		.string()
		.min(1, t("validation.nameRequired"))
		.max(100, t("validation.nameTooLong")),
	description: z.string().min(1, t("validation.descriptionRequired")),
	price: z.number().min(0, t("validation.pricePositive")),
})

type UpsertProductForm = z.infer<typeof upsertProductSchema>

interface MetadataEntry {
	key: string
	value: string
}

interface UpsertProductDialogProps {
	mode: "create" | "edit"
	groupId: number
	product?: Product // Only required for edit mode
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function UpsertProductDialog({
	mode,
	groupId,
	product,
	open,
	onOpenChange,
}: UpsertProductDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [previewUrls, setPreviewUrls] = useState<string[]>([])
	const [metadataEntries, setMetadataEntries] = useState<MetadataEntry[]>([])
	const [existingImages, setExistingImages] = useState<Product["imageUrls"]>(
		[]
	)
	const [imageError, setImageError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const createProduct = useCreateProduct()
	const updateProduct = useUpdateProduct()

	const form = useForm<UpsertProductForm>({
		resolver: zodResolver(upsertProductSchema),
		defaultValues: {
			name: "",
			description: "",
			price: 0,
		},
	})

	// Initialize form and metadata when dialog opens or product changes
	useEffect(() => {
		if (open) {
			if (mode === "edit" && product) {
				// Initialize form with product data
				form.reset({
					name: product.name,
					description: product.description || "",
					price: product.price,
				})

				// Initialize metadata entries
				if (product.metadata) {
					try {
						const parsed = JSON.parse(product.metadata)
						const entries = Object.entries(parsed).map(
							([key, value]) => ({
								key,
								value: String(value),
							})
						)
						setMetadataEntries(entries)
					} catch (error) {
						console.error("Failed to parse metadata:", error)
						setMetadataEntries([])
					}
				} else {
					setMetadataEntries([])
				}

				// Initialize existing images
				setExistingImages(product.imageUrls || [])
			} else {
				// Create mode - reset everything
				form.reset({
					name: "",
					description: "",
					price: 0,
				})
				setMetadataEntries([])
				setExistingImages([])
			}
		}
	}, [open, mode, product, form])

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || [])

		// Validate files
		const validFiles = files.filter((file) => {
			if (!isValidImageType(file)) {
				toast.error(`${t("products.invalidFileType")}: ${file.name}`)
				return false
			}
			if (!isValidImageSize(file)) {
				toast.error(`${t("products.fileTooLarge")}: ${file.name}`)
				return false
			}
			return true
		})

		setSelectedFiles(validFiles)

		// Create preview URLs
		const urls = validFiles.map((file) => URL.createObjectURL(file))
		setPreviewUrls(urls)

		// Clear image error when files are selected
		if (validFiles.length > 0) {
			setImageError(null)
		}

		// Reset file input value to allow selecting the same file again
		if (event.target) {
			event.target.value = ""
		}
	}

	const removeFile = (index: number) => {
		const newFiles = selectedFiles.filter((_, i) => i !== index)
		const newUrls = previewUrls.filter((_, i) => i !== index)

		// Cleanup old URL
		URL.revokeObjectURL(previewUrls[index])

		setSelectedFiles(newFiles)
		setPreviewUrls(newUrls)

		// Check if no images remain after removal
		if (newFiles.length === 0 && existingImages.length === 0) {
			setImageError(t("products.productMustHaveAtLeastOneImage"))
		}
	}

	const removeExistingImage = (index: number) => {
		const newImages = existingImages.filter((_, i) => i !== index)
		setExistingImages(newImages)

		// Check if no images remain after removal
		if (newImages.length === 0 && selectedFiles.length === 0) {
			setImageError(t("products.productMustHaveAtLeastOneImage"))
		}
	}

	const addMetadataEntry = () => {
		setMetadataEntries([...metadataEntries, { key: "", value: "" }])
	}

	const removeMetadataEntry = (index: number) => {
		setMetadataEntries(metadataEntries.filter((_, i) => i !== index))
	}

	const updateMetadataEntry = (
		index: number,
		field: "key" | "value",
		value: string
	) => {
		const newEntries = [...metadataEntries]
		newEntries[index][field] = value
		setMetadataEntries(newEntries)
	}

	const onSubmit = async (data: UpsertProductForm) => {
		setIsSubmitting(true)
		try {
			// Validate that at least 1 image is provided
			const totalImages = existingImages.length + selectedFiles.length
			if (totalImages === 0) {
				setImageError(t("products.productMustHaveAtLeastOneImage"))
				toast.error(t("products.productMustHaveAtLeastOneImage"))
				setIsSubmitting(false)
				return
			}

			// Clear image error if validation passes
			setImageError(null)

			// Convert metadata entries to JSON string
			const metadata = metadataEntries.reduce((acc, entry) => {
				if (entry.key.trim() && entry.value.trim()) {
					acc[entry.key.trim()] = entry.value.trim()
				}
				return acc
			}, {} as Record<string, string>)

			if (mode === "create") {
				// Process images for create
				let images: Array<{
					url: string
					altText: string
					index: number
				}> = []

				if (selectedFiles.length > 0) {
					const processedImages = await processImageFiles(
						selectedFiles
					)
					images = processedImages.map((img, index) => ({
						url: img.url,
						altText: `${data.name} image ${index + 1}`,
						index,
					}))
				}

				await createProduct.mutateAsync({
					params: { groupId },
					data: {
						...data,
						metadata:
							Object.keys(metadata).length > 0
								? JSON.stringify(metadata)
								: undefined,
						images,
					},
				})

				toast.success(t("success.productCreated"))
			} else {
				// Edit mode - handle both existing and new images
				let finalImages: Array<{
					url: string
					altText: string
					index: number
				}> = []

				// Keep existing images that weren't removed
				const existingImagesList = existingImages.map((img, index) => ({
					url: img.url, // Use original object key, not presigned URL
					altText:
						img.altText || `${data.name} existing ${index + 1}`,
					index: index,
					isExisting: true,
				}))

				// Add new images if any
				let newImagesList: Array<{
					url: string
					altText: string
					index: number
					isExisting: boolean
				}> = []

				if (selectedFiles.length > 0) {
					const processedImages = await processImageFiles(
						selectedFiles
					)
					newImagesList = processedImages.map((img, index) => ({
						url: img.url,
						altText: `${data.name} new ${index + 1}`,
						index: existingImagesList.length + index,
						isExisting: false,
					}))
				}

				finalImages = [...existingImagesList, ...newImagesList]

				await updateProduct.mutateAsync({
					params: { groupId, productId: product!.id },
					data: {
						...data,
						metadata:
							Object.keys(metadata).length > 0
								? JSON.stringify(metadata)
								: undefined,
						images: finalImages,
					},
				})

				toast.success(t("success.productUpdated"))
			}

			handleClose()
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: mode === "create"
					? t("errors.failedToCreateProduct")
					: t("errors.failedToUpdateProduct")
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		form.reset()
		setSelectedFiles([])
		previewUrls.forEach((url) => URL.revokeObjectURL(url))
		setPreviewUrls([])
		setMetadataEntries([])
		setExistingImages([])
		setImageError(null)
		// Reset file input value
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
		onOpenChange(false)
	}

	const isEdit = mode === "edit"

	return (
		<Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="max-w-7xl sm:max-w-7xl flex flex-col gap-4">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle>
						{isEdit
							? t("products.editProduct")
							: t("products.createProduct")}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? `${t("products.updateProductDetails")} "${
									product?.name
							  }"`
							: t("products.addNewProduct")}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						id="upsert-product-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6 max-h-[75vh] overflow-y-auto"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Left Column - Basic Info */}
							<div className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">
											{t("products.basicInfo")}
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t("products.name")} *
													</FormLabel>
													<FormControl>
														<Input
															placeholder={t(
																"products.enterProductName"
															)}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="price"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t("products.price")} *
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															step="0.01"
															placeholder="0.00"
															{...field}
															onChange={(e) =>
																field.onChange(
																	parseFloat(
																		e.target
																			.value
																	) || 0
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															"products.productDescription"
														)}{" "}
														*
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder={t(
																"products.enterProductDescription"
															)}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								{/* Images Section */}
								<Card>
									<CardHeader>
										<CardTitle className="text-lg flex items-center justify-between">
											{t("products.images")} *
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() =>
													fileInputRef.current?.click()
												}
											>
												<Upload className="mr-2 h-4 w-4" />
												{t("products.uploadImages")}
											</Button>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<input
											ref={fileInputRef}
											type="file"
											multiple
											accept="image/*"
											className="hidden"
											onChange={handleFileSelect}
										/>

										{/* Image validation error */}
										{imageError && (
											<div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
												{imageError}
											</div>
										)}

										{/* Existing Images (Edit Mode) */}
										{mode === "edit" &&
											existingImages.length > 0 && (
												<div className="mb-4">
													<h4 className="text-sm font-medium mb-2 text-muted-foreground">
														{t(
															"products.currentImages"
														)}
													</h4>
													<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
														{existingImages.map(
															(image, index) => (
																<div
																	key={`existing-${index}`}
																	className="relative group"
																>
																	<div className="aspect-square rounded-lg border overflow-hidden">
																		{image.presignedUrl ? (
																			<img
																				src={
																					image.presignedUrl
																				}
																				alt={
																					image.altText ||
																					`Existing ${
																						index +
																						1
																					}`
																				}
																				className="w-full h-full object-cover"
																			/>
																		) : (
																			<div className="w-full h-full flex items-center justify-center bg-muted">
																				<ImageIcon className="h-8 w-8 text-muted-foreground" />
																			</div>
																		)}
																	</div>
																	<Button
																		type="button"
																		variant="destructive"
																		size="sm"
																		className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
																		onClick={() =>
																			removeExistingImage(
																				index
																			)
																		}
																	>
																		<X className="h-3 w-3" />
																	</Button>
																	<Badge
																		variant="outline"
																		className="absolute bottom-2 left-2"
																	>
																		{index +
																			1}
																	</Badge>
																</div>
															)
														)}
													</div>
												</div>
											)}

										{/* New Image Previews */}
										{previewUrls.length > 0 && (
											<div className="mb-4">
												{mode === "edit" && (
													<h4 className="text-sm font-medium mb-2 text-muted-foreground">
														{t(
															"products.newImages"
														)}
													</h4>
												)}
												<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
													{previewUrls.map(
														(url, index) => (
															<div
																key={`new-${index}`}
																className="relative group"
															>
																<div className="aspect-square rounded-lg border overflow-hidden">
																	<img
																		src={
																			url
																		}
																		alt={`${t(
																			"products.preview"
																		)} ${
																			index +
																			1
																		}`}
																		className="w-full h-full object-cover"
																	/>
																</div>
																<Button
																	type="button"
																	variant="destructive"
																	size="sm"
																	className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
																	onClick={() =>
																		removeFile(
																			index
																		)
																	}
																>
																	<X className="h-3 w-3" />
																</Button>
																<Badge
																	variant="secondary"
																	className="absolute bottom-2 left-2"
																>
																	{existingImages.length +
																		index +
																		1}
																</Badge>
															</div>
														)
													)}
												</div>
											</div>
										)}

										{selectedFiles.length === 0 &&
											existingImages.length === 0 && (
												<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
													<ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
													<p className="mt-2 text-sm text-muted-foreground">
														{t(
															"products.noImagesSelected"
														)}
													</p>
												</div>
											)}
									</CardContent>
								</Card>
							</div>

							{/* Right Column - Metadata */}
							<div className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle className="text-lg flex items-center justify-between">
											{t("products.additionalInfo")}
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={addMetadataEntry}
											>
												<Plus className="h-4 w-4 mr-1" />
												{t("actions.add")}
											</Button>
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										{metadataEntries.length === 0 ? (
											<div className="text-center py-8 text-muted-foreground">
												<p>
													{t(
														"products.noAdditionalInfo"
													)}
												</p>
												<p className="text-sm">
													{t(
														"products.clickAddToAddInfo"
													)}
												</p>
											</div>
										) : (
											metadataEntries.map(
												(entry, index) => (
													<div
														key={index}
														className="flex gap-2 items-start"
													>
														<div className="flex-1">
															<Input
																placeholder={t(
																	"products.attributePlaceholder"
																)}
																value={
																	entry.key
																}
																onChange={(e) =>
																	updateMetadataEntry(
																		index,
																		"key",
																		e.target
																			.value
																	)
																}
															/>
														</div>
														<div className="flex-1">
															<Input
																placeholder={t(
																	"products.valuePlaceholder"
																)}
																value={
																	entry.value
																}
																onChange={(e) =>
																	updateMetadataEntry(
																		index,
																		"value",
																		e.target
																			.value
																	)
																}
															/>
														</div>
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() =>
																removeMetadataEntry(
																	index
																)
															}
														>
															<X className="h-4 w-4" />
														</Button>
													</div>
												)
											)
										)}
									</CardContent>
								</Card>

								{/* Preview Metadata */}
								{metadataEntries.some(
									(e) => e.key.trim() && e.value.trim()
								) && (
									<Card>
										<CardHeader>
											<CardTitle className="text-sm">
												{t("products.metadataPreview")}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												{metadataEntries.map(
													(entry, index) =>
														entry.key.trim() &&
														entry.value.trim() ? (
															<div
																key={index}
																className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0"
															>
																<span className="font-medium">
																	{entry.key.trim()}
																	:
																</span>
																<Badge variant="secondary">
																	{entry.value.trim()}
																</Badge>
															</div>
														) : null
												)}
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					</form>
				</Form>

				<DialogFooter className="flex-shrink-0 pt-4 border-t">
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						{t("actions.cancel")}
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}
						form="upsert-product-form"
					>
						{isSubmitting
							? isEdit
								? t("products.saving")
								: t("products.creating")
							: isEdit
							? t("products.saveChanges")
							: t("products.createProduct")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
