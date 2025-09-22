import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Bot } from "lucide-react"
import { useAssignAgentToPage } from "@/queries/meta.query"
import { useGetAIAgents } from "@/queries/ai.query"
import { type MetaPage } from "@/types/meta.type"

interface AssignAgentModalProps {
	page?: MetaPage
	isOpen: boolean
	onClose: () => void
}

export const AssignAgentModal = ({
	page,
	isOpen,
	onClose,
}: AssignAgentModalProps) => {
	const [selectedAgentId, setSelectedAgentId] = useState<string>("")
	const [error, setError] = useState<string | null>(null)

	const assignAgentMutation = useAssignAgentToPage()
	const { data: agentsData, isLoading: isLoadingAgents } = useGetAIAgents()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!page?.id) {
			setError("ID trang là bắt buộc")
			return
		}

		if (!selectedAgentId) {
			setError("Vui lòng chọn một chat bot")
			return
		}

		setError(null)

		try {
			await assignAgentMutation.mutateAsync({
				pageId: page.id,
				agentId: Number(selectedAgentId),
			})

			// Reset form and close modal on success
			setSelectedAgentId("")
			onClose()
		} catch {
			setError(
				page?.agent
					? "Không thể đổi agent. Vui lòng thử lại."
					: "Không thể gán agent. Vui lòng thử lại."
			)
		}
	}

	const handleClose = () => {
		setSelectedAgentId("")
		setError(null)
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Bot className="h-5 w-5" />
						{page?.agent
							? "Đổi Chat bot cho Trang"
							: "Gán Chat bot cho Trang"}
					</DialogTitle>
					<DialogDescription>
						{page?.agent ? (
							<>
								Đổi chat bot hiện tại{" "}
								<span className="font-medium text-primary">
									{page.agent.name}
								</span>{" "}
								thành chat bot khác cho{" "}
								<span className="font-medium">
									{page?.name}
								</span>
							</>
						) : (
							<>
								Gán một AI chat bot để xử lý cuộc trò chuyện cho{" "}
								<span className="font-medium">
									{page?.name}
								</span>
							</>
						)}
					</DialogDescription>
				</DialogHeader>

				{/* Current Agent Info */}
				{page?.agent && (
					<div className="p-3 bg-muted rounded-lg space-y-2">
						<div className="flex items-center gap-2">
							<Bot className="h-4 w-4 text-primary" />
							<span className="text-sm font-medium">
								Chat bot hiện tại:
							</span>
						</div>
						<div className="text-sm space-y-1">
							<div>
								<span className="font-medium">Tên:</span>{" "}
								{page.agent.name}
							</div>
							{page.agent.description && (
								<div>
									<span className="font-medium">Mô tả:</span>{" "}
									{page.agent.description}
								</div>
							)}
							<div>
								<span className="font-medium">Model:</span>{" "}
								{page.agent.model}
							</div>
							<div>
								<span className="font-medium">
									Temperature:
								</span>{" "}
								{page.agent.temperature}/100
							</div>
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="agentSelect">
							{page?.agent
								? "Chọn Chat bot mới"
								: "Chọn Chat bot"}
						</Label>
						<Select
							value={selectedAgentId}
							onValueChange={setSelectedAgentId}
							disabled={
								assignAgentMutation.isPending || isLoadingAgents
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={
										isLoadingAgents
											? "Đang tải danh sách chat bot..."
											: page?.agent
											? "Chọn chat bot mới để thay thế"
											: "Chọn chat bot để gán cho trang này"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{agentsData?.data?.map((agent) => (
									<SelectItem
										key={agent.id}
										value={agent.id.toString()}
									>
										<div className="flex flex-col">
											<span className="font-medium">
												{agent.name}
											</span>
											{agent.description && (
												<span className="text-xs text-muted-foreground">
													{agent.description}
												</span>
											)}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={assignAgentMutation.isPending}
						>
							Hủy
						</Button>
						<Button
							type="submit"
							disabled={
								assignAgentMutation.isPending ||
								!selectedAgentId
							}
						>
							{assignAgentMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Đang gán...
								</>
							) : page?.agent ? (
								"Đổi Chat bot"
							) : (
								"Gán Chat bot"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
