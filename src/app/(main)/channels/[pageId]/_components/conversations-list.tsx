import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	RefreshCw,
	Search,
	MessageSquare,
	User,
	Clock,
	AlertCircle,
} from "lucide-react"
import { MetaPageConversationStored } from "@/types/meta.type"
import { cn } from "@/lib/utils"

interface ConversationsListProps {
	conversations: MetaPageConversationStored[]
	selectedConversationId: string
	onConversationSelect: (conversationId: string) => void
	isLoading: boolean
	error?: Error | null
	onRefresh: () => void
}

export const ConversationsList = ({
	conversations,
	selectedConversationId,
	onConversationSelect,
	isLoading,
	error,
	onRefresh,
}: ConversationsListProps) => {
	const [searchQuery, setSearchQuery] = useState("")

	// Filter conversations based on search query
	const filteredConversations = conversations.filter(
		(conversation) =>
			conversation.recipientName
				?.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			conversation.recipientId
				?.toLowerCase()
				.includes(searchQuery.toLowerCase())
	)

	// Get conversation status badge
	const getStatusBadge = (conversation: MetaPageConversationStored) => {
		if (conversation.isConfirmOrder) {
			return (
				<Badge variant="default" className="text-xs">
					Order Confirmed
				</Badge>
			)
		}

		switch (conversation.agentmode) {
			case "auto":
				return (
					<Badge variant="secondary" className="text-xs">
						Auto
					</Badge>
				)
			case "manual":
				return (
					<Badge variant="outline" className="text-xs">
						Manual
					</Badge>
				)
			default:
				return (
					<Badge variant="secondary" className="text-xs">
						{conversation.agentmode}
					</Badge>
				)
		}
	}

	// Get recipient initials for avatar
	const getInitials = (name?: string, id?: string) => {
		if (name) {
			return name.slice(0, 2).toUpperCase()
		}
		if (id) {
			return id.slice(0, 2).toUpperCase()
		}
		return "U"
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">
						Có lỗi xảy ra
					</h3>
					<p className="text-muted-foreground text-sm">
						Không thể tải danh sách conversations
					</p>
				</div>
				<Button onClick={onRefresh} variant="outline">
					<RefreshCw className="mr-2 h-4 w-4" />
					Thử lại
				</Button>
			</div>
		)
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="border-b p-4 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Conversations</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onRefresh}
						disabled={isLoading}
					>
						<RefreshCw
							className={`h-4 w-4 ${
								isLoading ? "animate-spin" : ""
							}`}
						/>
					</Button>
				</div>

				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search conversations..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Conversations List */}
			<div className="flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center h-32">
						<div className="text-center">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
							<p className="text-sm text-muted-foreground">
								Loading conversations...
							</p>
						</div>
					</div>
				) : filteredConversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-32 p-4">
						<div className="text-center">
							<MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-sm text-muted-foreground">
								{searchQuery
									? "No conversations found"
									: "No conversations yet"}
							</p>
							{!searchQuery && (
								<p className="text-xs text-muted-foreground mt-1">
									Sync conversations to get started
								</p>
							)}
						</div>
					</div>
				) : (
					<div className="p-2 space-y-1">
						{filteredConversations.map((conversation) => (
							<div
								key={conversation.id}
								className={cn(
									"flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
									"hover:bg-accent hover:text-accent-foreground",
									selectedConversationId === conversation.id
										? "bg-accent text-accent-foreground"
										: ""
								)}
								onClick={() =>
									onConversationSelect(conversation.id)
								}
							>
								{/* Avatar */}
								<Avatar className="h-10 w-10">
									<AvatarImage
										src=""
										alt={
											conversation.recipientName || "User"
										}
									/>
									<AvatarFallback>
										{getInitials(
											conversation.recipientName,
											conversation.recipientId
										)}
									</AvatarFallback>
								</Avatar>

								{/* Content */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-1">
										<h3 className="font-medium text-sm truncate">
											{conversation.recipientName ||
												conversation.recipientId ||
												"Unknown User"}
										</h3>
										{getStatusBadge(conversation)}
									</div>

									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<User className="h-3 w-3" />
										<span>
											ID: {conversation.recipientId}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
