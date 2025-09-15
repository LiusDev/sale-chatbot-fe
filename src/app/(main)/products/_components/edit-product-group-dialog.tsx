"use client"

import { useState, useEffect } from "react"
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
import { useUpdateProductGroup } from "@/queries/products.query"
import { toast } from "sonner"
import type { ProductGroup } from "@/types/products.type"

const editProductGroupSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z.string().optional(),
})

type EditProductGroupForm = z.infer<typeof editProductGroupSchema>

interface EditProductGroupDialogProps {
	group: ProductGroup
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditProductGroupDialog({
	group,
	open,
	onOpenChange,
}: EditProductGroupDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const updateProductGroup = useUpdateProductGroup()

	const form = useForm<EditProductGroupForm>({
		resolver: zodResolver(editProductGroupSchema),
		defaultValues: {
			name: group.name,
			description: group.description || "",
		},
	})

	// Reset form when group changes
	useEffect(() => {
		form.reset({
			name: group.name,
			description: group.description || "",
		})
	}, [group, form])

	const onSubmit = async (data: EditProductGroupForm) => {
		setIsSubmitting(true)
		try {
			await updateProductGroup.mutateAsync({
				params: { groupId: group.id },
				data,
			})
			toast.success("Product group updated successfully")
			onOpenChange(false)
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update product group"
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			form.reset({
				name: group.name,
				description: group.description || "",
			})
		}
		onOpenChange(newOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Product Group</DialogTitle>
					<DialogDescription>
						Update the details of your product group.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter group name"
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
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter group description (optional)"
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
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Updating..." : "Update Group"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
