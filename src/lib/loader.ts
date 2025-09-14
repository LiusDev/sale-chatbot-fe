import { redirect } from "react-router-dom"

/**
 * Utility function to get a cookie value by name
 */
function getCookie(name: string): string | null {
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) {
		return parts.pop()?.split(";").shift() || null
	}
	return null
}

/**
 * Loader for protected routes that require authentication
 * Redirects to login page if no auth_token cookie is found
 */
export async function authLoader() {
	const authToken = getCookie("auth_token")

	if (!authToken) {
		throw redirect("/auth/login")
	}

	return null
}

/**
 * Loader for auth-related routes (like login page)
 * Redirects to main page if auth_token cookie exists
 */
export async function nonAuthLoader() {
	const authToken = getCookie("auth_token")

	if (authToken) {
		throw redirect("/")
	}

	return null
}
