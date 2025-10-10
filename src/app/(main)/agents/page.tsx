import { Skeleton } from "@/components/ui/skeleton"
import { Bot } from "lucide-react"
import { useGetAIAgents } from "@/queries/ai.query"
import { AIAgentsGrid } from "./_components/ai-agents-grid"
import { t } from "@/lib/translations"

export default function AgentsPage() {
	const {
		data: response,
		isLoading,
		error,
	} = useGetAIAgents({
		page: 1,
		limit: 50,
	})

	const agents = response?.data || []

	if (isLoading) {
		return (
			<div className="container mx-auto py-6">
				<div className="flex items-center justify-between mb-6">
					<div>
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-96 mt-2" />
					</div>
				</div>
				<AIAgentsGridSkeleton />
			</div>
		)
	}

	if (error) {
		return (
			<div className="container mx-auto py-6">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							{t("agents.title")}
						</h1>
						<p className="text-muted-foreground">
							{t("agents.description")}
						</p>
					</div>
				</div>
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<Bot className="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 className="mt-4 text-lg font-semibold">
							{t("errors.failedToLoadAgents")}
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
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("agents.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("agents.description")}
					</p>
				</div>
			</div>
			<AIAgentsGrid agents={agents} />
		</div>
	)
}

function AIAgentsGridSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex justify-end">
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="border rounded-lg p-4 space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-full" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-4" />
							<Skeleton className="h-4 w-20" />
						</div>
						<Skeleton className="h-6 w-16" />
					</div>
				))}
			</div>
		</div>
	)
}
