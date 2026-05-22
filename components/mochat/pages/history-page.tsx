'use client'

import { Search, Calendar, Filter, MessageCircle, Phone, Video } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function HistoryPage() {
  const historyItems = [
    { type: 'message', name: '李华', content: '你好，项目进展怎么样？', time: '今天 12:30', date: '2024-01-15' },
    { type: 'call', name: '小红', content: '语音通话 - 5分钟', time: '今天 10:15', date: '2024-01-15' },
    { type: 'video', name: '产品讨论组', content: '视频会议 - 45分钟', time: '昨天 15:00', date: '2024-01-14' },
    { type: 'message', name: '张总', content: '明天上午10点开会', time: '昨天 09:30', date: '2024-01-14' },
    { type: 'message', name: '技术团队', content: '代码已经提交了', time: '1月13日', date: '2024-01-13' },
    { type: 'call', name: '王伟', content: '语音通话 - 12分钟', time: '1月12日', date: '2024-01-12' },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="size-4" />
      case 'video':
        return <Video className="size-4" />
      default:
        return <MessageCircle className="size-4" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-online/20 text-online'
      case 'video':
        return 'bg-primary/20 text-primary'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-card-foreground">历史记录</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="size-4" />
              日期筛选
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="size-4" />
              类型
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="搜索历史记录..."
            className="pl-9 bg-muted border-none"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto mochat-scrollbar p-4">
        <div className="space-y-2">
          {historyItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer"
            >
              <div className={`size-10 rounded-full flex items-center justify-center ${getIconBg(item.type)}`}>
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.name}</p>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
