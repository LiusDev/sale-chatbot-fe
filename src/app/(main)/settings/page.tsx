import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Save, RotateCcw, AlertTriangle, Eye, EyeOff } from "lucide-react"
import {
	useAppInfo,
	useAppInfoWithOptimisticUpdate,
} from "@/queries/common.query"
import { t } from "@/lib/translations"

// Form validation schema
const settingsSchema = z.object({
	zalo: z.string().min(1, t("settings.fieldRequired")),
	shopName: z.string().min(1, t("settings.fieldRequired")),
	metaAccessToken: z.string().optional(),
	metaWebhookVerifyKey: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsPage() {
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

	const { data: appInfo, isLoading, error } = useAppInfo()
	const { mutateWithOptimisticUpdate, isPending } =
		useAppInfoWithOptimisticUpdate()

	const form = useForm<SettingsFormData>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			zalo: "",
			shopName: "",
			metaAccessToken: "",
			metaWebhookVerifyKey: "",
		},
	})

	// Update form when data loads
	useEffect(() => {
		if (appInfo?.success && appInfo.data) {
			const data = appInfo.data
			form.reset({
				zalo: data.zalo || "",
				shopName: data.shopName || "",
				metaAccessToken: "", // Always start with empty Meta fields
				metaWebhookVerifyKey: "", // Always start with empty Meta fields
			})
			setHasUnsavedChanges(false)
		}
	}, [appInfo, form])

	// Track form changes
	useEffect(() => {
		const subscription = form.watch(() => {
			setHasUnsavedChanges(true)
		})
		return () => subscription.unsubscribe()
	}, [form])

	const toggleSecretVisibility = (field: string) => {
		setShowSecrets((prev) => ({
			...prev,
			[field]: !prev[field],
		}))
	}

	const onSubmit = async (data: SettingsFormData) => {
		try {
			// Filter out empty optional fields
			const updateData: Record<string, string> = {
				zalo: data.zalo,
				shopName: data.shopName,
			}

			if (data.metaAccessToken && data.metaAccessToken.trim()) {
				updateData.metaAccessToken = data.metaAccessToken
			}

			if (data.metaWebhookVerifyKey && data.metaWebhookVerifyKey.trim()) {
				updateData.metaWebhookVerifyKey = data.metaWebhookVerifyKey
			}

			await mutateWithOptimisticUpdate(updateData)

			// Clear Meta fields after successful update
			form.setValue("metaAccessToken", "")
			form.setValue("metaWebhookVerifyKey", "")

			toast.success(t("settings.changesSaved"))
			setHasUnsavedChanges(false)
		} catch {
			toast.error(t("settings.errorSaving"))
		}
	}

	const resetToDefault = () => {
		if (appInfo?.success && appInfo.data) {
			const data = appInfo.data
			form.reset({
				zalo: data.zalo || "",
				shopName: data.shopName || "",
				metaAccessToken: "", // Always clear Meta fields on reset
				metaWebhookVerifyKey: "", // Always clear Meta fields on reset
			})
			setHasUnsavedChanges(false)
			toast.success(t("settings.resetSuccess"))
		}
	}

	if (isLoading) {
		return (
			<div className="container mx-auto py-6 space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">
						{t("settings.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("settings.description")}
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[1, 2].map((i) => (
						<Card key={i}>
							<CardHeader>
								<div className="h-6 bg-muted animate-pulse rounded w-1/3" />
								<div className="h-4 bg-muted animate-pulse rounded w-1/2" />
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{[1, 2].map((j) => (
										<div key={j} className="space-y-2">
											<div className="h-4 bg-muted animate-pulse rounded w-1/4" />
											<div className="h-10 bg-muted animate-pulse rounded" />
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="container mx-auto py-6">
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						Không thể tải cài đặt. Vui lòng thử lại sau.
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">{t("settings.title")}</h1>
				<p className="text-muted-foreground">
					{t("settings.description")}
				</p>
			</div>

			{/* Unsaved Changes Alert */}
			{hasUnsavedChanges && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						{t("settings.unsavedChanges")}
					</AlertDescription>
				</Alert>
			)}

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{t("settings.appInfomation")}
							</CardTitle>
							<CardDescription>
								{t("settings.appInfoDescription")}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="shopName">
									{t("settings.shopName")}
								</Label>
								<Input
									id="shopName"
									{...form.register("shopName")}
									placeholder="Nhập tên cửa hàng"
									className={
										form.formState.errors.shopName
											? "border-destructive"
											: ""
									}
								/>
								{form.formState.errors.shopName && (
									<p className="text-sm text-destructive">
										{form.formState.errors.shopName.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="zalo">
									{t("settings.zalo")}
								</Label>
								<Input
									id="zalo"
									{...form.register("zalo")}
									placeholder="Nhập thông tin Zalo"
									className={
										form.formState.errors.zalo
											? "border-destructive"
											: ""
									}
								/>
								{form.formState.errors.zalo && (
									<p className="text-sm text-destructive">
										{form.formState.errors.zalo.message}
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Meta Configuration */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{t("settings.metaConfiguration")}
								<Badge variant="secondary">Meta</Badge>
							</CardTitle>
							<CardDescription>
								{t("settings.metaConfigurationDescription")}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
								{t("settings.metaFieldsNote")}
							</div>
							<div className="space-y-2">
								<Label htmlFor="metaAccessToken">
									{t("settings.metaAccessToken")}{" "}
									<span className="text-muted-foreground">
										(tùy chọn)
									</span>
								</Label>
								<div className="relative">
									<Input
										id="metaAccessToken"
										type={
											showSecrets.metaAccessToken
												? "text"
												: "password"
										}
										{...form.register("metaAccessToken")}
										placeholder="Nhập Meta Access Token mới (tùy chọn)"
										className={
											form.formState.errors
												.metaAccessToken
												? "border-destructive pr-10"
												: "pr-10"
										}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() =>
											toggleSecretVisibility(
												"metaAccessToken"
											)
										}
										className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
									>
										{showSecrets.metaAccessToken ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
								{form.formState.errors.metaAccessToken && (
									<p className="text-sm text-destructive">
										{
											form.formState.errors
												.metaAccessToken.message
										}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="metaWebhookVerifyKey">
									{t("settings.metaWebhookVerifyKey")}{" "}
									<span className="text-muted-foreground">
										(tùy chọn)
									</span>
								</Label>
								<div className="relative">
									<Input
										id="metaWebhookVerifyKey"
										type={
											showSecrets.metaWebhookVerifyKey
												? "text"
												: "password"
										}
										{...form.register(
											"metaWebhookVerifyKey"
										)}
										placeholder="Nhập Meta Webhook Verify Key mới (tùy chọn)"
										className={
											form.formState.errors
												.metaWebhookVerifyKey
												? "border-destructive pr-10"
												: "pr-10"
										}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() =>
											toggleSecretVisibility(
												"metaWebhookVerifyKey"
											)
										}
										className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
									>
										{showSecrets.metaWebhookVerifyKey ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
								{form.formState.errors.metaWebhookVerifyKey && (
									<p className="text-sm text-destructive">
										{
											form.formState.errors
												.metaWebhookVerifyKey.message
										}
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-between items-center pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={resetToDefault}
						disabled={isPending}
					>
						<RotateCcw className="h-4 w-4 mr-2" />
						{t("settings.resetToDefault")}
					</Button>

					<div className="flex gap-2">
						<Button
							type="submit"
							disabled={isPending || !hasUnsavedChanges}
						>
							<Save className="h-4 w-4 mr-2" />
							{isPending
								? t("settings.saving")
								: t("settings.saveChanges")}
						</Button>
					</div>
				</div>
			</form>
		</div>
	)
}
