"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useCreateAIAgent, useUpdateAIAgent } from "@/queries/ai.query"
import { useGetProductGroups } from "@/queries/products.query"
import { AI_MODELS, AI_PARAMETER_RANGES, type AIAgent } from "@/types/ai.type"
import { toast } from "sonner"
import { t } from "@/lib/translations"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const aiAgentSchema = z.object({
	name: z
		.string()
		.min(1, t("validation.nameRequired"))
		.max(100, t("validation.nameTooLong")),
	description: z.string().optional(),
	model: z.enum(AI_MODELS.map((model) => model.name)),
	systemPrompt: z.string().min(1, "System prompt là bắt buộc"),
	knowledgeSourceGroupId: z.number().optional(),
	temperature: z.number().min(0).max(100).optional(),
	topK: z.number().min(1).max(50).optional(),
	maxTokens: z.number().min(100).max(4000).optional(),
})

type AIAgentForm = z.infer<typeof aiAgentSchema>

interface UpsertAIAgentDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	agent?: AIAgent // undefined for create, defined for edit
}

export function UpsertAIAgentDialog({
	open,
	onOpenChange,
	agent,
}: UpsertAIAgentDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [knowledgeSourceOpen, setKnowledgeSourceOpen] = useState(false)
	const createAIAgent = useCreateAIAgent()
	const updateAIAgent = useUpdateAIAgent()
	const { data: productGroupsResponse } = useGetProductGroups()
	const productGroups = productGroupsResponse?.data || []

	const isEditing = !!agent
	const modalTitle = isEditing
		? t("agents.editAgent")
		: t("agents.createAgent")
	const modalDescription = isEditing
		? t("agents.updateAgentDetails")
		: t("agents.createNewAgent")
	const submitButtonText = isEditing
		? t("agents.saveChanges")
		: t("agents.createAgentButton")
	const submittingText = isEditing ? t("agents.saving") : t("agents.creating")

	const form = useForm<AIAgentForm>({
		resolver: zodResolver(aiAgentSchema),
		defaultValues: {
			name: "",
			description: "",
			model: AI_MODELS[0]?.name || "",
			systemPrompt: "",
			temperature: AI_PARAMETER_RANGES.temperature.default,
			topK: AI_PARAMETER_RANGES.topK.default,
			maxTokens: AI_PARAMETER_RANGES.maxTokens.default,
		},
	})

	// Reset form when agent changes or modal opens
	useEffect(() => {
		if (open) {
			if (agent) {
				// Edit mode - populate with existing data
				form.reset({
					name: agent.name,
					description: agent.description || "",
					model: agent.model,
					systemPrompt: agent.system_prompt,
					knowledgeSourceGroupId:
						agent.knowledge_source_group_id || undefined,
					temperature: agent.temperature,
					topK: agent.top_k,
					maxTokens: agent.max_tokens,
				})
			} else {
				// Create mode - reset to defaults
				form.reset({
					name: "",
					description: "",
					model: AI_MODELS[0]?.name || "",
					systemPrompt: "",
					temperature: AI_PARAMETER_RANGES.temperature.default,
					topK: AI_PARAMETER_RANGES.topK.default,
					maxTokens: AI_PARAMETER_RANGES.maxTokens.default,
				})
			}
		}
	}, [agent, open, form])

	const onSubmit = async (data: AIAgentForm) => {
		setIsSubmitting(true)
		try {
			if (isEditing && agent) {
				// Update existing agent
				await updateAIAgent.mutateAsync({
					params: { agentId: agent.id },
					data,
				})
				toast.success(t("success.agentUpdated"))
			} else {
				// Create new agent
				await createAIAgent.mutateAsync(data)
				toast.success(t("success.agentCreated"))
			}
			onOpenChange(false)
		} catch (error) {
			const errorMessage = isEditing
				? t("errors.failedToUpdateAgent")
				: t("errors.failedToCreateAgent")
			toast.error(error instanceof Error ? error.message : errorMessage)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			form.reset()
		}
		onOpenChange(newOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{modalTitle}</DialogTitle>
					<DialogDescription>{modalDescription}</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{/* Basic Information */}
						<div className="space-y-4">
							<h4 className="text-sm font-medium border-b pb-2">
								{t("agents.basicSettings")}
							</h4>

							<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem className="col-span-5">
											<FormLabel>
												{t("agents.name")}
											</FormLabel>
											<FormControl>
												<Input
													placeholder={t(
														"agents.enterAgentName"
													)}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-7">
									<FormField
										control={form.control}
										name="model"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{t("agents.model")}
												</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue
																placeholder={t(
																	"agents.selectModel"
																)}
															>
																{field.value
																	? AI_MODELS.find(
																			(
																				m
																			) =>
																				m.name ===
																				field.value
																	  )
																			?.displayName
																	: t(
																			"agents.selectModel"
																	  )}
															</SelectValue>
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{AI_MODELS.map(
															(model) => (
																<SelectItem
																	key={
																		model.name
																	}
																	value={
																		model.name
																	}
																>
																	<div>
																		<div className="font-medium">
																			{
																				model.displayName
																			}
																		</div>
																		{model.description && (
																			<div className="text-xs text-muted-foreground">
																				{
																					model.description
																				}
																			</div>
																		)}
																	</div>
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="knowledgeSourceGroupId"
										render={({ field }) => {
											const selectedGroup = field.value
												? productGroups.find(
														(g) =>
															g.id === field.value
												  )
												: null

											return (
												<FormItem className="flex flex-col">
													<FormLabel>
														{t(
															"agents.knowledgeSource"
														)}
													</FormLabel>
													<Popover
														open={
															knowledgeSourceOpen
														}
														onOpenChange={
															setKnowledgeSourceOpen
														}
													>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant="outline"
																	role="combobox"
																	aria-expanded={
																		knowledgeSourceOpen
																	}
																	className={cn(
																		"w-full justify-between",
																		!field.value &&
																			"text-muted-foreground"
																	)}
																>
																	{selectedGroup?.name ||
																		"Chọn dữ liệu sản phẩm"}
																	<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent className="w-full p-0">
															<Command>
																<CommandInput
																	placeholder={t(
																		"agents.selectKnowledgeSource"
																	)}
																/>
																<CommandList>
																	<CommandEmpty>
																		Không
																		tìm thấy
																		nhóm sản
																		phẩm
																		nào.
																	</CommandEmpty>
																	<CommandGroup>
																		{productGroups.map(
																			(
																				group
																			) => (
																				<CommandItem
																					key={
																						group.id
																					}
																					value={
																						group.name
																					}
																					onSelect={() => {
																						field.onChange(
																							group.id
																						)
																						setKnowledgeSourceOpen(
																							false
																						)
																					}}
																				>
																					<Check
																						className={cn(
																							"mr-2 h-4 w-4",
																							field.value ===
																								group.id
																								? "opacity-100"
																								: "opacity-0"
																						)}
																					/>
																					{
																						group.name
																					}
																				</CommandItem>
																			)
																		)}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
													<FormMessage />
												</FormItem>
											)
										}}
									/>
								</div>
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("products.descriptionOptional")}
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Mô tả về Chat bot này..."
												className="resize-none"
												rows={2}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* System Prompt */}
						<FormField
							control={form.control}
							name="systemPrompt"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("agents.systemPrompt")}
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t(
												"agents.enterSystemPrompt"
											)}
											className="resize-none"
											rows={4}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Advanced Settings in Accordion */}
						<Accordion type="single" collapsible className="w-full">
							<AccordionItem value="advanced-settings">
								<AccordionTrigger className="text-sm font-medium">
									{t("agents.advancedSettings")}
								</AccordionTrigger>
								<AccordionContent className="space-y-6 pt-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<FormField
											control={form.control}
											name="temperature"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															"agents.temperature"
														)}
														:{" "}
														{field.value ??
															AI_PARAMETER_RANGES
																.temperature
																.default}
													</FormLabel>
													<FormControl>
														<Slider
															value={[
																field.value ??
																	AI_PARAMETER_RANGES
																		.temperature
																		.default,
															]}
															onValueChange={(
																value
															) =>
																field.onChange(
																	value[0]
																)
															}
															max={100}
															min={0}
															step={5}
															className="w-full"
														/>
													</FormControl>
													<FormDescription>
														{t(
															"agents.temperatureDescription"
														)}
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="topK"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t("agents.topK")}:{" "}
														{field.value ??
															AI_PARAMETER_RANGES
																.topK.default}
													</FormLabel>
													<FormControl>
														<Slider
															value={[
																field.value ??
																	AI_PARAMETER_RANGES
																		.topK
																		.default,
															]}
															onValueChange={(
																value
															) =>
																field.onChange(
																	value[0]
																)
															}
															max={50}
															min={1}
															step={1}
															className="w-full"
														/>
													</FormControl>
													<FormDescription>
														{t(
															"agents.topKDescription"
														)}
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="maxTokens"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{t("agents.maxTokens")}:{" "}
													{field.value ??
														AI_PARAMETER_RANGES
															.maxTokens.default}
												</FormLabel>
												<FormControl>
													<Slider
														value={[
															field.value ??
																AI_PARAMETER_RANGES
																	.maxTokens
																	.default,
														]}
														onValueChange={(
															value
														) =>
															field.onChange(
																value[0]
															)
														}
														max={4000}
														min={100}
														step={100}
														className="w-full"
													/>
												</FormControl>
												<FormDescription>
													{t(
														"agents.maxTokensDescription"
													)}
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</AccordionContent>
							</AccordionItem>
						</Accordion>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={isSubmitting}
							>
								{t("actions.cancel")}
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting
									? submittingText
									: submitButtonText}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
