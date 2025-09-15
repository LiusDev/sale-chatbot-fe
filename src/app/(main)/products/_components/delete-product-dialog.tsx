"use client"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import type { Product } from "@/types/products.type"
import { t } from "@/lib/translations"

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
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("products.deleteProduct")}</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn xóa {product.name}?
					</DialogDescription>
				</DialogHeader>
				<div className="p-4">
					<p className="text-muted-foreground">
						Hộp thoại xóa sản phẩm sẽ được phát triển sớm...
					</p>
				</div>
			</DialogContent>
		</Dialog>
	)
}
