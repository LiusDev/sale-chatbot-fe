import React, { useState } from "react"
import {
	usePageConversations,
	useConversationMessages,
	useSendMessageToConversation,
	useConversationWithOptimisticUpdates,
	useSyncPageConversations,
	useVerifyWebhook,
	useHandleWebhookEvent,
} from "@/queries/meta.query"
import type {
	MetaPageConversationStored,
	MetaPageConversationMessageStored,
} from "@/types/meta.type"

// Example component for displaying page conversations
export const PageConversationsExample = ({ pageId }: { pageId: string }) => {
	const [selectedConversationId, setSelectedConversationId] =
		useState<string>("")

	const {
		data: conversations,
		isLoading,
		error,
	} = usePageConversations(pageId)
	const { data: messages, isLoading: messagesLoading } =
		useConversationMessages(pageId, selectedConversationId)

	if (isLoading) return <div>Loading conversations...</div>
	if (error) return <div>Error loading conversations: {error.message}</div>

	return (
		<div className="flex h-screen">
			{/* Conversations List */}
			<div className="w-1/3 border-r p-4">
				<h2 className="text-lg font-semibold mb-4">Conversations</h2>
				{conversations?.data.map((conversation) => (
					<div
						key={conversation.id}
						className={`p-3 mb-2 rounded cursor-pointer ${
							selectedConversationId === conversation.id
								? "bg-blue-100 border-blue-300"
								: "bg-gray-50 hover:bg-gray-100"
						}`}
						onClick={() =>
							setSelectedConversationId(conversation.id)
						}
					>
						<div className="font-medium">
							{conversation.recipientName}
						</div>
						<div className="text-sm text-gray-600">
							{conversation.agentmode} •{" "}
							{conversation.isConfirmOrder
								? "Order Confirmed"
								: "Pending"}
						</div>
					</div>
				))}
			</div>

			{/* Messages Area */}
			<div className="flex-1 flex flex-col">
				{selectedConversationId ? (
					<ConversationMessages
						pageId={pageId}
						conversationId={selectedConversationId}
					/>
				) : (
					<div className="flex-1 flex items-center justify-center text-gray-500">
						Select a conversation to view messages
					</div>
				)}
			</div>
		</div>
	)
}

// Example component for conversation messages with optimistic updates
export const ConversationMessages = ({
	pageId,
	conversationId,
}: {
	pageId: string
	conversationId: string
}) => {
	const [messageInput, setMessageInput] = useState("")

	const { messages, sendMessageWithOptimisticUpdate, isSending } =
		useConversationWithOptimisticUpdates(pageId, conversationId)

	const handleSendMessage = async () => {
		if (!messageInput.trim()) return

		try {
			await sendMessageWithOptimisticUpdate(messageInput)
			setMessageInput("")
		} catch (error) {
			console.error("Failed to send message:", error)
		}
	}

	if (messages.isLoading) return <div>Loading messages...</div>
	if (messages.error)
		return <div>Error loading messages: {messages.error.message}</div>

	return (
		<div className="flex flex-col h-full">
			{/* Messages List */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.data?.data.map((message) => (
					<MessageBubble
						key={message.id}
						message={message}
						isOptimistic={message._optimistic}
					/>
				))}
			</div>

			{/* Message Input */}
			<div className="border-t p-4">
				<div className="flex space-x-2">
					<input
						type="text"
						value={messageInput}
						onChange={(e) => setMessageInput(e.target.value)}
						placeholder="Type your message..."
						className="flex-1 border rounded px-3 py-2"
						onKeyPress={(e) =>
							e.key === "Enter" && handleSendMessage()
						}
						disabled={isSending}
					/>
					<button
						onClick={handleSendMessage}
						disabled={!messageInput.trim() || isSending}
						className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
					>
						{isSending ? "Sending..." : "Send"}
					</button>
				</div>
			</div>
		</div>
	)
}

// Message bubble component
export const MessageBubble = ({
	message,
	isOptimistic = false,
}: {
	message: MetaPageConversationMessageStored
	isOptimistic?: boolean
}) => {
	const isFromUser = message.from.id === "current_user" // This should come from user context

	return (
		<div className={`flex ${isFromUser ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
					isFromUser
						? "bg-blue-500 text-white"
						: "bg-gray-200 text-gray-900"
				} ${isOptimistic ? "opacity-70" : ""}`}
			>
				<div className="text-sm">{message.message}</div>
				<div
					className={`text-xs mt-1 ${
						isFromUser ? "text-blue-100" : "text-gray-500"
					}`}
				>
					{new Date(message.created_time).toLocaleTimeString()}
					{isOptimistic && " (Sending...)"}
				</div>
			</div>
		</div>
	)
}

// Example component for webhook management
export const WebhookManagementExample = () => {
	const [webhookUrl, setWebhookUrl] = useState("")
	const [verifyToken, setVerifyToken] = useState("")

	const verifyWebhook = useVerifyWebhook()
	const handleWebhookEvent = useHandleWebhookEvent()

	const handleVerifyWebhook = async () => {
		try {
			const challenge = await verifyWebhook.mutateAsync({
				"hub.mode": "subscribe",
				"hub.challenge": "test_challenge",
				"hub.verify_token": verifyToken,
			})
			console.log("Webhook verified:", challenge)
		} catch (error) {
			console.error("Failed to verify webhook:", error)
		}
	}

	const handleTestWebhook = async () => {
		const testPayload = {
			object: "page",
			entry: [
				{
					id: "123456789012345",
					time: Date.now(),
					messaging: [
						{
							sender: { id: "USER_ID_123" },
							recipient: { id: "123456789012345" },
							timestamp: Date.now(),
							message: {
								mid: "MESSAGE_ID_123",
								text: "Hello from webhook test",
							},
						},
					],
				},
			],
		}

		try {
			await handleWebhookEvent.mutateAsync({
				payload: testPayload,
				signature: "sha256=test_signature",
			})
			console.log("Webhook event processed")
		} catch (error) {
			console.error("Failed to process webhook event:", error)
		}
	}

	return (
		<div className="p-6">
			<h2 className="text-xl font-semibold mb-4">Webhook Management</h2>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium mb-2">
						Webhook URL
					</label>
					<input
						type="url"
						value={webhookUrl}
						onChange={(e) => setWebhookUrl(e.target.value)}
						placeholder="https://your-domain.com/meta/webhook"
						className="w-full border rounded px-3 py-2"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-2">
						Verify Token
					</label>
					<input
						type="text"
						value={verifyToken}
						onChange={(e) => setVerifyToken(e.target.value)}
						placeholder="Your webhook verify token"
						className="w-full border rounded px-3 py-2"
					/>
				</div>

				<div className="flex space-x-4">
					<button
						onClick={handleVerifyWebhook}
						disabled={verifyWebhook.isPending}
						className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
					>
						{verifyWebhook.isPending
							? "Verifying..."
							: "Verify Webhook"}
					</button>

					<button
						onClick={handleTestWebhook}
						disabled={handleWebhookEvent.isPending}
						className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
					>
						{handleWebhookEvent.isPending
							? "Processing..."
							: "Test Webhook"}
					</button>
				</div>
			</div>
		</div>
	)
}

// Example component for sync operations
export const SyncOperationsExample = ({ pageId }: { pageId: string }) => {
	const syncConversations = useSyncPageConversations()

	const handleSyncConversations = async () => {
		try {
			await syncConversations.mutateAsync(pageId)
			console.log("Conversations synced successfully")
		} catch (error) {
			console.error("Failed to sync conversations:", error)
		}
	}

	return (
		<div className="p-6">
			<h2 className="text-xl font-semibold mb-4">Sync Operations</h2>

			<button
				onClick={handleSyncConversations}
				disabled={syncConversations.isPending}
				className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
			>
				{syncConversations.isPending
					? "Syncing..."
					: "Sync Conversations"}
			</button>
		</div>
	)
}

// Main example component
export const MetaConversationsExample = () => {
	const [pageId, setPageId] = useState("123456789012345")

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto py-8">
				<h1 className="text-3xl font-bold mb-8">
					Meta Conversations Example
				</h1>

				<div className="mb-6">
					<label className="block text-sm font-medium mb-2">
						Page ID
					</label>
					<input
						type="text"
						value={pageId}
						onChange={(e) => setPageId(e.target.value)}
						placeholder="Enter Meta Page ID"
						className="border rounded px-3 py-2 w-64"
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="bg-white rounded-lg shadow">
						<PageConversationsExample pageId={pageId} />
					</div>

					<div className="space-y-6">
						<div className="bg-white rounded-lg shadow">
							<WebhookManagementExample />
						</div>

						<div className="bg-white rounded-lg shadow">
							<SyncOperationsExample pageId={pageId} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
