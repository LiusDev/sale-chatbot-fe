import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { TanstackQueryProvider, ThemeProvider } from "./providers"
import { Toaster } from "@/components/ui/sonner"
import Router from "./routes"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider>
			<TanstackQueryProvider>
				<Router />
				<Toaster />
			</TanstackQueryProvider>
		</ThemeProvider>
	</StrictMode>
)
