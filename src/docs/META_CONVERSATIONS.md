# Meta Conversations Data Processing Layer

This document describes the frontend data processing layer for Meta conversations, messages, and webhook handling based on the updated API_META.md documentation.

## Overview

The data processing layer consists of three main components:

-   **Types**: TypeScript interfaces for API requests/responses
-   **Services**: API service methods for backend communication
-   **Queries**: React Query hooks for data fetching and state management

## Architecture

```
Frontend Data Layer
├── types/meta.type.ts          # TypeScript interfaces
├── services/meta.service.ts    # API service methods
├── queries/meta.query.ts       # React Query hooks
└── examples/                   # Usage examples
```

## Types (`src/types/meta.type.ts`)

### Core Interfaces

#### MetaPageConversationStored

```typescript
interface MetaPageConversationStored {
	id: string
	page_id: string
	recipientId?: string
	recipientName?: string
	agentmode: string
	isConfirmOrder: boolean
}
```

#### MetaPageConversationMessageStored

```typescript
interface MetaPageConversationMessageStored {
	id: string
	conversation_id: string
	created_time: string
	message: string
	from: {
		name: string
		id: string
	}
	attachments?: any
}
```

#### MetaWebhookPayload

```typescript
interface MetaWebhookPayload {
	object: string
	entry: Array<{
		id: string
		time: number
		messaging?: Array<{
			sender: { id: string }
			recipient: { id: string }
			timestamp: number
			message?: {
				mid: string
				text: string
				attachments?: any
			}
		}>
	}>
}
```

### API Response Types

-   `GetPageConversationsResponse` - Response for getting page conversations
-   `GetConversationMessagesResponse` - Response for getting conversation messages
-   `SendMessageResponse` - Response for sending messages
-   `WebhookEventResponse` - Response for webhook events

### Request/Parameter Types

-   `GetPageConversationsParams` - Parameters for getting page conversations
-   `GetConversationMessagesParams` - Parameters for getting conversation messages
-   `SendMessageParams` - Parameters for sending messages
-   `SendMessageRequest` - Request body for sending messages

## Services (`src/services/meta.service.ts`)

### Webhook Endpoints

#### verifyWebhook()

```typescript
async verifyWebhook(params: {
	"hub.mode": string
	"hub.challenge": string
	"hub.verify_token": string
}): Promise<string>
```

-   Webhook verification endpoint for Meta webhook setup
-   Returns challenge string if verification is successful

#### handleWebhookEvent()

```typescript
async handleWebhookEvent(payload: any, signature?: string): Promise<WebhookEventResponse>
```

-   Webhook endpoint to receive events from Meta
-   Processes incoming webhook events (messages, conversations, etc.)

### Conversation Management

#### getPageConversations()

```typescript
async getPageConversations(params: GetPageConversationsParams): Promise<GetPageConversationsResponse>
```

-   Get all conversations of a Meta page from database
-   Returns paginated list of conversations

### Message Management

#### getConversationMessages()

```typescript
async getConversationMessages(params: GetConversationMessagesParams): Promise<GetConversationMessagesResponse>
```

-   Get all messages in a conversation from database
-   Messages are sorted by creation time in descending order

#### sendMessageToConversation()

```typescript
async sendMessageToConversation(
	params: SendMessageParams,
	messageData: SendMessageRequest
): Promise<SendMessageResponse>
```

-   Send a message to a conversation via Meta API and save to database
-   Automatically saves the message to the local database

## Queries (`src/queries/meta.query.ts`)

### Query Keys

```typescript
export const metaKeys = {
	all: ["meta"] as const,
	fanpages: () => [...metaKeys.all, "fanpages"] as const,
	pages: () => [...metaKeys.all, "pages"] as const,
	page: (id: string) => [...metaKeys.pages(), id] as const,
	conversations: () => [...metaKeys.all, "conversations"] as const,
	pageConversations: (pageId: string) =>
		[...metaKeys.conversations(), "page", pageId] as const,
	conversationMessages: (pageId: string, conversationId: string) =>
		[
			...metaKeys.conversations(),
			"page",
			pageId,
			"conversation",
			conversationId,
		] as const,
	webhooks: () => [...metaKeys.all, "webhooks"] as const,
}
```

### Core Query Hooks

#### usePageConversations()

```typescript
const { data, isLoading, error } = usePageConversations(pageId)
```

-   Get page conversations from database
-   Cached for 5 minutes, kept in cache for 10 minutes
-   Automatically enabled when pageId is provided

#### useConversationMessages()

```typescript
const { data, isLoading, error } = useConversationMessages(
	pageId,
	conversationId
)
```

-   Get conversation messages from database
-   Cached for 2 minutes (messages change more frequently)
-   Automatically enabled when both pageId and conversationId are provided

#### useSendMessageToConversation()

```typescript
const sendMessage = useSendMessageToConversation()
await sendMessage.mutateAsync({ pageId, conversationId, message })
```

-   Send message to conversation
-   Automatically invalidates and refetches conversation messages
-   Also invalidates page conversations to update last message info

### Webhook Query Hooks

#### useVerifyWebhook()

```typescript
const verifyWebhook = useVerifyWebhook()
await verifyWebhook.mutateAsync({
	"hub.mode": "subscribe",
	"hub.challenge": "test_challenge",
	"hub.verify_token": "your_token",
})
```

-   Verify Meta webhook during setup process

#### useHandleWebhookEvent()

```typescript
const handleWebhookEvent = useHandleWebhookEvent()
await handleWebhookEvent.mutateAsync({
	payload: webhookPayload,
	signature: "sha256=signature",
})
```

-   Handle incoming webhook events
-   Automatically invalidates conversations queries

### Advanced Query Hooks

#### useConversationWithOptimisticUpdates()

```typescript
const { messages, sendMessageWithOptimisticUpdate, isSending } =
	useConversationWithOptimisticUpdates(pageId, conversationId)

await sendMessageWithOptimisticUpdate("Hello!")
```

-   Provides optimistic updates for sending messages
-   Immediately shows message in UI while API call is in progress
-   Automatically rolls back on error

#### usePageConversationsWithMessages()

```typescript
const { conversations, messages, isLoading, isError, error } =
	usePageConversationsWithMessages(pageId)
```

-   Combines conversations and their latest messages
-   Useful for displaying conversation previews

## Usage Examples

### Basic Conversation List

```typescript
import { usePageConversations } from "@/queries/meta.query"

const ConversationList = ({ pageId }: { pageId: string }) => {
	const {
		data: conversations,
		isLoading,
		error,
	} = usePageConversations(pageId)

	if (isLoading) return <div>Loading...</div>
	if (error) return <div>Error: {error.message}</div>

	return (
		<div>
			{conversations?.data.map((conversation) => (
				<div key={conversation.id}>
					<div>{conversation.recipientName}</div>
					<div>{conversation.agentmode}</div>
				</div>
			))}
		</div>
	)
}
```

### Message Sending with Optimistic Updates

```typescript
import { useConversationWithOptimisticUpdates } from "@/queries/meta.query"

const MessageInput = ({
	pageId,
	conversationId,
}: {
	pageId: string
	conversationId: string
}) => {
	const [message, setMessage] = useState("")
	const { sendMessageWithOptimisticUpdate, isSending } =
		useConversationWithOptimisticUpdates(pageId, conversationId)

	const handleSend = async () => {
		if (!message.trim()) return

		try {
			await sendMessageWithOptimisticUpdate(message)
			setMessage("")
		} catch (error) {
			console.error("Failed to send message:", error)
		}
	}

	return (
		<div>
			<input
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyPress={(e) => e.key === "Enter" && handleSend()}
				disabled={isSending}
			/>
			<button onClick={handleSend} disabled={isSending}>
				{isSending ? "Sending..." : "Send"}
			</button>
		</div>
	)
}
```

### Webhook Setup

```typescript
import { useVerifyWebhook, useHandleWebhookEvent } from "@/queries/meta.query"

const WebhookSetup = () => {
	const verifyWebhook = useVerifyWebhook()
	const handleWebhookEvent = useHandleWebhookEvent()

	const setupWebhook = async () => {
		// Verify webhook
		const challenge = await verifyWebhook.mutateAsync({
			"hub.mode": "subscribe",
			"hub.challenge": "meta_challenge",
			"hub.verify_token": "your_verify_token",
		})

		console.log("Webhook verified:", challenge)
	}

	const processWebhookEvent = async (payload: any, signature: string) => {
		await handleWebhookEvent.mutateAsync({ payload, signature })
	}

	return (
		<div>
			<button onClick={setupWebhook}>Setup Webhook</button>
		</div>
	)
}
```

## Caching Strategy

### Cache Times

-   **Conversations**: 5 minutes stale time, 10 minutes garbage collection
-   **Messages**: 2 minutes stale time, 5 minutes garbage collection
-   **Pages**: 10 minutes stale time, 30 minutes garbage collection

### Cache Invalidation

-   Sending a message invalidates conversation messages and page conversations
-   Syncing conversations invalidates all conversation-related queries
-   Webhook events invalidate conversations queries

### Optimistic Updates

-   Message sending provides immediate UI feedback
-   Automatic rollback on API errors
-   Temporary message IDs for optimistic messages

## Error Handling

### Query Error States

```typescript
const { data, isLoading, isError, error } = usePageConversations(pageId)

if (isError) {
	// Handle error state
	console.error("Failed to load conversations:", error)
}
```

### Mutation Error Handling

```typescript
const sendMessage = useSendMessageToConversation()

sendMessage.mutate(
	{ pageId, conversationId, message },
	{
		onError: (error) => {
			console.error("Failed to send message:", error)
			// Show error notification to user
		},
	}
)
```

## Best Practices

### 1. **Query Dependencies**

-   Always provide required parameters (pageId, conversationId)
-   Use `enabled` option to prevent unnecessary API calls

### 2. **Optimistic Updates**

-   Use optimistic updates for better UX
-   Always handle rollback scenarios
-   Mark optimistic data clearly in UI

### 3. **Cache Management**

-   Leverage React Query's automatic cache invalidation
-   Use appropriate stale times for different data types
-   Consider manual cache updates for complex scenarios

### 4. **Error Handling**

-   Provide meaningful error messages to users
-   Implement retry logic for transient errors
-   Log errors for debugging

### 5. **Performance**

-   Use pagination for large datasets
-   Implement virtual scrolling for long message lists
-   Debounce message input to reduce API calls

## Integration with Components

The data processing layer is designed to work seamlessly with React components:

1. **Import the required hooks** from `@/queries/meta.query`
2. **Use the hooks** in your components for data fetching
3. **Handle loading and error states** appropriately
4. **Implement optimistic updates** for better UX
5. **Leverage automatic cache invalidation** for data consistency

See `src/examples/meta-conversations.example.tsx` for complete implementation examples.
