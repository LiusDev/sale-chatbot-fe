import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Package } from "lucide-react"
import { useGetProduct } from "@/queries/products.query"
import { ProductDetail } from "../../_components/product-detail"
import { t } from "@/lib/translations"

export default function ProductDetailPage() {
	const { groupId, productId } = useParams<{
		groupId: string
		productId: string
	}>()
	const navigate = useNavigate()

	const {
		data: response,
		isLoading,
		error,
	} = useGetProduct({
		groupId: parseInt(groupId || "0"),
		productId: parseInt(productId || "0"),
	})

	if (!groupId || !productId) {
		return <div>{t("errors.invalidProductId")}</div>
	}

	const product = response?.data

	if (isLoading) {
		return (
			<div className="container mx-auto py-6">
				<div className="flex items-center gap-4 mb-6">
					<Skeleton className="h-9 w-32" />
				</div>
				<ProductDetailSkeleton />
			</div>
		)
	}

	if (error) {
		return (
			<div className="container mx-auto py-6">
				<div className="flex items-center gap-4 mb-6">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate(`/products/${groupId}`)}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("navigation.backToProducts")}
					</Button>
				</div>
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<Package className="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 className="mt-4 text-lg font-semibold">
							{t("errors.failedToLoadProduct")}
						</h3>
						<p className="text-muted-foreground">
							{error instanceof Error
								? error.message
								: t("errors.somethingWentWrong")}
						</p>
					</div>
				</div>
			</div>
		)
	}

	if (!product) {
		return (
			<div className="container mx-auto py-6">
				<div className="flex items-center gap-4 mb-6">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate(`/products/${groupId}`)}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("navigation.backToProducts")}
					</Button>
				</div>
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<Package className="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 className="mt-4 text-lg font-semibold">
							{t("errors.productNotFound")}
						</h3>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-6">
			<div className="flex items-center gap-4 mb-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate(`/products/${groupId}`)}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("navigation.backToProducts")}
				</Button>
			</div>

			<ProductDetail product={product} />
		</div>
	)
}

function ProductDetailSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-6 w-96" />
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-10 w-20" />
					<Skeleton className="h-10 w-24" />
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="space-y-4">
					<Skeleton className="aspect-square w-full rounded-lg" />
					<div className="grid grid-cols-4 gap-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								key={i}
								className="aspect-square rounded-md"
							/>
						))}
					</div>
				</div>

				<div className="space-y-6">
					<div className="border rounded-lg p-4">
						<Skeleton className="h-6 w-16 mb-4" />
						<Skeleton className="h-10 w-24" />
					</div>

					<div className="border rounded-lg p-4 space-y-4">
						<Skeleton className="h-6 w-32" />
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex justify-between">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-6 w-16" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
