"use client"

import { useState } from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Bot, Edit, Trash2, Brain, Zap } from "lucide-react"
import { UpsertAIAgentDialog } from "./upsert-ai-agent-dialog"
import { DeleteAIAgentDialog } from "./delete-ai-agent-dialog"
import type { AIAgent } from "@/types/ai.type"
import { t } from "@/lib/translations"

interface AIAgentsGridProps {
	agents: AIAgent[]
}

export function AIAgentsGrid({ agents }: AIAgentsGridProps) {
	const [showUpsertDialog, setShowUpsertDialog] = useState(false)
	const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null)
	const [deletingAgent, setDeletingAgent] = useState<AIAgent | null>(null)

	const handleCreate = () => {
		setEditingAgent(null)
		setShowUpsertDialog(true)
	}

	const handleEdit = (agent: AIAgent) => {
		setEditingAgent(agent)
		setShowUpsertDialog(true)
	}

	const handleUpsertClose = () => {
		setShowUpsertDialog(false)
		setEditingAgent(null)
	}

	return (
		<div className="space-y-6">
			{/* Header with Create Button */}
			<div className="flex justify-end">
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					{t("agents.createAgent")}
				</Button>
			</div>

			{/* AI Agents Grid */}
			{agents.length === 0 ? (
				<div className="flex items-center justify-center p-12">
					<div className="text-center">
						<Bot className="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 className="mt-4 text-lg font-semibold">
							{t("agents.noAgents")}
						</h3>
						<p className="text-muted-foreground mb-4">
							{t("agents.startByCreatingFirstAgent")}
						</p>
						<Button onClick={handleCreate}>
							<Plus className="mr-2 h-4 w-4" />
							{t("agents.createAgent")}
						</Button>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{agents.map((agent) => (
						<AIAgentCard
							key={agent.id}
							agent={agent}
							onEdit={() => handleEdit(agent)}
							onDelete={() => setDeletingAgent(agent)}
						/>
					))}
				</div>
			)}

			{/* Dialogs */}
			<UpsertAIAgentDialog
				open={showUpsertDialog}
				onOpenChange={handleUpsertClose}
				agent={editingAgent || undefined}
			/>

			{deletingAgent && (
				<DeleteAIAgentDialog
					agent={deletingAgent}
					open={!!deletingAgent}
					onOpenChange={(open) => !open && setDeletingAgent(null)}
				/>
			)}
		</div>
	)
}

interface AIAgentCardProps {
	agent: AIAgent
	onEdit: () => void
	onDelete: () => void
}

function AIAgentCard({ agent, onEdit, onDelete }: AIAgentCardProps) {
	return (
		<Card className="transition-all duration-200 hover:shadow-lg justify-between">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<Bot className="h-5 w-5 text-blue-600" />
							<CardTitle className="text-lg">
								{agent.name}
							</CardTitle>
						</div>
						{agent.description && (
							<CardDescription className="mt-1">
								{agent.description}
							</CardDescription>
						)}
					</div>
					<div className="flex gap-1">
						<Button variant="outline" size="sm" onClick={onEdit}>
							<Edit className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="sm" onClick={onDelete}>
							<Trash2 className="h-4 w-4 text-red-500" />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{/* Model Badge */}
				<div className="flex items-center gap-2">
					<Brain className="h-4 w-4 text-purple-600" />
					<Badge variant="secondary" className="text-xs">
						{agent.model}
					</Badge>
				</div>

				{/* Knowledge Source */}
				<div className="flex items-center gap-2">
					<Zap className="h-4 w-4 text-green-600" />
					<span className="text-sm text-muted-foreground">
						{agent.knowledge_source_name ||
							t("agents.noKnowledgeSource")}
					</span>
				</div>

				{/* Creator Info */}
				{agent.creator_name && (
					<div className="text-xs text-muted-foreground">
						{t("agents.createdBy")}: {agent.creator_name}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
