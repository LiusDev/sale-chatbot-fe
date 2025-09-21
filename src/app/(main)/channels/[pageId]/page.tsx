"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

// UI Components
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, MessageSquare, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

// Local Components
import { ConversationsList } from "./_components/conversations-list"
import { MessagesPanel } from "./_components/messages-panel"
import { ChannelHeader } from "./_components/channel-header"

// Hooks and services
import {
	usePageConversations,
	useConversationMessages,
	useSyncPageConversations,
	useStoredPages,
} from "@/queries/meta.query"

export default function ChannelDetailPage() {
	const params = useParams()
	const navigate = useNavigate()
	const isMobile = useIsMobile()

	const pageId = params.pageId as string
	const [selectedConversationId, setSelectedConversationId] =
		useState<string>("")

	// Mobile panel state: 'conversations' | 'messages'
	const [activeMobileTab, setActiveMobileTab] = useState<
		"conversations" | "messages"
	>("conversations")

	// Data fetching
	const {
		data: pagesData,
		isLoading: isLoadingPages,
		error: pagesError,
	} = useStoredPages()
	const page = pagesData?.data?.find((p) => p.id === pageId)
	const {
		data: conversationsData,
		isLoading: isLoadingConversations,
		error: conversationsError,
		refetch: refetchConversations,
	} = usePageConversations(pageId)
	const { data: messagesData, isLoading: isLoadingMessages } =
		useConversationMessages(pageId, selectedConversationId)
	const syncConversationsMutation = useSyncPageConversations()

	// Auto-select first conversation if available
	useEffect(() => {
		if (
			conversationsData?.data?.length &&
			conversationsData.data.length > 0 &&
			!selectedConversationId
		) {
			setSelectedConversationId(conversationsData.data[0].id)
		}
	}, [conversationsData?.data, selectedConversationId])

	// Handle conversation selection
	const handleConversationSelect = (conversationId: string) => {
		setSelectedConversationId(conversationId)
		// On mobile, switch to messages panel after selecting a conversation
		if (isMobile) {
			setActiveMobileTab("messages")
		}
	}

	// Handle sync conversations
	const handleSyncConversations = async () => {
		try {
			await syncConversationsMutation.mutateAsync(pageId)
			toast.success("Đã đồng bộ conversations thành công")
		} catch {
			toast.error("Không thể đồng bộ conversations")
		}
	}

	// Handle back navigation
	const handleBack = () => {
		navigate("/channels")
	}

	// Error handling
	if (pagesError) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex flex-col items-center justify-center h-64 space-y-4">
					<div className="text-center">
						<h3 className="text-lg font-semibold">Có lỗi xảy ra</h3>
						<p className="text-muted-foreground">
							Không thể tải thông tin trang
						</p>
					</div>
					<Button onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Quay lại
					</Button>
				</div>
			</div>
		)
	}

	if (isLoadingPages) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-center h-32">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">
							Đang tải thông tin trang...
						</p>
					</div>
				</div>
			</div>
		)
	}

	// Check if page exists
	if (!page) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex flex-col items-center justify-center h-64 space-y-4">
					<div className="text-center">
						<h3 className="text-lg font-semibold">
							Trang không tồn tại
						</h3>
						<p className="text-muted-foreground">
							Không tìm thấy trang với ID: {pageId}
						</p>
					</div>
					<Button onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Quay lại
					</Button>
				</div>
			</div>
		)
	}

	const conversations = conversationsData?.data || []
	const messages = messagesData?.data || []

	return (
		<div className="h-full max-h-full flex flex-col">
			{/* Header */}
			<ChannelHeader
				page={page}
				conversationsCount={conversations.length}
				onBack={handleBack}
				onSync={handleSyncConversations}
				isSyncing={syncConversationsMutation.isPending}
			/>

			{/* Main Content */}
			<div className="flex-1 overflow-hidden">
				{isMobile ? (
					// Mobile Layout: Tabs
					<Tabs
						value={activeMobileTab}
						onValueChange={(v) =>
							setActiveMobileTab(
								v as "conversations" | "messages"
							)
						}
						className="flex flex-col h-full"
					>
						<TabsList className="border-b bg-background">
							<TabsTrigger
								value="conversations"
								className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium"
							>
								<Users className="h-4 w-4" />
								Conversations ({conversations.length})
							</TabsTrigger>
							<TabsTrigger
								value="messages"
								className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium"
							>
								<MessageSquare className="h-4 w-4" />
								Messages
							</TabsTrigger>
						</TabsList>

						<TabsContent
							value="conversations"
							className="flex-1 overflow-hidden"
						>
							<ConversationsList
								conversations={conversations}
								selectedConversationId={selectedConversationId}
								onConversationSelect={handleConversationSelect}
								isLoading={isLoadingConversations}
								error={conversationsError}
								onRefresh={refetchConversations}
							/>
						</TabsContent>

						<TabsContent
							value="messages"
							className="flex-1 overflow-hidden"
						>
							{selectedConversationId ? (
								<MessagesPanel
									pageId={pageId}
									conversationId={selectedConversationId}
									messages={messages}
									isLoading={isLoadingMessages}
									onBack={() =>
										setActiveMobileTab("conversations")
									}
								/>
							) : (
								<div className="flex items-center justify-center h-full p-4">
									<div className="text-center text-muted-foreground">
										<MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>
											Chọn một conversation để xem
											messages
										</p>
									</div>
								</div>
							)}
						</TabsContent>
					</Tabs>
				) : (
					// Desktop Layout: Resizable panels
					<ResizablePanelGroup
						direction="horizontal"
						className="h-full"
					>
						{/* Conversations Panel */}
						<ResizablePanel
							defaultSize={35}
							minSize={25}
							maxSize={50}
						>
							<ConversationsList
								conversations={conversations}
								selectedConversationId={selectedConversationId}
								onConversationSelect={handleConversationSelect}
								isLoading={isLoadingConversations}
								error={conversationsError}
								onRefresh={refetchConversations}
							/>
						</ResizablePanel>

						<ResizableHandle withHandle />

						{/* Messages Panel */}
						<ResizablePanel defaultSize={65}>
							{selectedConversationId ? (
								<MessagesPanel
									pageId={pageId}
									conversationId={selectedConversationId}
									messages={messages}
									isLoading={isLoadingMessages}
								/>
							) : (
								<div className="flex items-center justify-center h-full p-4">
									<div className="text-center text-muted-foreground">
										<MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>
											Chọn một conversation để xem
											messages
										</p>
									</div>
								</div>
							)}
						</ResizablePanel>
					</ResizablePanelGroup>
				)}
			</div>
		</div>
	)
}
