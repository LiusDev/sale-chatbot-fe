import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Package } from "lucide-react"
import { useGetProducts } from "@/queries/products.query"
import { ProductsGrid } from "../_components/products-grid"
import { t } from "@/lib/translations"

export default function GroupProductsPage() {
	const { groupId } = useParams<{ groupId: string }>()
	const navigate = useNavigate()

	const {
		data: response,
		isLoading,
		error,
	} = useGetProducts(
		{ groupId: parseInt(groupId || "0") },
		{
			page: 1,
			limit: 50,
		}
	)

	if (!groupId) {
		return <div>Invalid group ID</div>
	}

	const products = response?.data || []

	if (isLoading) {
		return (
			<div className="container mx-auto py-6">
				<div className="flex items-center gap-4 mb-6">
					<Skeleton className="h-9 w-32" />
				</div>
				<ProductsGridSkeleton />
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
						onClick={() => navigate("/products")}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("navigation.backToProducts")}
					</Button>
				</div>
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<Package className="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 className="mt-4 text-lg font-semibold">
							{t("errors.failedToLoadProducts")}
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

	return (
		<div className="container mx-auto py-6">
			<div className="flex items-center gap-4 mb-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate("/products")}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("navigation.backToProducts")}
				</Button>
			</div>

			<ProductsGrid groupId={parseInt(groupId)} products={products} />
		</div>
	)
}

function ProductsGridSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="border rounded-lg p-4 space-y-4">
						<Skeleton className="aspect-square w-full rounded-lg" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-full" />
						</div>
						<Skeleton className="h-8 w-20" />
						<div className="flex justify-between">
							<Skeleton className="h-6 w-16" />
							<Skeleton className="h-6 w-20" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
