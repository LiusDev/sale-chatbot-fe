import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// ===== Image Helper Methods =====

/**
 * Convert File to base64 string with proper format
 */
export async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result)
			} else {
				reject(new Error("Failed to convert file to base64"))
			}
		}
		reader.onerror = () => reject(new Error("Failed to read file"))
	})
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
	const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
	return validTypes.includes(file.type)
}

/**
 * Validate image file size (default max 5MB)
 */
export function isValidImageSize(
	file: File,
	maxSize: number = 5 * 1024 * 1024
): boolean {
	return file.size <= maxSize
}

/**
 * Convert multiple files to base64 with validation
 */
export async function processImageFiles(
	files: File[],
	options: {
		maxSize?: number
		validateType?: boolean
	} = {}
): Promise<Array<{ url: string; file: File; index: number }>> {
	const { maxSize = 5 * 1024 * 1024, validateType = true } = options

	const results = await Promise.allSettled(
		files.map(async (file, index) => {
			// Validate file type
			if (validateType && !isValidImageType(file)) {
				throw new Error(
					`Invalid file type: ${file.type}. Supported: JPG, PNG, WebP, GIF`
				)
			}

			// Validate file size
			if (!isValidImageSize(file, maxSize)) {
				throw new Error(
					`File too large: ${file.name}. Max size: ${
						maxSize / (1024 * 1024)
					}MB`
				)
			}

			const url = await fileToBase64(file)
			return { url, file, index }
		})
	)

	// Filter successful results and throw if any failed
	const successful = results
		.filter(
			(
				result
			): result is PromiseFulfilledResult<{
				url: string
				file: File
				index: number
			}> => result.status === "fulfilled"
		)
		.map((result) => result.value)

	const failed = results
		.filter(
			(result): result is PromiseRejectedResult =>
				result.status === "rejected"
		)
		.map((result) => result.reason)

	if (failed.length > 0) {
		throw new Error(
			`Failed to process ${failed.length} files: ${failed.join(", ")}`
		)
	}

	return successful
}
