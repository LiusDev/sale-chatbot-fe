import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { TanstackQueryProvider, ThemeProvider } from "./providers"
import Router from "./routes"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider>
			<TanstackQueryProvider>
				<Router />
			</TanstackQueryProvider>
		</ThemeProvider>
	</StrictMode>
)
