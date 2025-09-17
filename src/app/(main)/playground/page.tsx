"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { toast } from "sonner"

// UI Components
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable"
import { Settings, MessageSquare } from "lucide-react"

// Local Components
import { AgentSelector } from "./_components/agent-selector"
import { AgentConfigPanel } from "./_components/agent-config-panel"
import { ChatPanel } from "./_components/chat-panel"

// Hooks and services
import {
	useGetAIAgents,
	useGetAIAgent,
	useUpdateAIAgent,
} from "@/queries/ai.query"
import { useGetProductGroups } from "@/queries/products.query"
import { useIsMobile } from "@/hooks/use-mobile"
// Remove unused import
import { AI_PARAMETER_RANGES } from "@/types/ai.type"
import { BE_URL } from "@/lib/constant"

export default function PlaygroundPage() {
	const [searchParams, setSearchParams] = useSearchParams()
	const agentId = searchParams.get("agentId")
	const isMobile = useIsMobile()

	// Mobile panel state: 'config' | 'chat'
	const [activeMobilePanel, setActiveMobilePanel] = useState<'config' | 'chat'>('config')

	// States for agent configuration
	const [selectedAgentId, setSelectedAgentId] = useState<number | null>(
		agentId ? parseInt(agentId) : null
	)

	// Configuration states
	const [model, setModel] = useState<string>("gpt-4.1-mini-2025-04-14")
	const [systemPrompt, setSystemPrompt] = useState<string>("")
	const [knowledgeSourceGroupId, setKnowledgeSourceGroupId] = useState<
		number | null
	>(null)
	const [temperature, setTemperature] = useState<number>(70)
	const [topK, setTopK] = useState<number>(5)
	const [maxTokens, setMaxTokens] = useState<number>(1000)

	// Input states for direct editing
	const [temperatureInput, setTemperatureInput] = useState<string>("70")
	const [topKInput, setTopKInput] = useState<string>("5")
	const [maxTokensInput, setMaxTokensInput] = useState<string>("1000")

	// Data fetching
	const { data: agentsResponse, isLoading: isLoadingAgents } =
		useGetAIAgents()
	const { data: agentResponse, isLoading: isLoadingAgent } = useGetAIAgent(
		{ agentId: selectedAgentId! },
		{ enabled: !!selectedAgentId }
	)
	const { data: productGroupsResponse } = useGetProductGroups({})
	const updateAgentMutation = useUpdateAIAgent()

	const agents = agentsResponse?.data || []
	const selectedAgent = agentResponse?.data
	const knowledgeSources = productGroupsResponse?.data || []

	const { sendMessage, messages, setMessages, stop, status } = useChat({
		transport: new DefaultChatTransport({
			credentials: "include",
			api: `${BE_URL}/ai/playground`,
		}),
	})

	// Load agent configuration when agent is selected
	useEffect(() => {
		if (selectedAgent) {
			setModel(selectedAgent.model)
			setSystemPrompt(selectedAgent.system_prompt)
			setKnowledgeSourceGroupId(
				selectedAgent.knowledge_source_group_id || null
			)
			setTemperature(selectedAgent.temperature)
			setTopK(selectedAgent.top_k)
			setMaxTokens(selectedAgent.max_tokens)

			// Update input states
			setTemperatureInput(selectedAgent.temperature.toString())
			setTopKInput(selectedAgent.top_k.toString())
			setMaxTokensInput(selectedAgent.max_tokens.toString())
		}
	}, [selectedAgent])

	// Update URL when agent is selected
	useEffect(() => {
		if (selectedAgentId) {
			setSearchParams({ agentId: selectedAgentId.toString() })
		}
	}, [selectedAgentId, setSearchParams])

	// Handle agent selection
	const handleAgentSelect = (agentId: number) => {
		setSelectedAgentId(agentId)
		setMessages([])
		setSearchParams({ agentId: agentId.toString() })
		
		// On mobile, switch to chat panel after selecting an agent
		if (isMobile) {
			setActiveMobilePanel('chat')
		}
	}

	// Handle parameter input changes
	const handleTemperatureInputChange = (value: string) => {
		setTemperatureInput(value)
		const num = parseInt(value)
		if (
			!isNaN(num) &&
			num >= AI_PARAMETER_RANGES.temperature.min &&
			num <= AI_PARAMETER_RANGES.temperature.max
		) {
			setTemperature(num)
		}
	}

	const handleTopKInputChange = (value: string) => {
		setTopKInput(value)
		const num = parseInt(value)
		if (
			!isNaN(num) &&
			num >= AI_PARAMETER_RANGES.topK.min &&
			num <= AI_PARAMETER_RANGES.topK.max
		) {
			setTopK(num)
		}
	}

	const handleMaxTokensInputChange = (value: string) => {
		setMaxTokensInput(value)
		const num = parseInt(value)
		if (
			!isNaN(num) &&
			num >= AI_PARAMETER_RANGES.maxTokens.min &&
			num <= AI_PARAMETER_RANGES.maxTokens.max
		) {
			setMaxTokens(num)
		}
	}

	// Handle reset configuration
	const handleReset = () => {
		if (selectedAgent) {
			setModel(selectedAgent.model)
			setSystemPrompt(selectedAgent.system_prompt)
			setKnowledgeSourceGroupId(
				selectedAgent.knowledge_source_group_id || null
			)
			setTemperature(selectedAgent.temperature)
			setTopK(selectedAgent.top_k)
			setMaxTokens(selectedAgent.max_tokens)

			setTemperatureInput(selectedAgent.temperature.toString())
			setTopKInput(selectedAgent.top_k.toString())
			setMaxTokensInput(selectedAgent.max_tokens.toString())

			toast.success("Configuration reset to saved values")
		}
	}

	// Handle save configuration
	const handleSave = () => {
		if (selectedAgentId) {
			updateAgentMutation.mutate(
				{
					params: { agentId: selectedAgentId },
					data: {
						model: model as any,
						systemPrompt,
						knowledgeSourceGroupId:
							knowledgeSourceGroupId ?? undefined,
						topK,
						temperature,
						maxTokens,
					},
				},
				{
					onSuccess: () => {
						toast.success("Agent configuration saved successfully")
					},
					onError: () => {
						toast.error("Failed to save configuration")
					},
				}
			)
		}
	}

	// Handle chat form submission
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!selectedAgentId) return

		const formData = new FormData(e.currentTarget)
		const message = (formData.get("message") as string) || ""
		if (message.trim()) {
			sendMessage(
				{
					role: "user",
					parts: [{ type: "text", text: message }],
				},
				{
					body: {
						agentId: selectedAgentId,
						stream: true,
						customConfig: {
							model,
							systemPrompt,
							knowledgeSourceGroupId,
							topK,
							temperature,
							maxTokens,
						},
					},
				}
			)
			e.currentTarget.reset()
		}
	}

	// Show agent selector if no agent is selected
	if (!selectedAgentId) {
		return (
			<AgentSelector
				agents={agents}
				selectedAgent={selectedAgent}
				isLoadingAgents={isLoadingAgents}
				onAgentSelect={handleAgentSelect}
			/>
		)
	}

	return (
		<div className="h-full max-h-full">
			{isMobile ? (
				// Mobile Layout: Vertical stack with tab-like navigation
				<div className="flex h-full flex-col">
					{/* Mobile Navigation */}
					<div className="flex border-b bg-background">
						<button
							className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
								activeMobilePanel === 'config'
									? 'bg-muted border-b-2 border-primary text-primary'
									: 'text-muted-foreground hover:text-foreground'
							}`}
							onClick={() => setActiveMobilePanel('config')}
						>
							<Settings className="h-4 w-4" />
							Cấu hình
						</button>
						<button
							className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
								activeMobilePanel === 'chat'
									? 'bg-muted border-b-2 border-primary text-primary'
									: 'text-muted-foreground hover:text-foreground'
							}`}
							onClick={() => setActiveMobilePanel('chat')}
						>
							<MessageSquare className="h-4 w-4" />
							Trò chuyện
						</button>
					</div>

					{/* Mobile Panel Content */}
					<div className="flex-1 overflow-hidden">
						{activeMobilePanel === 'config' ? (
							<AgentConfigPanel
								selectedAgent={selectedAgent}
								agents={agents}
								knowledgeSources={knowledgeSources}
								isLoadingAgent={isLoadingAgent}
								model={model}
								systemPrompt={systemPrompt}
								knowledgeSourceGroupId={knowledgeSourceGroupId}
								temperature={temperature}
								topK={topK}
								maxTokens={maxTokens}
								temperatureInput={temperatureInput}
								topKInput={topKInput}
								maxTokensInput={maxTokensInput}
								onAgentSelect={handleAgentSelect}
								onModelChange={setModel}
								onSystemPromptChange={setSystemPrompt}
								onKnowledgeSourceChange={setKnowledgeSourceGroupId}
								onTemperatureChange={setTemperature}
								onTopKChange={setTopK}
								onMaxTokensChange={setMaxTokens}
								onTemperatureInputChange={handleTemperatureInputChange}
								onTopKInputChange={handleTopKInputChange}
								onMaxTokensInputChange={handleMaxTokensInputChange}
								onReset={handleReset}
								onSave={handleSave}
								isSaving={updateAgentMutation.isPending}
							/>
						) : (
							selectedAgent ? (
								<ChatPanel
									agent={selectedAgent}
									status={status}
									reset={() => setMessages([])}
									messages={messages}
									handleSubmit={handleSubmit}
									stop={stop}
								/>
							) : (
								<div className="flex items-center justify-center h-full p-4">
									<div className="text-center text-muted-foreground">
										<MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>Chọn một Chat bot để bắt đầu trò chuyện</p>
									</div>
								</div>
							)
						)}
					</div>
				</div>
			) : (
				// Desktop Layout: Horizontal resizable panels
				<ResizablePanelGroup direction="horizontal" className="h-full">
					{/* Configuration Panel */}
					<ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
						<AgentConfigPanel
							selectedAgent={selectedAgent}
							agents={agents}
							knowledgeSources={knowledgeSources}
							isLoadingAgent={isLoadingAgent}
							model={model}
							systemPrompt={systemPrompt}
							knowledgeSourceGroupId={knowledgeSourceGroupId}
							temperature={temperature}
							topK={topK}
							maxTokens={maxTokens}
							temperatureInput={temperatureInput}
							topKInput={topKInput}
							maxTokensInput={maxTokensInput}
							onAgentSelect={handleAgentSelect}
							onModelChange={setModel}
							onSystemPromptChange={setSystemPrompt}
							onKnowledgeSourceChange={setKnowledgeSourceGroupId}
							onTemperatureChange={setTemperature}
							onTopKChange={setTopK}
							onMaxTokensChange={setMaxTokens}
							onTemperatureInputChange={handleTemperatureInputChange}
							onTopKInputChange={handleTopKInputChange}
							onMaxTokensInputChange={handleMaxTokensInputChange}
							onReset={handleReset}
							onSave={handleSave}
							isSaving={updateAgentMutation.isPending}
						/>
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Chat Panel */}
					<ResizablePanel defaultSize={65}>
						{selectedAgent ? (
							<ChatPanel
								agent={selectedAgent}
								status={status}
								reset={() => setMessages([])}
								messages={messages}
								handleSubmit={handleSubmit}
								stop={stop}
							/>
						) : null}
					</ResizablePanel>
				</ResizablePanelGroup>
			)}
		</div>
	)
}
