'use client'

import { MessageCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function MessagesPage() {
  return (
    <div className="flex h-full">
      {/* Chat List Panel */}
      <div className="w-[320px] border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold mb-3 text-card-foreground">消息</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="搜索消息..."
              className="pl-9 bg-muted border-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto mochat-scrollbar p-2">
          {/* Placeholder chat items */}
          {[
            { name: '李华', message: '你好，项目进展怎么样？', time: '12:30', unread: 2 },
            { name: '产品讨论组', message: '王伟: 下午开会讨论一下', time: '11:45', unread: 0 },
            { name: '小红', message: '收到，我马上处理', time: '昨天', unread: 0 },
            { name: '技术团队', message: '代码已经提交了', time: '昨天', unread: 1 },
            { name: '张总', message: '明天上午10点开会', time: '周一', unread: 0 },
          ].map((chat, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
                index === 0 ? 'bg-accent' : 'hover:bg-muted'
              }`}
            >
              <div className="relative">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  {chat.name.slice(0, 1)}
                </div>
                {chat.unread > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{chat.name}</p>
                  <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{chat.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <MessageCircle className="size-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">选择一个对话开始聊天</p>
            <p className="text-sm mt-1">从左侧列表中选择或开始新的对话</p>
          </div>
        </div>
      </div>
    </div>
  )
}
