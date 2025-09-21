import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// AI UI Components
import { Message, MessageContent } from "@/components/ui/shadcn-io/ai/message"

import type { MetaPageConversationMessageStored } from "@/types/meta.type"

interface MessageItemProps {
	message: MetaPageConversationMessageStored
	pageId: string
}

export const MessageItem = ({ message, pageId }: MessageItemProps) => {
	// Parse the from field as JSON string
	const fromData =
		typeof message.from === "string"
			? JSON.parse(message.from)
			: message.from

	// Determine if message is from the page (user/admin) or customer (assistant)
	const isFromPage = fromData.id === pageId
	const isOptimistic = (message as any)._optimistic

	// Format timestamp
	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp)
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	return (
		<Message from={isFromPage ? "user" : "assistant"}>
			<MessageContent className={cn(isOptimistic && "opacity-70")}>
				<div className="space-y-2">
					{/* Message text */}
					<div className="prose prose-sm max-w-none">
						<p className="whitespace-pre-wrap m-0">
							{message.message}
						</p>
					</div>

					{/* Message metadata */}
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<div className="flex items-center gap-2">
							<span>{formatTime(message.created_time)}</span>
							{isOptimistic && (
								<Badge variant="secondary" className="text-xs">
									Sending...
								</Badge>
							)}
						</div>

						{/* Attachments indicator */}
						{message.attachments && (
							<Badge variant="outline" className="text-xs">
								Attachment
							</Badge>
						)}
					</div>
				</div>
			</MessageContent>
		</Message>
	)
}
