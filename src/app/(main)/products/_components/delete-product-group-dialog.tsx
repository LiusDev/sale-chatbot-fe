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
import { AlertTriangle, Package } from "lucide-react"
import { useDeleteProductGroup } from "@/queries/products.query"
import { toast } from "sonner"
import type { ProductGroup } from "@/types/products.type"
import { t } from "@/lib/translations"

interface DeleteProductGroupDialogProps {
	group: ProductGroup
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function DeleteProductGroupDialog({
	group,
	open,
	onOpenChange,
}: DeleteProductGroupDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false)
	const deleteProductGroup = useDeleteProductGroup()

	const hasProducts = (group.productCount || 0) > 0

	const handleDelete = async () => {
		if (hasProducts) {
			toast.error(t("errors.cannotDeleteGroupWithProducts"))
			return
		}

		setIsDeleting(true)
		try {
			await deleteProductGroup.mutateAsync({ groupId: group.id })
			toast.success(t("success.productGroupDeleted"))
			onOpenChange(false)
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("errors.failedToDeleteProductGroup")
			)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						<DialogTitle>
							{t("products.deleteProductGroup")}
						</DialogTitle>
					</div>
					<DialogDescription>
						{t("products.deleteWarning")}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Group Info */}
					<div className="rounded-lg border p-4 space-y-3">
						<div className="flex items-center justify-between">
							<h4 className="font-medium">{group.name}</h4>
						</div>

						{group.description && (
							<p className="text-sm text-muted-foreground">
								{group.description}
							</p>
						)}

						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Package className="h-4 w-4" />
							<span>
								{group.productCount || 0}{" "}
								{t("products.products")}
							</span>
						</div>
					</div>

					{/* Warning for groups with products */}
					{hasProducts && (
						<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
							<div className="flex items-start gap-2">
								<AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
								<div className="space-y-1">
									<p className="text-sm font-medium text-destructive">
										{t("products.cannotDeleteWithProducts")}
									</p>
									<p className="text-sm text-muted-foreground">
										{t("products.removeProductsFirst")}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
					>
						{t("actions.cancel")}
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting || hasProducts}
					>
						{isDeleting
							? t("products.deleting")
							: t("products.deleteGroup")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
