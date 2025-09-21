import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"

import { useMetaPagesWithPagination } from "@/queries/meta.query"
import { MetaPageCard } from "./_components/meta-page-card"
import { AddPageDialog } from "./_components/add-page-dialog"
import { toast } from "sonner"

export default function ChannelsPage() {
	const {
		data: pagesData,
		isLoading,
		isError,
		pagination,
		setPage,
		nextPage,
		prevPage,
		canGoNext,
		canGoPrev,
		refetch,
	} = useMetaPagesWithPagination({
		page: 1,
		limit: 12,
	})

	const handleRefresh = () => {
		refetch()
		toast.success("Đã làm mới danh sách trang")
	}

	const handleAddSuccess = () => {
		refetch()
		toast.success("Đã thêm trang thành công")
	}

	if (isError) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex flex-col items-center justify-center h-64 space-y-4">
					<div className="text-center">
						<h3 className="text-lg font-semibold">Có lỗi xảy ra</h3>
						<p className="text-muted-foreground">
							Không thể tải danh sách trang
						</p>
					</div>
					<Button onClick={handleRefresh}>
						<RefreshCw className="mr-2 h-4 w-4" />
						Thử lại
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Kênh Meta</h1>
					<p className="text-muted-foreground">
						Quản lý các trang Meta của bạn
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={handleRefresh}
						disabled={isLoading}
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Làm mới
					</Button>
					<AddPageDialog onSuccess={handleAddSuccess} />
				</div>
			</div>

			{/* Pages Grid */}
			{isLoading ? (
				<div className="flex items-center justify-center h-32">
					<Loader2 className="h-6 w-6 animate-spin" />
					<span className="ml-2">Đang tải danh sách trang...</span>
				</div>
			) : !pagesData?.data?.length ? (
				<Card>
					<CardContent className="p-8">
						<div className="text-center space-y-4">
							<div className="text-4xl">📱</div>
							<div>
								<h3 className="text-lg font-semibold">
									{pagesData?.data?.length === 0
										? "Không tìm thấy trang phù hợp"
										: "Chưa có trang nào"}
								</h3>
								<p className="text-muted-foreground">
									{pagesData?.data?.length === 0
										? "Thử thay đổi bộ lọc để tìm thấy trang bạn cần"
										: "Thêm trang đầu tiên từ Meta để bắt đầu"}
								</p>
							</div>
							{pagesData?.data?.length === 0 ? (
								<AddPageDialog onSuccess={handleAddSuccess} />
							) : (
								<AddPageDialog onSuccess={handleAddSuccess} />
							)}
						</div>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{pagesData?.data?.map((page: any) => (
							<MetaPageCard
								key={page.id}
								page={page}
								onRefresh={handleRefresh}
							/>
						))}
					</div>

					{/* Pagination */}
					{pagination.totalPages > 1 && (
						<Card>
							<CardContent className="p-4">
								<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
									<div className="text-sm text-muted-foreground">
										Hiển thị{" "}
										{(pagination.currentPage - 1) *
											pagination.pageSize +
											1}{" "}
										-{" "}
										{Math.min(
											pagination.currentPage *
												pagination.pageSize,
											pagination.total
										)}{" "}
										trong tổng số {pagination.total} trang
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={prevPage}
											disabled={!canGoPrev || isLoading}
										>
											Trước
										</Button>
										<div className="flex items-center gap-1">
											{Array.from(
												{
													length: Math.min(
														5,
														pagination.totalPages
													),
												},
												(_, i) => {
													const pageNum = Math.max(
														1,
														Math.min(
															pagination.currentPage -
																2 +
																i,
															pagination.totalPages -
																4 +
																i
														)
													)
													return (
														<Button
															key={pageNum}
															variant={
																pageNum ===
																pagination.currentPage
																	? "default"
																	: "outline"
															}
															size="sm"
															onClick={() =>
																setPage(pageNum)
															}
															disabled={isLoading}
														>
															{pageNum}
														</Button>
													)
												}
											)}
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={nextPage}
											disabled={!canGoNext || isLoading}
										>
											Sau
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</>
			)}
		</div>
	)
}
