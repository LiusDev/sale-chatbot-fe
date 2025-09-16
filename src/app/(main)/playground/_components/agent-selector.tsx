"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Check, ChevronsUpDown, Settings, Loader2 } from "lucide-react"
import type { AIAgent } from "@/types/ai.type"
import { t } from "@/lib/translations"

interface AgentSelectorProps {
	agents: AIAgent[]
	selectedAgent: AIAgent | undefined
	isLoadingAgents: boolean
	onAgentSelect: (agentId: number) => void
}

export function AgentSelector({
	agents,
	selectedAgent,
	isLoadingAgents,
	onAgentSelect,
}: AgentSelectorProps) {
	const [isOpen, setIsOpen] = useState(false)

	const handleAgentSelect = (agentId: number) => {
		onAgentSelect(agentId)
		setIsOpen(false)
	}

	if (!selectedAgent) {
		return (
			<div className="flex h-full items-center justify-center">
				<Card className="w-[400px]">
					<CardHeader className="text-center">
						<Settings className="mx-auto h-12 w-12 text-muted-foreground" />
						<CardTitle>Chọn Chat bot</CardTitle>
						<CardDescription>
							Chọn một Chat bot để bắt đầu thử nghiệm trong
							playground
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Popover open={isOpen} onOpenChange={setIsOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={isOpen}
									className="w-full justify-between"
									disabled={isLoadingAgents}
								>
									{isLoadingAgents ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t("actions.loading")}
										</>
									) : (
										"Chọn Chat bot..."
									)}
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
														handleAgentSelect(
															agent.id
														)
													}
												>
													<Check className="mr-2 h-4 w-4 opacity-0" />
													<div>
														<div className="font-medium">
															{agent.name}
														</div>
														{agent.description && (
															<div className="text-sm text-muted-foreground">
																{
																	agent.description
																}
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
					</CardContent>
				</Card>
			</div>
		)
	}

	return null
}
