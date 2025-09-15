"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCreateProductGroup } from "@/queries/products.query"
import { toast } from "sonner"
import { t } from "@/lib/translations"

const createProductGroupSchema = z.object({
	name: z
		.string()
		.min(1, t("validation.nameRequired"))
		.max(100, t("validation.nameTooLong")),
	description: z.string().optional(),
})

type CreateProductGroupForm = z.infer<typeof createProductGroupSchema>

interface CreateProductGroupDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateProductGroupDialog({
	open,
	onOpenChange,
}: CreateProductGroupDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const createProductGroup = useCreateProductGroup()

	const form = useForm<CreateProductGroupForm>({
		resolver: zodResolver(createProductGroupSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	})

	const onSubmit = async (data: CreateProductGroupForm) => {
		setIsSubmitting(true)
		try {
			await createProductGroup.mutateAsync(data)
			toast.success(t("success.productGroupCreated"))
			form.reset()
			onOpenChange(false)
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("errors.failedToCreateProductGroup")
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			form.reset()
		}
		onOpenChange(newOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{t("products.createProductGroup")}
					</DialogTitle>
					<DialogDescription>
						{t("products.createNewGroup")}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("products.name")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t(
												"products.enterGroupName"
											)}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("products.descriptionOptional")}
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t(
												"products.enterGroupDescription"
											)}
											className="resize-none"
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={isSubmitting}
							>
								{t("actions.cancel")}
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting
									? t("products.creating")
									: t("products.createGroup")}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
