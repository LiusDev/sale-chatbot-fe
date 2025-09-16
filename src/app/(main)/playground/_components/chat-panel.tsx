import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ui/shadcn-io/ai/conversation"
import { Message, MessageContent } from "@/components/ui/shadcn-io/ai/message"
import {
	PromptInput,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
} from "@/components/ui/shadcn-io/ai/prompt-input"
import { Button } from "@/components/ui/button"
import { RotateCcwIcon } from "lucide-react"
import { useState } from "react"
import type { AIAgent } from "@/types/ai.type"
import type { UIMessage } from "@ai-sdk/react"
import { getModelDisplayname } from "@/lib/utils"
import { Response } from "@/components/ui/shadcn-io/ai/response"
import type { ChatStatus } from "ai"

interface ChatPanelProps {
	agent: AIAgent
	messages: UIMessage[]
	status: ChatStatus
	handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
	reset: () => void
	stop?: () => void
}

export const ChatPanel = ({
	agent,
	messages,
	status,
	handleSubmit,
	reset,
}: ChatPanelProps) => {
	const [inputValue, setInputValue] = useState("")

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-background shadow-sm">
			{/* Header */}
			<div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<div className="size-2 rounded-full bg-green-500" />
						<span className="font-medium text-sm">
							{agent.name}
						</span>
					</div>
					<div className="h-4 w-px bg-border" />
					<span className="text-muted-foreground text-xs">
						{getModelDisplayname(agent.model)}
					</span>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={reset}
					className="h-8 px-2"
				>
					<RotateCcwIcon className="size-4" />
					<span className="ml-1">Reset</span>
				</Button>
			</div>
			{/* Conversation Area */}
			<Conversation className="flex-1">
				<ConversationContent className="space-y-4">
					{messages.map((message) => (
						<div key={message.id} className="space-y-3">
							<Message from={message.role}>
								<MessageContent>
									{message.parts?.map((part, i) => {
										switch (part.type) {
											case "text":
												return (
													<Response key={i}>
														{part.text}
													</Response>
												)
											default:
												return null
										}
									})}
								</MessageContent>
							</Message>
							{/* Sources
							{message.sources && message.sources.length > 0 && (
								<div className="ml-10">
									<Sources>
										<SourcesTrigger
											count={message.sources.length}
										/>
										<SourcesContent>
											{message.sources.map(
												(source, index) => (
													<Source
														key={index}
														href={source.url}
														title={source.title}
													/>
												)
											)}
										</SourcesContent>
									</Sources>
								</div>
							)} */}
						</div>
					))}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>
			{/* Input Area */}
			<div className="border-t p-4">
				<PromptInput
					onSubmit={(e) => {
						handleSubmit(e)
						setInputValue("")
					}}
				>
					<PromptInputTextarea
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Nhập câu hỏi..."
						disabled={["submitted", "streaming"].includes(status)}
					/>
					<PromptInputToolbar className="justify-end">
						<PromptInputSubmit
							disabled={
								!inputValue.trim() ||
								["submitted"].includes(status)
							}
							status={status}
						/>
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	)
}
