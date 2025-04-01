"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
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
  // return (
  //   <ConnectButton.Custom>
  //     {({
  //       account,
  //       chain,
  //       openAccountModal,
  //       openChainModal,
  //       openConnectModal,
  //       authenticationStatus,
  //       mounted,
  //     }) => {
  //       // Note: If your app doesn't use authentication, you
  //       // can remove all 'authenticationStatus' checks
  //       const ready = mounted && authenticationStatus !== 'loading';
  //       const connected =
  //         ready &&
  //         account &&
  //         chain &&
  //         (!authenticationStatus ||
  //           authenticationStatus === 'authenticated');

  //       return (
  //         <div
  //           {...(!ready && {
  //             'aria-hidden': true,
  //             'style': {
  //               opacity: 0,
  //               pointerEvents: 'none',
  //               userSelect: 'none',
  //             },
  //           })}
  //         >
  //           {(() => {
  //             if (!connected) {
  //               return (
  //                 <button onClick={openConnectModal} type="button">
  //                   Sign in
  //                 </button>
  //               );
  //             }

  //             if (chain.unsupported) {
  //               return (
  //                 <button onClick={openChainModal} type="button">
  //                   Wrong network
  //                 </button>
  //               );
  //             }

  //             return (
  //               <div>
  //                 <button
  //                   onClick={openChainModal}
  //                   style={{ display: 'flex', alignItems: 'center' }}
  //                   type="button"
  //                 >
  //                   {chain.hasIcon && (
  //                     <div
  //                       style={{
  //                         background: chain.iconBackground,
  //                         width: 12,
  //                         height: 12,
  //                         borderRadius: 999,
  //                         overflow: 'hidden',
  //                         marginRight: 4,
  //                       }}
  //                     >
  //                       {chain.iconUrl && (
  //                         <img
  //                           alt={chain.name ?? 'Chain icon'}
  //                           src={chain.iconUrl}
  //                           style={{ width: 12, height: 12 }}
  //                         />
  //                       )}
  //                     </div>
  //                   )}
  //                   {chain.name}
  //                 </button>

  //                 <button onClick={openAccountModal} type="button">
  //                   {account.displayName}
  //                   {account.displayBalance
  //                     ? ` (${account.displayBalance})`
  //                     : ''}
  //                 </button>
  //               </div>
  //             );
  //           })()}
  //         </div>
  //       );
  //     }}
  //   </ConnectButton.Custom>

  // )
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
                  <button onClick={openConnectModal} type="button">
                    Sign in
                  </button>
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
                          <AvatarImage src={account.ensAvatar} alt={account.displayName} />
                          <AvatarFallback className="rounded-lg">
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">{account.displayName}</span>
                          {/* <span className="truncate text-xs">{user.email}</span> */}
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
                            <AvatarImage src={user.avatar} alt={account.displayName} />
                            <AvatarFallback className="rounded-lg">
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 12, height: 12 }}
                              />
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{account.displayName}</span>
                            {/* <span className="truncate text-xs">{user.email}</span> */}
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
                        <DropdownMenuItem>
                          <BadgeCheck />
                          Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard />
                          Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell />
                          Notifications
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <LogOut />
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
