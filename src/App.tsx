import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { config } from './config'

import { Toaster } from "@/components/ui/sonner"


import { Outlet, createHashRouter, RouterProvider, Navigate } from 'react-router'

import Explorer from './app/Explorer/Explorer'
import Account from './app/Account/Account'


import Dashboard from "./app/Dashboard/Dashboard"
import { SubscriptionsProvider } from "./contexts/subscriptions"
import { EthosProvider } from './contexts/ethos';

import '@rainbow-me/rainbowkit/styles.css';
import './App.css'
// import { Digest } from "./app/Digest2/Digest"
import Digest from "./app/Digest/Digest"


function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true, // This makes it the default route for "/"
        element: <Navigate to="/explorer" replace /> // Redirect to explorer
      },
      {
        path: "dao/:identifier",
        element: <Dashboard />
      },
      {
        path: "explorer",
        element: <Explorer />
      },
      // Update Digest route to support tab parameters
      {
        path: "digest",
        element: <Navigate to="/digest/overview" replace />
      },
      {
        path: "digest/:tabType",
        element: <Digest />
      },
      {
        path: "account",
        element: <Account />
      }
    ]
  }
])

function App() {
  return (
    <WagmiProvider config={config}>
        <RainbowKitProvider>
          <SubscriptionsProvider>
            <EthosProvider>
              <RouterProvider router={router} />
              <Toaster />
            </EthosProvider>
          </SubscriptionsProvider>
        </RainbowKitProvider>
    </WagmiProvider>
  )
}

export default App
