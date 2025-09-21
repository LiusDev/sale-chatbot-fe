import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	MoreHorizontal,
	Trash2,
	ExternalLink,
	MessageSquare,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { MetaPage } from "@/types/meta.type"
import { useDeletePage } from "@/queries/meta.query"
import { useState } from "react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MetaPageCardProps {
	page: MetaPage
	onRefresh?: () => void
}

export function MetaPageCard({ page, onRefresh }: MetaPageCardProps) {
	const navigate = useNavigate()
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const deletePageMutation = useDeletePage()

	const handleDelete = async () => {
		try {
			await deletePageMutation.mutateAsync(page.id)
			onRefresh?.()
		} catch (error) {
			console.error("Failed to delete page:", error)
		} finally {
			setShowDeleteDialog(false)
		}
	}

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			Business: "bg-blue-100 text-blue-800",
			"Shopping/Retail": "bg-green-100 text-green-800",
			Entertainment: "bg-purple-100 text-purple-800",
			Education: "bg-orange-100 text-orange-800",
			Technology: "bg-gray-100 text-gray-800",
		}
		return colors[category] || "bg-gray-100 text-gray-800"
	}

	return (
		<>
			<Card
				className="hover:shadow-md transition-shadow cursor-pointer"
				onClick={() => navigate(`/channels/${page.id}`)}
			>
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<CardTitle className="text-lg font-semibold line-clamp-1">
								{page.name}
							</CardTitle>
							<Badge
								variant="secondary"
								className={`text-xs ${getCategoryColor(
									page.category || ""
								)}`}
							>
								{page.category}
							</Badge>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => e.stopPropagation()}
								>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										navigate(`/channels/${page.id}`)
									}}
								>
									<MessageSquare className="mr-2 h-4 w-4" />
									Quản lý conversations
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										// TODO: Open page in Meta
										console.log(
											"Open page in Meta:",
											page.id
										)
									}}
								>
									<ExternalLink className="mr-2 h-4 w-4" />
									Mở trên Meta
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										setShowDeleteDialog(true)
									}}
									className="text-red-600"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Xóa trang
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">
							<span className="font-medium">ID:</span> {page.id}
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<MessageSquare className="h-3 w-3" />
							<span>Click để quản lý conversations</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa trang</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa trang "{page.name}"? Hành
							động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deletePageMutation.isPending}
							className="bg-red-600 hover:bg-red-700"
						>
							{deletePageMutation.isPending
								? "Đang xóa..."
								: "Xóa"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
