"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
	Check,
	ChevronsUpDown,
	RotateCcw,
	Save,
	Settings,
	Loader2,
} from "lucide-react"
import { AI_MODELS, AI_PARAMETER_RANGES } from "@/types/ai.type"
import type { AIAgent } from "@/types/ai.type"
import type { ProductGroup } from "@/types/products.type"
import { t } from "@/lib/translations"

interface AgentConfigPanelProps {
	selectedAgent: AIAgent | undefined
	agents: AIAgent[]
	knowledgeSources: ProductGroup[]
	isLoadingAgent: boolean
	model: string
	systemPrompt: string
	knowledgeSourceGroupId: number | null
	temperature: number
	topK: number
	maxTokens: number
	temperatureInput: string
	topKInput: string
	maxTokensInput: string
	onAgentSelect: (agentId: number) => void
	onModelChange: (model: string) => void
	onSystemPromptChange: (prompt: string) => void
	onKnowledgeSourceChange: (id: number | null) => void
	onTemperatureChange: (temp: number) => void
	onTopKChange: (topK: number) => void
	onMaxTokensChange: (tokens: number) => void
	onTemperatureInputChange: (value: string) => void
	onTopKInputChange: (value: string) => void
	onMaxTokensInputChange: (value: string) => void
	onReset: () => void
	onSave: () => void
	isSaving: boolean
}

export function AgentConfigPanel({
	selectedAgent,
	agents,
	knowledgeSources,
	isLoadingAgent,
	model,
	systemPrompt,
	knowledgeSourceGroupId,
	temperature,
	topK,
	maxTokens,
	temperatureInput,
	topKInput,
	maxTokensInput,
	onAgentSelect,
	onModelChange,
	onSystemPromptChange,
	onKnowledgeSourceChange,
	onTemperatureChange,
	onTopKChange,
	onMaxTokensChange,
	onTemperatureInputChange,
	onTopKInputChange,
	onMaxTokensInputChange,
	onReset,
	onSave,
	isSaving,
}: AgentConfigPanelProps) {
	const [isAgentSelectOpen, setIsAgentSelectOpen] = useState(false)

	const handleAgentSelect = (agentId: number) => {
		onAgentSelect(agentId)
		setIsAgentSelectOpen(false)
	}

	return (
		<div className="flex h-full flex-col">
			<div className="border-b p-4">
				<div className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					<h1 className="text-lg font-semibold">
						{t("agents.configuration")}
					</h1>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto p-4 space-y-6">
				{/* Agent Selection */}
				<div className="space-y-2">
					<Label>{t("agents.title")}</Label>
					<Popover
						open={isAgentSelectOpen}
						onOpenChange={setIsAgentSelectOpen}
					>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={isAgentSelectOpen}
								className="w-full justify-between"
							>
								{selectedAgent?.name || "Chọn Chat bot..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-full p-0">
							<Command>
								<CommandInput
									placeholder={
										t("actions.search") + " Chat bot..."
									}
								/>
								<CommandList>
									<CommandEmpty>
										Không tìm thấy Chat bot.
									</CommandEmpty>
									<CommandGroup>
										{agents.map((agent) => (
											<CommandItem
												key={agent.id}
												value={agent.id.toString()}
												onSelect={() =>
													handleAgentSelect(agent.id)
												}
											>
												<Check
													className={`mr-2 h-4 w-4 ${
														selectedAgent?.id ===
														agent.id
															? "opacity-100"
															: "opacity-0"
													}`}
												/>
												<div>
													<div className="font-medium">
														{agent.name}
													</div>
													{agent.description && (
														<div className="text-sm text-muted-foreground">
															{agent.description}
														</div>
													)}
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{isLoadingAgent ? (
					<div className="space-y-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="h-4 w-20 bg-muted animate-pulse rounded" />
								<div className="h-10 w-full bg-muted animate-pulse rounded" />
							</div>
						))}
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Model Selection */}
							<div className="space-y-2 col-span-1">
								<Label>{t("agents.model")}</Label>
								<Select
									value={model}
									onValueChange={onModelChange}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t(
												"agents.selectModel"
											)}
										/>
									</SelectTrigger>
									<SelectContent>
										{AI_MODELS.map((modelOption) => (
											<SelectItem
												key={modelOption.name}
												value={modelOption.name}
											>
												<div>
													<div className="font-medium">
														{
															modelOption.displayName
														}
													</div>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Knowledge Source */}
							<div className="space-y-2 col-span-1">
								<Label>{t("agents.knowledgeSource")}</Label>
								<Select
									value={
										knowledgeSourceGroupId?.toString() || ""
									}
									onValueChange={(value) =>
										onKnowledgeSourceChange(
											value ? parseInt(value) : null
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t(
												"agents.selectKnowledgeSource"
											)}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="null">
											{t("agents.noKnowledgeSource")}
										</SelectItem>
										{knowledgeSources.map((source) => (
											<SelectItem
												key={source.id}
												value={source.id.toString()}
											>
												<div>
													<div className="font-medium">
														{source.name}{" "}
														<span className="text-muted-foreground font-normal">
															(
															{
																source.productCount
															}{" "}
															sản phẩm)
														</span>
													</div>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* System Prompt */}
						<div className="space-y-2">
							<Label>{t("agents.systemPrompt")}</Label>
							<Textarea
								value={systemPrompt}
								onChange={(e) =>
									onSystemPromptChange(e.target.value)
								}
								placeholder={t("agents.enterSystemPrompt")}
								rows={4}
							/>
						</div>

						<Separator />

						{/* Temperature */}
						<div className="space-y-2">
							<Label>
								{t("agents.temperature")}: {temperature}
							</Label>
							<div className="flex items-center space-x-2">
								<Slider
									value={[temperature]}
									onValueChange={(value) => {
										onTemperatureChange(value[0])
										onTemperatureInputChange(
											value[0].toString()
										)
									}}
									max={AI_PARAMETER_RANGES.temperature.max}
									min={AI_PARAMETER_RANGES.temperature.min}
									step={1}
									className="flex-1"
								/>
								<Input
									type="number"
									value={temperatureInput}
									onChange={(e) =>
										onTemperatureInputChange(e.target.value)
									}
									min={AI_PARAMETER_RANGES.temperature.min}
									max={AI_PARAMETER_RANGES.temperature.max}
									className="w-20"
								/>
							</div>
						</div>

						{/* Top K */}
						<div className="space-y-2">
							<Label>Top K: {topK}</Label>
							<div className="flex items-center space-x-2">
								<Slider
									value={[topK]}
									onValueChange={(value) => {
										onTopKChange(value[0])
										onTopKInputChange(value[0].toString())
									}}
									max={AI_PARAMETER_RANGES.topK.max}
									min={AI_PARAMETER_RANGES.topK.min}
									step={1}
									className="flex-1"
								/>
								<Input
									type="number"
									value={topKInput}
									onChange={(e) =>
										onTopKInputChange(e.target.value)
									}
									min={AI_PARAMETER_RANGES.topK.min}
									max={AI_PARAMETER_RANGES.topK.max}
									className="w-20"
								/>
							</div>
						</div>

						{/* Max Tokens */}
						<div className="space-y-2">
							<Label>
								{t("agents.maxTokens")}: {maxTokens}
							</Label>
							<div className="flex items-center space-x-2">
								<Slider
									value={[maxTokens]}
									onValueChange={(value) => {
										onMaxTokensChange(value[0])
										onMaxTokensInputChange(
											value[0].toString()
										)
									}}
									max={AI_PARAMETER_RANGES.maxTokens.max}
									min={AI_PARAMETER_RANGES.maxTokens.min}
									step={10}
									className="flex-1"
								/>
								<Input
									type="number"
									value={maxTokensInput}
									onChange={(e) =>
										onMaxTokensInputChange(e.target.value)
									}
									min={AI_PARAMETER_RANGES.maxTokens.min}
									max={AI_PARAMETER_RANGES.maxTokens.max}
									className="w-20"
								/>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex space-x-2">
							<Button
								variant="outline"
								onClick={onReset}
								className="flex-1"
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								{t("ui.reset")}
							</Button>
							<Button
								onClick={onSave}
								className="flex-1"
								disabled={isSaving}
							>
								{isSaving ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Save className="mr-2 h-4 w-4" />
								)}
								{t("actions.save")}
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
