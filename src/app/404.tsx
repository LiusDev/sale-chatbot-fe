import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

export default function ErrorPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
			<div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in duration-700">
				{/* Large 404 Text */}
				<div className="space-y-4">
					<h1 className="text-9xl md:text-[12rem] font-bold text-primary/20 select-none tracking-tighter">
						404
					</h1>
					<div className="space-y-2">
						<h2 className="text-3xl md:text-4xl font-bold text-foreground">
							Không tìm thấy trang
						</h2>
						<p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
							Xin lỗi, chúng tôi không thể tìm thấy trang bạn yêu
							cầu. Có thể trang đã được di chuyển, xóa hoặc bạn đã
							nhập sai URL.
						</p>
					</div>
				</div>

				{/* Illustration */}
				<div className="flex justify-center py-8">
					<div className="relative">
						<div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
							<Search className="w-16 h-16 text-primary/40" />
						</div>
						<div className="absolute -top-2 -right-2 w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
							<span className="text-destructive text-xl">!</span>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Button asChild size="lg" className="min-w-[160px]">
						<Link to="/">
							<Home className="w-4 h-4" />
							Về trang chủ
						</Link>
					</Button>
					<Button
						variant="outline"
						size="lg"
						onClick={() => window.history.back()}
						className="min-w-[160px]"
					>
						<ArrowLeft className="w-4 h-4" />
						Quay lại
					</Button>
				</div>

				{/* Help Text */}
				<div className="pt-8 border-t border-border/30">
					<p className="text-sm text-muted-foreground">
						Nếu bạn nghĩ đây là lỗi, vui lòng{" "}
						<a
							href="#"
							className="text-primary hover:underline font-medium"
							onClick={(e) => {
								e.preventDefault()
								// You can replace this with your actual contact/support logic
								console.log("Contact support clicked")
							}}
						>
							liên hệ đội hỗ trợ
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}
