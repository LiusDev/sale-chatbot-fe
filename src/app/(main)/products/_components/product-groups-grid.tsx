"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, Edit, Trash2, Eye } from "lucide-react"
import { CreateProductGroupDialog } from "./create-product-group-dialog"
import { EditProductGroupDialog } from "./edit-product-group-dialog"
import { DeleteProductGroupDialog } from "./delete-product-group-dialog"
import type { ProductGroup } from "@/types/products.type"
import { t } from "@/lib/translations"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProductGroupsGridProps {
	productGroups: ProductGroup[]
}

export function ProductGroupsGrid({ productGroups }: ProductGroupsGridProps) {
	const navigate = useNavigate()
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null)
	const [deletingGroup, setDeletingGroup] = useState<ProductGroup | null>(
		null
	)

	return (
		<div className="space-y-6">
			{/* Header with Create Button */}
			<div className="flex justify-end">
				<Button onClick={() => setShowCreateDialog(true)}>
					<Plus className="mr-2 h-4 w-4" />
					{t("products.createProductGroup")}
				</Button>
			</div>

			{/* Product Groups Grid */}
			{productGroups.length === 0 ? (
				<div className="flex items-center justify-center p-12">
					<div className="text-center">
						<Package className="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 className="mt-4 text-lg font-semibold">
							{t("products.noProductGroups")}
						</h3>
						<p className="text-muted-foreground mb-4">
							{t("products.startByCreatingFirstGroup")}
						</p>
						<Button onClick={() => setShowCreateDialog(true)}>
							<Plus className="mr-2 h-4 w-4" />
							{t("products.createProductGroup")}
						</Button>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{productGroups.map((group) => (
						<ProductGroupCard
							key={group.id}
							group={group}
							onView={() => navigate(`/products/${group.id}`)}
							onEdit={() => setEditingGroup(group)}
							onDelete={() => setDeletingGroup(group)}
						/>
					))}
				</div>
			)}

			{/* Dialogs */}
			<CreateProductGroupDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
			/>

			{editingGroup && (
				<EditProductGroupDialog
					group={editingGroup}
					open={!!editingGroup}
					onOpenChange={(open) => !open && setEditingGroup(null)}
				/>
			)}

			{deletingGroup && (
				<DeleteProductGroupDialog
					group={deletingGroup}
					open={!!deletingGroup}
					onOpenChange={(open) => !open && setDeletingGroup(null)}
				/>
			)}
		</div>
	)
}

interface ProductGroupCardProps {
	group: ProductGroup
	onView: () => void
	onEdit: () => void
	onDelete: () => void
}

function ProductGroupCard({
	group,
	onView,
	onEdit,
	onDelete,
}: ProductGroupCardProps) {
	return (
		<Card
			className="cursor-pointer transition-all duration-200 hover:shadow-lg justify-between"
			onClick={onView}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="p-1 rounded-md border shadow-xs bg-background dark:bg-input/30">
						<Package className="size-6 text-blue-600" />
					</div>

					<div className="flex gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="sm" asChild>
									<Link to={`/products/${group.id}`}>
										<Eye className="size-4 text-blue-600 dark:text-blue-400" />
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{t("products.viewProductGroup")}
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={(e) => {
										e.stopPropagation()
										onEdit()
									}}
								>
									<Edit className="size-4 text-green-600 dark:text-green-400" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{t("products.editProductGroup")}
							</TooltipContent>
						</Tooltip>

						{(group.productCount || 0) === 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										onClick={(e) => {
											e.stopPropagation()
											onDelete()
										}}
									>
										<Trash2 className="h-4 w-4 text-red-500" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									{t("products.deleteProductGroup")}
								</TooltipContent>
							</Tooltip>
						)}
					</div>
				</div>
				<div>
					<CardTitle className="text-lg">{group.name}</CardTitle>
					{group.description && (
						<CardDescription className="mt-1">
							{group.description}
						</CardDescription>
					)}
				</div>
			</CardHeader>

			<CardContent className="pb-3">
				<div className="flex items-center gap-2">
					<Package className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm text-muted-foreground">
						{group.productCount || 0} {t("products.products")}
					</span>
				</div>
			</CardContent>
		</Card>
	)
}
