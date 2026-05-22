'use client'

import { Search, UserPlus, MoreHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function FriendsPage() {
  const friends = [
    { name: '李华', status: 'online', signature: '努力工作中...' },
    { name: '小红', status: 'online', signature: '在线摸鱼' },
    { name: '王伟', status: 'away', signature: '开会中' },
    { name: '张明', status: 'offline', signature: '下班了' },
    { name: '陈刚', status: 'busy', signature: '请勿打扰' },
    { name: '刘芳', status: 'online', signature: '今天天气真好' },
  ]

  const statusColors: Record<string, string> = {
    online: 'bg-online',
    offline: 'bg-offline',
    away: 'bg-away',
    busy: 'bg-busy',
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-card-foreground">好友</h1>
          <Button size="sm" className="gap-2">
            <UserPlus className="size-4" />
            添加好友
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="搜索好友..."
            className="pl-9 bg-muted border-none"
          />
        </div>
      </div>

      {/* Friend Categories */}
      <div className="flex-1 overflow-y-auto mochat-scrollbar p-4">
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">在线 - {friends.filter(f => f.status === 'online').length}</h2>
          <div className="space-y-2">
            {friends.filter(f => f.status === 'online').map((friend, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                      {friend.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${statusColors[friend.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{friend.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{friend.signature}</p>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">其他 - {friends.filter(f => f.status !== 'online').length}</h2>
          <div className="space-y-2">
            {friends.filter(f => f.status !== 'online').map((friend, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                      {friend.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${statusColors[friend.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{friend.name}</p>
                  <p className="text-xs text-muted-foreground/60 truncate">{friend.signature}</p>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
