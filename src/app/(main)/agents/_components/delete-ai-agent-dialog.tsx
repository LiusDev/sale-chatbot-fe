"use client"

import { useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteAIAgent } from "@/queries/ai.query"
import type { AIAgent } from "@/types/ai.type"
import { toast } from "sonner"
import { t } from "@/lib/translations"
import { AlertTriangle } from "lucide-react"

interface DeleteAIAgentDialogProps {
	agent: AIAgent
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function DeleteAIAgentDialog({
	agent,
	open,
	onOpenChange,
}: DeleteAIAgentDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false)
	const deleteAIAgent = useDeleteAIAgent()

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			await deleteAIAgent.mutateAsync({ agentId: agent.id })
			toast.success(t("success.agentDeleted"))
			onOpenChange(false)
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("errors.failedToDeleteAgent")
			)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
							<AlertTriangle className="w-5 h-5 text-red-600" />
						</div>
						<div>
							<DialogTitle className="text-left">
								{t("agents.deleteAgent")}
							</DialogTitle>
							<DialogDescription className="text-left">
								{t("agents.confirmDelete")} "{agent.name}"?
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="py-4">
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
						<p className="text-sm text-red-800 font-medium">
							⚠️ {t("agents.deleteWarning")}
						</p>

						<div className="text-sm text-red-700 space-y-2">
							<p>Thông tin sẽ bị xóa:</p>
							<ul className="list-disc pl-4 space-y-1">
								<li>Tên: {agent.name}</li>
								<li>Model: {agent.model}</li>
								<li>Hướng dẫn và cấu hình</li>
								{agent.knowledge_source_name && (
									<li>
										Nguồn tri thức:{" "}
										{agent.knowledge_source_name}
									</li>
								)}
							</ul>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
					>
						{t("actions.cancel")}
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting
							? t("agents.deleting")
							: t("agents.deleteAgentButton")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
