import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

// AI UI Components
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ui/shadcn-io/ai/conversation"
import {
	PromptInput,
	PromptInputTextarea,
	PromptInputSubmit,
} from "@/components/ui/shadcn-io/ai/prompt-input"

// Local Components
import { MessageItem } from "./message-item"

// Hooks and types
import { useSendMessageToConversation } from "@/queries/meta.query"
import type { MetaPageConversationMessageStored } from "@/types/meta.type"
// import { useConversationEvents } from "@/hooks/use-conversation-events"
import { toast } from "sonner"

interface MessagesPanelProps {
	pageId: string
	conversationId: string
	messages: MetaPageConversationMessageStored[]
	isLoading: boolean
	onBack?: () => void
}

export const MessagesPanel = ({
	pageId,
	conversationId,
	messages,
	isLoading,
	onBack,
}: MessagesPanelProps) => {
	const isMobile = useIsMobile()
	const [messageInput, setMessageInput] = useState("")

	const sendMessage = useSendMessageToConversation()
	const isSending = sendMessage.isPending

	// // Setup real-time events
	// const { isConnected } = useConversationEvents({
	// 	pageId,
	// 	conversationId,
	// 	enabled: true,
	// 	onMessage: (data) => {
	// 		console.log("New message received:", data)
	// 	},
	// 	onConversation: (data) => {
	// 		console.log("Conversation updated:", data)
	// 	},
	// 	onError: (error) => {
	// 		console.error("SSE error:", error)
	// 	},
	// })

	// Determine if last end-user message is older than 24 hours
	const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000
	const lastEndUserMessageTimeMs = (() => {
		let latest = 0
		for (const message of messages) {
			try {
				const fromObj = JSON.parse(message.from) as {
					id?: string
					name?: string
				}
				// Consider end-user messages as those not sent by the page itself
				if (fromObj?.id && fromObj.id !== pageId) {
					const t = new Date(message.created_time).getTime()
					if (!Number.isNaN(t) && t > latest) latest = t
				}
			} catch {
				// ignore malformed from field
			}
		}
		return latest || 0
	})()

	const isUserInactiveOver24h = lastEndUserMessageTimeMs
		? Date.now() - lastEndUserMessageTimeMs > TWENTY_FOUR_HOURS_MS
		: false

	// Handle message sending
	const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!messageInput.trim() || isSending || isUserInactiveOver24h) return

		const message = messageInput.trim()
		setMessageInput("")

		try {
			await sendMessage.mutateAsync({
				pageId,
				conversationId,
				message,
			})
		} catch (error) {
			toast.error("Không thể gửi tin nhắn")
			console.error("Failed to send message:", error)
		}
	}

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Focus message input on 'm' key
			if (e.key === "m" && !e.ctrlKey && !e.metaKey && !e.altKey) {
				const textarea = document.querySelector(
					'textarea[placeholder*="Type your message"]'
				)
				if (textarea) {
					;(textarea as HTMLTextAreaElement).focus()
				}
			}
		}

		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [])

	// Sort messages by creation time (oldest first for display)
	const sortedMessages = [...messages].sort(
		(a, b) =>
			new Date(a.created_time).getTime() -
			new Date(b.created_time).getTime()
	)

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="border-b p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{isMobile && onBack && (
							<Button
								variant="ghost"
								size="icon"
								onClick={onBack}
								className="shrink-0"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
						)}
						<div>
							<div className="flex items-center gap-2">
								<h2 className="text-lg font-semibold">
									Messages
								</h2>
								{/* <Badge
									variant={
										isConnected ? "default" : "secondary"
									}
									className="text-xs"
								>
									{isConnected ? (
										<>
											<Wifi className="h-3 w-3 mr-1" />
											Live
										</>
									) : (
										<>
											<WifiOff className="h-3 w-3 mr-1" />
											Offline
										</>
									)}
								</Badge> */}
							</div>
							<p className="text-sm text-muted-foreground">
								{isLoading
									? "Loading..."
									: `${messages.length} messages`}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-hidden">
				{isLoading ? (
					<div className="flex items-center justify-center h-full">
						<div className="text-center">
							<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								Loading messages...
							</p>
						</div>
					</div>
				) : sortedMessages.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<div className="text-center text-muted-foreground">
							<div className="text-4xl mb-4">💬</div>
							<p className="text-sm">No messages yet</p>
							<p className="text-xs mt-1">
								Start a conversation below
							</p>
						</div>
					</div>
				) : (
					<Conversation className="h-full">
						<ConversationContent className="space-y-4">
							{sortedMessages.map((message) => (
								<MessageItem
									key={message.id}
									message={message}
									pageId={pageId}
								/>
							))}
						</ConversationContent>
						<ConversationScrollButton />
					</Conversation>
				)}
			</div>

			{/* Message Input */}
			<div className="border-t p-4">
				{isUserInactiveOver24h && (
					<div className="mb-2 text-xs text-muted-foreground">
						Tin nhắn cuối cùng từ khách đã quá 24 giờ. Không thể gửi
						trả lời.
					</div>
				)}
				<PromptInput onSubmit={handleSendMessage} className="w-full">
					<PromptInputTextarea
						value={messageInput}
						onChange={(e) => setMessageInput(e.target.value)}
						placeholder="Type your message... (Press 'm' to focus)"
						disabled={isSending || isUserInactiveOver24h}
						className="min-h-[60px] max-h-[120px]"
					/>
					<div className="flex items-center justify-end p-2">
						<PromptInputSubmit
							disabled={
								!messageInput.trim() ||
								isSending ||
								isUserInactiveOver24h
							}
						>
							{isSending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
						</PromptInputSubmit>
					</div>
				</PromptInput>
			</div>
		</div>
	)
}
