"use client"

import { NavLink } from "react-router"
import { useMemo } from "react"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAddressName, shortenAddress } from "@/lib/address-utils";

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');
        
        // Generate a friendly name if ENS is not available
        const displayName = useMemo(() => {
          if (!connected || !account) return 'Connect Wallet';
          
          // If ENS name exists, use it
          // if (account.displayName && account.displayName !== account.address) {
          //   return account.displayName;
          // }
          
          // Otherwise generate a friendly name from the address
          return getAddressName(account.address);
        }, [connected, account]);
        
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <SidebarMenu>
                  <SidebarMenuItem>
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                    size="lg"
                    onClick={openConnectModal}
                    type="button"
                    >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                      <CreditCard className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Connect Wallet</span>
                    </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  </DropdownMenu>
                  </SidebarMenuItem>
                  </SidebarMenu>
                );
              }
              return (
                <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src={account.ensAvatar} alt={displayName} />
                          <AvatarFallback className="rounded-lg">
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">{displayName}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {shortenAddress(account.address)}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user.avatar} alt={displayName} />
                            <AvatarFallback className="rounded-lg">
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 12, height: 12 }}
                              />
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{displayName}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {shortenAddress(account.address)}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Sparkles />
                          Upgrade to Pro
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator /> */}
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <NavLink to="/account">
                          <BadgeCheck className="h-4 w-4" />
                          Account
                          </NavLink>
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem>
                          <CreditCard />
                          Billing
                        </DropdownMenuItem> */}
                        <DropdownMenuItem>
                          <Bell />
                          Notifications
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        <button onClick={openAccountModal} type="button">
                          Logout
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
                </SidebarMenu>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
