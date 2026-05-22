'use client'

import { Search, Plus, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function GroupsPage() {
  const groups = [
    { name: '产品讨论组', members: 12, lastActive: '1小时前', avatar: '产' },
    { name: '技术团队', members: 8, lastActive: '30分钟前', avatar: '技' },
    { name: '设计部门', members: 6, lastActive: '2小时前', avatar: '设' },
    { name: '市场营销', members: 15, lastActive: '昨天', avatar: '市' },
    { name: '运营团队', members: 10, lastActive: '3天前', avatar: '运' },
  ]

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-card-foreground">群组</h1>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            创建群组
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="搜索群组..."
            className="pl-9 bg-muted border-none"
          />
        </div>
      </div>

      {/* Group List */}
      <div className="flex-1 overflow-y-auto mochat-scrollbar p-4">
        <div className="grid gap-3">
          {groups.map((group, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl p-4 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-base font-medium">
                  {group.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{group.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{group.members} 成员</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">活跃于 {group.lastActive}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                进入
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
