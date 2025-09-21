import AgentsLayout from "@/app/(main)/agents/layout"
import AgentsPage from "@/app/(main)/agents/page"
import ChannelsLayout from "@/app/(main)/channels/layout"
import ChannelsPage from "@/app/(main)/channels/page"
import MainLayout from "@/app/(main)/layout"
import MainPage from "@/app/(main)/page"
import PlaygroundLayout from "@/app/(main)/playground/layout"
import PlaygroundPage from "@/app/(main)/playground/page"
import ProductsLayout from "@/app/(main)/products/layout"
import ProductsPage from "@/app/(main)/products/page"
import GroupProductsPage from "@/app/(main)/products/[groupId]/page"
import ProductDetailPage from "@/app/(main)/products/[groupId]/[productId]/page"
import SettingsLayout from "@/app/(main)/settings/layout"
import SettingsPage from "@/app/(main)/settings/page"
import ErrorPage from "@/app/404"
import LoginPage from "@/app/auth/login/page"
import Hydrate from "@/app/hydrate"
import RootLayout from "@/app/layout"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

const router = createBrowserRouter([
	{
		path: "/",
		errorElement: <ErrorPage />,
		hydrateFallbackElement: <Hydrate />,
		element: <RootLayout />,
		children: [
			{
				path: "",
				element: <MainLayout />,
				// loader: authLoader,
				children: [
					{
						index: true,
						element: <MainPage />,
					},
					{
						path: "products",
						element: <ProductsLayout />,
						children: [
							{
								index: true,
								element: <ProductsPage />,
							},
							{
								path: ":groupId",
								element: <GroupProductsPage />,
							},
							{
								path: ":groupId/:productId",
								element: <ProductDetailPage />,
							},
						],
					},
					{
						path: "agents",
						element: <AgentsLayout />,
						children: [
							{
								index: true,
								element: <AgentsPage />,
							},
						],
					},
					{
						path: "playground",
						element: <PlaygroundLayout />,
						children: [
							{ index: true, element: <PlaygroundPage /> },
						],
					},
					{
						path: "channels",
						element: <ChannelsLayout />,
						children: [{ index: true, element: <ChannelsPage /> }],
					},
					{
						path: "settings",
						element: <SettingsLayout />,
						children: [{ index: true, element: <SettingsPage /> }],
					},
				],
			},
			{
				path: "/auth",
				children: [
					{
						path: "login",
						element: <LoginPage />,
						// loader: nonAuthLoader,
					},
				],
			},
		],
	},
])

export default function Router() {
	return <RouterProvider router={router} />
}
