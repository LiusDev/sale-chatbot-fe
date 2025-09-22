import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom"

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

	// Parse attachments (stored as JSON string or object or null)
	let attachmentsData: any[] | null = null
	try {
		if (message.attachments) {
			const raw =
				typeof message.attachments === "string"
					? JSON.parse(message.attachments)
					: message.attachments
			attachmentsData = raw?.data || null
		}
	} catch {
		attachmentsData = null
	}

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

					{/* Attachments */}
					{attachmentsData && attachmentsData.length > 0 && (
						<div className="mt-2 grid gap-2">
							{attachmentsData.map((item) => {
								const mime: string | undefined = item?.mime_type
								if (!mime) return null

								if (mime.startsWith("image/")) {
									const src =
										item?.image_data?.url ||
										item?.image_data?.preview_url
									if (!src) return null
									return (
										<ImageZoom key={item.id}>
											<img
												src={src}
												alt={
													item?.name ||
													"image attachment"
												}
												className="max-h-80 w-auto rounded border"
											/>
										</ImageZoom>
									)
								}

								if (mime.startsWith("video/")) {
									const src = item?.video_data?.url
									const poster = item?.video_data?.preview_url
									if (!src) return null
									return (
										<video
											key={item.id}
											controls
											className="max-h-80 w-auto rounded border"
											poster={poster}
											src={src}
										/>
									)
								}

								return null
							})}
						</div>
					)}

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

						{/* Attachments indicator (optional) */}
						{attachmentsData && attachmentsData.length > 0 && (
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
