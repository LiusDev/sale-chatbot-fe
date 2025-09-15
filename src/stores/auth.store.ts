import { create } from "zustand"

interface AuthState {
	isAuthDialogOpen: boolean
	showAuthDialog: () => void
	hideAuthDialog: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
	isAuthDialogOpen: false,

	showAuthDialog: () => {
		// Chỉ mở dialog nếu chưa mở (tránh trigger nhiều lần)
		const { isAuthDialogOpen } = get()
		if (!isAuthDialogOpen) {
			set({ isAuthDialogOpen: true })
		}
	},

	hideAuthDialog: () => {
		set({ isAuthDialogOpen: false })
	},
}))
