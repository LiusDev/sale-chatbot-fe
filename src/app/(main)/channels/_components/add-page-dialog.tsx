import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { useMetaFanpages, useUpsertMetaPages } from "@/queries/meta.query"
import { toast } from "sonner"

interface AddPageDialogProps {
	onSuccess?: () => void
}

export function AddPageDialog({ onSuccess }: AddPageDialogProps) {
	const [open, setOpen] = useState(false)
	const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())

	const {
		data: fanpagesData,
		isLoading: isLoadingFanpages,
		isError: isErrorFanpages,
		refetch: refetchFanpages,
	} = useMetaFanpages()

	const upsertPagesMutation = useUpsertMetaPages()

	const handlePageToggle = (pageId: string) => {
		setSelectedPages((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(pageId)) {
				newSet.delete(pageId)
			} else {
				newSet.add(pageId)
			}
			return newSet
		})
	}

	const handleSelectAll = () => {
		if (!fanpagesData?.data) return

		if (selectedPages.size === fanpagesData.data.length) {
			setSelectedPages(new Set())
		} else {
			setSelectedPages(new Set(fanpagesData.data.map((page) => page.id)))
		}
	}

	const handleAddPages = async () => {
		if (!fanpagesData?.data || selectedPages.size === 0) return

		const pagesToAdd = fanpagesData.data
			.filter((page) => selectedPages.has(page.id))
			.map((page) => ({
				id: page.id,
				name: page.name,
				accessToken: page.accessToken,
				category: page.category,
			}))

		try {
			await upsertPagesMutation.mutateAsync(pagesToAdd)
			toast.success(`Đã thêm ${pagesToAdd.length} trang thành công`)
			setSelectedPages(new Set())
			setOpen(false)
			onSuccess?.()
		} catch (error) {
			toast.error("Có lỗi xảy ra khi thêm trang")
			console.error("Failed to add pages:", error)
		}
	}

	const handleRefresh = () => {
		refetchFanpages()
		setSelectedPages(new Set())
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

	const isAllSelected =
		fanpagesData?.data && selectedPages.size === fanpagesData.data.length

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Thêm trang
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Thêm trang từ Meta</DialogTitle>
					<DialogDescription>
						Chọn các trang từ Meta mà bạn muốn thêm vào hệ thống.
						Chỉ hiển thị các trang mà bạn có quyền quản lý.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-hidden">
					{isLoadingFanpages ? (
						<div className="flex items-center justify-center h-32">
							<Loader2 className="h-6 w-6 animate-spin" />
							<span className="ml-2">
								Đang tải danh sách trang...
							</span>
						</div>
					) : isErrorFanpages ? (
						<div className="flex flex-col items-center justify-center h-32 space-y-4">
							<p className="text-sm text-muted-foreground">
								Không thể tải danh sách trang từ Meta
							</p>
							<Button variant="outline" onClick={handleRefresh}>
								<RefreshCw className="mr-2 h-4 w-4" />
								Thử lại
							</Button>
						</div>
					) : !fanpagesData?.data?.length ? (
						<div className="flex flex-col items-center justify-center h-32 space-y-4">
							<p className="text-sm text-muted-foreground">
								Không tìm thấy trang nào từ Meta
							</p>
							<Button variant="outline" onClick={handleRefresh}>
								<RefreshCw className="mr-2 h-4 w-4" />
								Làm mới
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							{/* Select All */}
							<div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
								<Checkbox
									id="select-all"
									checked={isAllSelected}
									onCheckedChange={handleSelectAll}
								/>
								<label
									htmlFor="select-all"
									className="text-sm font-medium cursor-pointer"
								>
									Chọn tất cả ({fanpagesData.data.length}{" "}
									trang)
								</label>
							</div>

							{/* Pages List */}
							<div className="max-h-96 overflow-y-auto space-y-2">
								{fanpagesData.data.map((page) => (
									<div
										key={page.id}
										className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
									>
										<Checkbox
											id={`page-${page.id}`}
											checked={selectedPages.has(page.id)}
											onCheckedChange={() =>
												handlePageToggle(page.id)
											}
										/>
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-2">
												<label
													htmlFor={`page-${page.id}`}
													className="font-medium cursor-pointer truncate"
												>
													{page.name}
												</label>
												<Badge
													variant="secondary"
													className={`text-xs ${getCategoryColor(
														page.category
													)}`}
												>
													{page.category}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												ID: {page.id}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Hủy
					</Button>
					<Button
						onClick={handleAddPages}
						disabled={
							selectedPages.size === 0 ||
							upsertPagesMutation.isPending ||
							isLoadingFanpages
						}
					>
						{upsertPagesMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Đang thêm...
							</>
						) : (
							`Thêm ${selectedPages.size} trang`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
