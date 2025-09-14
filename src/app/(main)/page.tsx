import { useAuth } from "@/queries/auth.query"

export default function MainPage() {
	const { data: authData } = useAuth()
	console.log(authData)
	return <div>MainPage</div>
}
