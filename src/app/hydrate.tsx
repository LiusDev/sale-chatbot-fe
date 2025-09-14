import { Loader2, MessageSquare, Bot } from "lucide-react"

export default function Hydrate() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
			<div className="max-w-md mx-auto text-center space-y-8 animate-in fade-in duration-500">
				{/* App Logo/Brand */}
				<div className="space-y-4">
					<div className="relative mx-auto w-24 h-24 mb-6">
						{/* Main logo container */}
						<div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/20">
							<MessageSquare className="w-12 h-12 text-primary" />
						</div>
						{/* Bot indicator */}
						<div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
							<Bot className="w-4 h-4 text-primary-foreground" />
						</div>
					</div>

					<div className="space-y-2">
						<h1 className="text-2xl font-bold text-foreground">
							Sale Chatbot
						</h1>
						<p className="text-sm text-muted-foreground">
							Initializing your AI assistant...
						</p>
					</div>
				</div>

				{/* Loading Animation */}
				<div className="space-y-6">
					{/* Spinner */}
					<div className="flex justify-center">
						<Loader2 className="w-8 h-8 text-primary animate-spin" />
					</div>

					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="w-full bg-muted rounded-full h-2 overflow-hidden">
							<div className="h-full bg-primary rounded-full animate-pulse w-3/4 transition-all duration-1000" />
						</div>
						<p className="text-xs text-muted-foreground">
							Loading components and data...
						</p>
					</div>
				</div>

				{/* Status Messages */}
				<div className="space-y-3 min-h-[60px]">
					<div className="animate-pulse">
						<p className="text-sm text-muted-foreground">
							<span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
							Setting up chat environment
						</p>
					</div>
				</div>

				{/* Subtle Footer */}
				<div className="pt-8">
					<p className="text-xs text-muted-foreground/60">
						Powered by AI • Built with React
					</p>
				</div>
			</div>
		</div>
	)
}
