import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  Plus,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router"
import { useSubscriptions } from "@/contexts/subscriptions"
import { useCallback, useEffect, useState } from "react"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()
  const { subscriptions } = useSubscriptions()
  const [currentPath, setCurrentPath] = useState(() => window.location.hash.substring(1))

  // Create a memoized update function
  const updateCurrentPath = useCallback(() => {
    setCurrentPath(window.location.hash.substring(1))
  }, [])

  // Update the current path when location changes
  useEffect(() => {
    // Set initial path (in case it wasn't set in useState)
    updateCurrentPath()

    // Add event listener for hash changes
    window.addEventListener('hashchange', updateCurrentPath)

    // Clean up event listener
    return () => {
      window.removeEventListener('hashchange', updateCurrentPath)
    }
  }, [updateCurrentPath])

  // Force a re-render when navigating
  useEffect(() => {
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    // Override pushState
    window.history.pushState = function() {
      originalPushState.apply(this, arguments as any)
      updateCurrentPath()
    }

    // Override replaceState
    window.history.replaceState = function() {
      originalReplaceState.apply(this, arguments as any)
      updateCurrentPath()
    }

    // Restore original functions on cleanup
    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [updateCurrentPath])

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarMenu>
        {subscriptions.map((item) => {
        const targetPath = `/dao/${item.dao.identifier}`
        const isActive = currentPath === targetPath
        return (
          <SidebarMenuItem key={item.dao.name}>
            <SidebarMenuButton asChild>
              <NavLink 
                key={item.dao.identifier} 
                to={`/dao/${item.dao.identifier}`}
                className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
              >
                {item.dao.logo ? (
                  <img
                    src={item.dao.logo}
                    className="h-4 w-4 rounded-full"
                  />
                ) : (
                  <Forward />
                )}
                <span>{item.dao.name}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )})}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <Plus className="text-sidebar-foreground/70" />
            <NavLink to="/explorer">
              <span>Subscribe</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
