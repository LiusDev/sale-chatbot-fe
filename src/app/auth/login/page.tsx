import { Button } from "@/components/ui/button"
import { useGetSSOUrl } from "@/queries/auth.query"
import { useState } from "react"
import { t } from "@/lib/translations"

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false)
	const {
		data: ssoData,
		isLoading: isFetchingSSO,
		error,
	} = useGetSSOUrl("google", window.location.origin)

	const handleGoogleLogin = async () => {
		if (!ssoData?.data?.authUrl) return

		setIsLoading(true)
		try {
			// Redirect to Google OAuth URL
			window.location.href = ssoData.data.authUrl
		} catch (error) {
			console.error("Login failed:", error)
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
			<div className="w-full max-w-md">
				{/* Login Card */}
				<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
							<svg
								className="w-8 h-8 text-white"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" />
								<path d="M12 6v6l4 2" />
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							{t('auth.welcomeBack')}
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							{t('auth.signInToAccount')}
						</p>
					</div>

					{/* Google Sign In Button */}
					<div className="space-y-4">
						<Button
							onClick={handleGoogleLogin}
							disabled={
								isLoading || isFetchingSSO || !ssoData?.data?.authUrl
							}
							className="w-full h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 font-medium"
							variant="outline"
						>
							{isLoading || isFetchingSSO ? (
								<div className="flex items-center gap-3">
									<div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
									<span>{t('auth.connecting')}</span>
								</div>
							) : (
								<div className="flex items-center gap-3">
									{/* Google Icon */}
									<svg
										className="w-5 h-5"
										viewBox="0 0 24 24"
									>
										<path
											fill="#4285f4"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="#34a853"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="#fbbc05"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="#ea4335"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									<span>{t('auth.continueWithGoogle')}</span>
								</div>
							)}
						</Button>

						{/* Error Message */}
						{error && (
							<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
								<p className="text-sm text-red-600 dark:text-red-400 text-center">
									{t('auth.failedToConnect')}
								</p>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
						<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
							{t('auth.byContining')}{" "}
							<a
								href="#"
								className="text-blue-600 dark:text-blue-400 hover:underline"
							>
								{t('auth.termsOfService')}
							</a>{" "}
							{t('auth.and')}{" "}
							<a
								href="#"
								className="text-blue-600 dark:text-blue-400 hover:underline"
							>
								{t('auth.privacyPolicy')}
							</a>
						</p>
					</div>
				</div>

				{/* Additional Info */}
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{t('auth.needHelp')}{" "}
						<a
							href="#"
							className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
						>
							{t('auth.contactSupport')}
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}
