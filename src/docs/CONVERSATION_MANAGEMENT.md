# Conversation Management System

This document describes the conversation management system for Meta channels, including the UI components, real-time features, and architecture.

## Overview

The conversation management system allows users to:

-   View and manage conversations from Meta pages
-   Send and receive messages in real-time
-   Monitor conversation status and agent modes
-   Handle optimistic updates for better UX

## Architecture

```
Conversation Management
├── pages/[pageId]/page.tsx           # Main channel detail page
├── _components/
│   ├── channel-header.tsx            # Page header with sync controls
│   ├── conversations-list.tsx        # Left panel: conversations list
│   ├── messages-panel.tsx            # Right panel: messages interface
│   └── message-item.tsx              # Individual message component
├── hooks/
│   └── use-conversation-events.ts    # SSE hook for real-time updates
└── queries/
    └── meta.query.ts                 # Data fetching hooks
```

## Components

### 1. Channel Detail Page (`/channels/[pageId]/page.tsx`)

The main page that orchestrates the conversation management interface.

**Features:**

-   Responsive layout (desktop: resizable panels, mobile: tabs)
-   Real-time data fetching with React Query
-   Error handling and loading states
-   Navigation back to channels list

**Layout:**

-   **Desktop**: Resizable horizontal panels (conversations | messages)
-   **Mobile**: Tabbed interface (conversations tab | messages tab)

### 2. Channel Header (`channel-header.tsx`)

Header component with page information and sync controls.

**Features:**

-   Page name and category display
-   Conversation count
-   Sync conversations button
-   Back navigation

### 3. Conversations List (`conversations-list.tsx`)

Left panel displaying all conversations for a page.

**Features:**

-   Search and filter conversations
-   Conversation status badges (auto/manual, order confirmed)
-   Recipient information with avatars
-   Real-time updates via SSE
-   Loading and error states

**Conversation Status:**

-   `auto` - AI agent handling automatically
-   `manual` - Requires human intervention
-   `Order Confirmed` - Order has been confirmed

### 4. Messages Panel (`messages-panel.tsx`)

Right panel displaying messages for the selected conversation.

**Features:**

-   Message list with AI UI components
-   Real-time message updates
-   Optimistic message sending
-   Connection status indicator
-   Keyboard shortcuts ('m' to focus input)
-   Auto-scroll to bottom

**Real-time Features:**

-   Live connection status (Wifi/WifiOff icons)
-   Automatic message updates via SSE
-   Optimistic UI updates for sent messages

### 5. Message Item (`message-item.tsx`)

Individual message component using AI UI components.

**Features:**

-   User/assistant message styling
-   Timestamp display
-   Optimistic message indication
-   Attachment support (future)
-   Avatar display

## Real-time Features

### EventSource/SSE Integration

The system uses Server-Sent Events (SSE) for real-time updates:

```typescript
// Event types
interface ConversationEvent {
	type: "message" | "conversation" | "error"
	data: any
	timestamp: string
}
```

**Connection Management:**

-   Automatic reconnection with exponential backoff
-   Connection status indicators
-   Error handling and user notifications
-   Cleanup on component unmount

**Event Handling:**

-   `message` events: Update message lists and conversation info
-   `conversation` events: Update conversation list
-   `error` events: Handle connection errors

### Optimistic Updates

Messages are immediately shown in the UI before API confirmation:

```typescript
const sendMessageWithOptimisticUpdate = (message: string) => {
	// 1. Add message to UI immediately
	// 2. Send to API
	// 3. Rollback on error
}
```

**Features:**

-   Immediate UI feedback
-   Automatic rollback on errors
-   Visual indication of sending state
-   Temporary message IDs

## Data Flow

### 1. Page Load

```
User clicks page → Navigate to /channels/[pageId] → Load page data → Load conversations → Auto-select first conversation → Load messages
```

### 2. Message Sending

```
User types message → Optimistic update → Send to API → Update UI → SSE confirmation → Final UI state
```

### 3. Real-time Updates

```
SSE connection → Receive event → Invalidate queries → Refetch data → Update UI
```

## Responsive Design

### Desktop Layout

-   Resizable panels (35% conversations, 65% messages)
-   Horizontal layout
-   Full feature set

### Mobile Layout

-   Tabbed interface
-   Full-width panels
-   Touch-optimized interactions
-   Simplified navigation

## State Management

### React Query Integration

-   Automatic caching and invalidation
-   Background refetching
-   Optimistic updates
-   Error handling

### Local State

-   Selected conversation ID
-   Mobile tab state
-   Message input state
-   Connection status

## Error Handling

### Query Errors

-   Loading states with spinners
-   Error boundaries with retry buttons
-   User-friendly error messages

### SSE Errors

-   Connection status indicators
-   Automatic reconnection
-   User notifications for persistent failures

### Message Errors

-   Optimistic rollback
-   Error toasts
-   Retry mechanisms

## Performance Considerations

### Caching Strategy

-   **Conversations**: 5 minutes stale time
-   **Messages**: 2 minutes stale time
-   **Pages**: 10 minutes stale time

### Optimization

-   Virtual scrolling for large message lists (future)
-   Message pagination (future)
-   Image lazy loading (future)
-   Debounced search

## Future Enhancements

### Planned Features

1. **Message Attachments**: File upload and display
2. **Message Reactions**: Like/react to messages
3. **Message Search**: Full-text search within conversations
4. **Message Export**: Export conversations to PDF/CSV
5. **Typing Indicators**: Show when users are typing
6. **Message Status**: Delivered, read receipts
7. **Voice Messages**: Audio message support
8. **Message Templates**: Quick reply templates
9. **Bulk Actions**: Select multiple conversations
10. **Advanced Filtering**: Filter by date, status, etc.

### Technical Improvements

1. **Virtual Scrolling**: Handle thousands of messages
2. **Message Pagination**: Load messages in chunks
3. **Offline Support**: Queue messages when offline
4. **Push Notifications**: Browser notifications for new messages
5. **Message Encryption**: End-to-end encryption
6. **Analytics**: Message metrics and insights

## Usage Examples

### Basic Usage

```typescript
// Navigate to conversation management
navigate(`/channels/${pageId}`)

// The page will automatically:
// 1. Load page information
// 2. Load conversations
// 3. Auto-select first conversation
// 4. Load messages
// 5. Setup real-time connection
```

### Custom Integration

```typescript
// Use individual components
<ConversationsList
  conversations={conversations}
  selectedConversationId={selectedId}
  onConversationSelect={handleSelect}
/>

<MessagesPanel
  pageId={pageId}
  conversationId={conversationId}
  messages={messages}
/>
```

### Real-time Events

```typescript
const { isConnected } = useConversationEvents({
	pageId,
	conversationId,
	onMessage: (data) => console.log("New message:", data),
	onConversation: (data) => console.log("Conversation updated:", data),
})
```

## API Integration

The system integrates with the Meta API endpoints:

-   `GET /meta/pages/:pageId` - Get page conversations
-   `GET /meta/pages/:pageId/:conversationId` - Get conversation messages
-   `POST /meta/pages/:pageId/:conversationId` - Send message
-   `PATCH /meta/pages/:pageId/sync` - Sync conversations
-   `GET /meta/events` - SSE endpoint for real-time updates

## Security Considerations

-   All API calls include authentication tokens
-   SSE connections are authenticated
-   Message content is sanitized
-   User permissions are validated
-   Rate limiting for message sending

## Testing

### Unit Tests

-   Component rendering
-   User interactions
-   Error handling
-   State management

### Integration Tests

-   API integration
-   SSE connection
-   Optimistic updates
-   Navigation flows

### E2E Tests

-   Complete user workflows
-   Real-time features
-   Responsive behavior
-   Error scenarios
