"use client"

import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/products.type"
import { useDeleteProduct } from "@/queries/products.query"
import { t } from "@/lib/translations"
import { toast } from "sonner"
import { Trash2, AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface DeleteProductDialogProps {
	product: Product
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function DeleteProductDialog({
	product,
	open,
	onOpenChange,
}: DeleteProductDialogProps) {
	const [isConfirming, setIsConfirming] = useState(false)
	const navigate = useNavigate()

	const deleteProductMutation = useDeleteProduct()

	const handleDelete = async () => {
		if (!isConfirming) {
			setIsConfirming(true)
			return
		}

		try {
			await deleteProductMutation.mutateAsync({
				groupId: product.product_group_id,
				productId: product.id,
			})

			toast.success(t("success.productDeleted"), {
				description: `${t("products.name")} "${product.name}" ${t(
					"products.productDeletedSuccessfully"
				)}`,
			})

			onOpenChange(false)
			setIsConfirming(false)
			navigate(`/products/${product.product_group_id}`)
		} catch (error) {
			console.error("Failed to delete product:", error)
			toast.error(t("products.errorDeletingProduct"), {
				description: t("products.errorDeletingProductDescription"),
			})
		}
	}

	const handleCancel = () => {
		setIsConfirming(false)
		onOpenChange(false)
	}

	const isLoading = deleteProductMutation.isPending

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						{t("products.deleteProduct")}
					</DialogTitle>
					<DialogDescription className="space-y-2 mt-2">
						<p>
							{t("products.confirmDelete")}{" "}
							<span className="font-semibold text-foreground">
								"{product.name}"
							</span>
							?
						</p>
						{isConfirming && (
							<div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
								<p className="text-sm text-destructive font-medium">
									{t("products.actionCannotBeUndone")}
								</p>
								<p className="text-sm text-muted-foreground mt-1">
									{t("products.dataWillBeDeleted")}
								</p>
							</div>
						)}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={isLoading}
					>
						{t("actions.cancel")}
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isLoading}
						className="min-w-[100px]"
					>
						{isLoading ? (
							<>
								<span className="animate-spin h-4 w-4 rounded-full border-2 border-current border-t-transparent mr-2" />
								{t("products.deleting")}
							</>
						) : (
							<>
								<Trash2 className="h-4 w-4 mr-2" />
								{isConfirming
									? t("actions.confirm")
									: t("actions.delete")}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
