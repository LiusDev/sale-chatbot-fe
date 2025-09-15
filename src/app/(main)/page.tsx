import { useAuth } from "@/queries/auth.query"

export default function MainPage() {
	const { data: authData } = useAuth()
	console.log(authData?.data)
	return <div>MainPage</div>
}
