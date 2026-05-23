'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageCircle,
  Users,
  UsersRound,
  Clock,
  Settings,
  LogOut,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type UserStatus = 'online' | 'offline' | 'away' | 'busy'

interface UserProfile {
  name: string
  avatar?: string
  status: UserStatus
}

const navItems = [
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/friends', label: 'Friends', icon: Users },
  { href: '/groups', label: 'Groups', icon: UsersRound },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/aiops', label: 'AIOps', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const statusColors: Record<UserStatus, string> = {
  online: 'bg-online',
  offline: 'bg-offline',
  away: 'bg-away',
  busy: 'bg-busy',
}

const statusLabels: Record<UserStatus, string> = {
  online: '在线',
  offline: '离线',
  away: '离开',
  busy: '忙碌',
}

interface SidebarProps {
  user?: UserProfile
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const currentUser: UserProfile = user ?? {
    name: '张明',
    status: 'online',
  }

  const isActive = (href: string) => {
    if (href === '/messages') {
      return pathname === '/' || pathname === '/messages'
    }
    return pathname === href
  }

  return (
    <aside className="flex h-screen w-[260px] flex-col bg-sidebar text-sidebar-foreground">
      {/* User Profile Section */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-[30px]">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
                {currentUser.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-sidebar',
                statusColors[currentUser.status]
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {currentUser.name}
            </p>
            <p className="text-xs text-sidebar-muted">
              {statusLabels[currentUser.status]}
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 mochat-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span>{item.label}</span>
                      {item.href === '/messages' && (
                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-semibold text-sidebar-primary-foreground">
                          3
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-2">
        <Separator className="mb-2 bg-sidebar-border" />
        <button
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          onClick={() => {
            // Logout logic would go here - redirect to login page
            window.location.href = '/login'
          }}
        >
          <LogOut className="size-5 shrink-0" />
          <span>Logout</span>
        </button>
        <p className="px-3 py-2 text-[10px] text-sidebar-muted/60">
          MoChat v1.0.0
        </p>
      </div>
    </aside>
  )
}
