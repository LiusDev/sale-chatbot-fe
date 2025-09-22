import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, Users, Bot } from "lucide-react"
import { type MetaPage } from "@/types/meta.type"
import { AssignAgentModal } from "./assign-agent-modal"

interface ChannelHeaderProps {
	page?: MetaPage
	conversationsCount: number
	onBack: () => void
	onSync: () => void
	isSyncing: boolean
}

export const ChannelHeader = ({
	page,
	conversationsCount,
	onBack,
	onSync,
	isSyncing,
}: ChannelHeaderProps) => {
	const [isAssignAgentModalOpen, setIsAssignAgentModalOpen] = useState(false)

	return (
		<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between gap-4">
					{/* Left side - Back button and page info */}
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={onBack}
							className="shrink-0"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>

						<div className="flex items-center gap-3">
							<div>
								<h1 className="text-xl font-semibold">
									{page?.name || "Loading..."}
								</h1>
								<div className="flex items-center gap-2 mt-1">
									<Badge
										variant="secondary"
										className="text-xs"
									>
										{page?.category || "Unknown"}
									</Badge>
									{page?.agent && (
										<Badge
											variant="outline"
											className="text-xs flex items-center gap-1"
										>
											<Bot className="h-3 w-3" />
											{page.agent.name}
										</Badge>
									)}
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<Users className="h-3 w-3" />
										{conversationsCount} cuộc hội thoại
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right side - Actions */}
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsAssignAgentModalOpen(true)}
							className="shrink-0"
						>
							<Bot className="mr-2 h-4 w-4" />
							{page?.agent ? "Đổi Chat bot" : "Gán Chat bot"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={onSync}
							disabled={isSyncing}
							className="shrink-0"
						>
							<RefreshCw
								className={`mr-2 h-4 w-4 ${
									isSyncing ? "animate-spin" : ""
								}`}
							/>
							{isSyncing ? "Đang đồng bộ..." : "Đồng bộ tin nhắn"}
						</Button>
					</div>
				</div>
			</div>

			{/* Assign Agent Modal */}
			<AssignAgentModal
				page={page}
				isOpen={isAssignAgentModalOpen}
				onClose={() => setIsAssignAgentModalOpen(false)}
			/>
		</div>
	)
}
