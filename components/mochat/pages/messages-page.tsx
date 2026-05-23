'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, Search, Users, User, Send, Smile, Paperclip, Phone, Video, MoveVertical as MoreVertical, Check, CheckCheck, Clock, CircleAlert as AlertCircle, ChevronLeft, ChevronRight, Image as ImageIcon, File, Activity, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Types
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: Date
  status: MessageStatus
  isCurrentUser: boolean
}

interface Conversation {
  id: string
  type: 'private' | 'group'
  name: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  online?: boolean
  members?: GroupMember[]
}

interface GroupMember {
  id: string
  name: string
  avatar?: string
  role: 'owner' | 'admin' | 'member'
  online: boolean
}

// Mock Data
const mockFriends: (Conversation & { latestSeq?: number; peerReadSeq?: number })[] = [
  { id: '1', type: 'private', name: '李华', lastMessage: '你好，项目进展怎么样？', lastMessageTime: '12:30', unread: 2, online: true, latestSeq: 156, peerReadSeq: 152 },
  { id: '2', type: 'private', name: '小红', lastMessage: '收到，我马上处理', lastMessageTime: '11:45', unread: 0, online: true, latestSeq: 89, peerReadSeq: 87 },
  { id: '3', type: 'private', name: '张总', lastMessage: '明天上午10点开会', lastMessageTime: '昨天', unread: 0, online: false, latestSeq: 45, peerReadSeq: 45 },
  { id: '4', type: 'private', name: '王明', lastMessage: '好的，我知道了', lastMessageTime: '周一', unread: 0, online: false, latestSeq: 78, peerReadSeq: 75 },
  { id: '5', type: 'private', name: '刘芳', lastMessage: '文档已经发给你了', lastMessageTime: '周一', unread: 1, online: true, latestSeq: 203, peerReadSeq: 198 },
]

const mockGroups: Conversation[] = [
  {
    id: 'g1',
    type: 'group',
    name: '产品讨论组',
    lastMessage: '王伟: 下午开会讨论一下',
    lastMessageTime: '11:45',
    unread: 3,
    members: [
      { id: 'm1', name: '你', role: 'owner', online: true },
      { id: 'm2', name: '王伟', role: 'admin', online: true },
      { id: 'm3', name: '李娜', role: 'member', online: false },
      { id: 'm4', name: '赵强', role: 'member', online: true },
      { id: 'm5', name: '陈静', role: 'member', online: false },
      { id: 'm6', name: '周磊', role: 'member', online: true },
      { id: 'm7', name: '吴敏', role: 'member', online: false },
      { id: 'm8', name: '郑涛', role: 'member', online: true },
    ],
    latestSeq: 234,
  },
  {
    id: 'g2',
    type: 'group',
    name: '技术团队',
    lastMessage: '代码已经提交了',
    lastMessageTime: '昨天',
    unread: 1,
    members: [
      { id: 'm1', name: '你', role: 'admin', online: true },
      { id: 'm9', name: '孙浩', role: 'owner', online: true },
      { id: 'm10', name: '钱伟', role: 'member', online: false },
    ],
    latestSeq: 178,
  },
  {
    id: 'g3',
    type: 'group',
    name: '设计团队',
    lastMessage: '新版UI已经完成',
    lastMessageTime: '周二',
    unread: 0,
    members: [
      { id: 'm1', name: '你', role: 'member', online: true },
      { id: 'm11', name: '林悦', role: 'owner', online: false },
      { id: 'm12', name: '高峰', role: 'member', online: true },
    ],
    latestSeq: 92,
  },
]

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', content: '你好！最近忙什么呢？', senderId: 'other', senderName: '李华', timestamp: new Date(Date.now() - 3600000 * 2), status: 'read', isCurrentUser: false },
    { id: '2', content: '在做新项目，挺忙的', senderId: 'me', senderName: '我', timestamp: new Date(Date.now() - 3600000 * 1.5), status: 'read', isCurrentUser: true },
    { id: '3', content: '项目进展怎么样了？', senderId: 'other', senderName: '李华', timestamp: new Date(Date.now() - 3600000), status: 'read', isCurrentUser: false },
    { id: '4', content: '还不错，预计下周能完成第一版', senderId: 'me', senderName: '我', timestamp: new Date(Date.now() - 1800000), status: 'delivered', isCurrentUser: true },
    { id: '5', content: '你好，项目进展怎么样？', senderId: 'other', senderName: '李华', timestamp: new Date(Date.now() - 60000), status: 'read', isCurrentUser: false },
  ],
  'g1': [
    { id: 'g1-1', content: '大家好，今天下午3点开产品评审会', senderId: 'm2', senderName: '王伟', timestamp: new Date(Date.now() - 7200000), status: 'read', isCurrentUser: false },
    { id: 'g1-2', content: '收到，我会准时参加', senderId: 'm3', senderName: '李娜', timestamp: new Date(Date.now() - 7000000), status: 'read', isCurrentUser: false },
    { id: 'g1-3', content: '好的，我也参加', senderId: 'me', senderName: '我', timestamp: new Date(Date.now() - 6800000), status: 'read', isCurrentUser: true },
    { id: 'g1-4', content: '请大家提前准备好各自负责的内容', senderId: 'm2', senderName: '王伟', timestamp: new Date(Date.now() - 3600000), status: 'read', isCurrentUser: false },
    { id: 'g1-5', content: '下午开会讨论一下', senderId: 'm2', senderName: '王伟', timestamp: new Date(Date.now() - 60000), status: 'read', isCurrentUser: false },
  ],
}

// Emoji data
const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '👍', '👎', '👏', '🙏', '🤝', '❤️', '🔥', '✨', '🎉', '💯', '✅', '❌']

// Session Status State type
interface SessionStatus {
  conversationId: string
  latestSeq: number
  peerReadSeq: number
  lastUpdate: Date
}

export function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [memberPage, setMemberPage] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Session status state
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null)
  const [rightPanelTab, setRightPanelTab] = useState<'details' | 'session'>('details')

  const membersPerPage = 5

  // Filter conversations based on search
  const filteredConversations = activeTab === 'friends'
    ? mockFriends.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockGroups.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages[selectedConversation.id] || [])
      setMemberPage(0)

      // Initialize session status for private chats
      if (selectedConversation.type === 'private') {
        const friendData = mockFriends.find(f => f.id === selectedConversation.id)
        setSessionStatus({
          conversationId: selectedConversation.id,
          latestSeq: friendData?.latestSeq || 0,
          peerReadSeq: friendData?.peerReadSeq || 0,
          lastUpdate: new Date()
        })
      } else {
        setSessionStatus(null)
      }
    }
  }, [selectedConversation])

  // Session status update interval (every 10 seconds)
  useEffect(() => {
    if (!selectedConversation || selectedConversation.type !== 'private') return

    const interval = setInterval(() => {
      setSessionStatus(prev => {
        if (!prev) return prev
        // Simulate incremental updates
        const latestSeqInc = Math.random() > 0.7 ? prev.latestSeq + 1 : prev.latestSeq
        const peerReadSeqInc = Math.random() > 0.8 ? Math.min(prev.peerReadSeq + 1, latestSeqInc) : prev.peerReadSeq
        return {
          ...prev,
          latestSeq: latestSeqInc,
          peerReadSeq: peerReadSeqInc,
          lastUpdate: new Date()
        }
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || !selectedConversation) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputMessage.trim(),
      senderId: 'me',
      senderName: '我',
      timestamp: new Date(),
      status: 'sending',
      isCurrentUser: true,
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')

    // Simulate sending delay
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      )
    }, 500)

    // Simulate delivery
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      )
    }, 1500)
  }, [inputMessage, selectedConversation])

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle emoji select
  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji)
    textareaRef.current?.focus()
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // Get status icon
  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sending':
        return <Clock className="size-3 text-muted-foreground" />
      case 'sent':
        return <Check className="size-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="size-3 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="size-3 text-primary" />
      case 'failed':
        return <AlertCircle className="size-3 text-destructive" />
      default:
        return null
    }
  }

  // Get paginated members
  const getPaginatedMembers = () => {
    if (!selectedConversation?.members) return []
    const start = memberPage * membersPerPage
    return selectedConversation.members.slice(start, start + membersPerPage)
  }

  const totalMemberPages = selectedConversation?.members
    ? Math.ceil(selectedConversation.members.length / membersPerPage)
    : 0

  return (
    <div className="flex h-full bg-[#F2F3F5]">
      {/* Left Column - Conversation List */}
      <div className="w-[280px] border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="搜索会话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-none h-9"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'friends' | 'groups')} className="flex flex-col flex-1">
          <TabsList className="mx-4 mt-3 grid grid-cols-2">
            <TabsTrigger value="friends" className="gap-1.5">
              <User className="size-4" />
              好友
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-1.5">
              <Users className="size-4" />
              群组
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-2">
            <div className="px-2 pb-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  暂无会话
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors',
                      selectedConversation?.id === conversation.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                    )}
                  >
                    <div className="relative">
                      <Avatar className="size-10">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback className={cn(
                          'text-sm font-medium',
                          conversation.type === 'group' 
                            ? 'bg-violet-100 text-violet-600' 
                            : 'bg-primary/10 text-primary'
                        )}>
                          {conversation.type === 'group' ? (
                            <Users className="size-5" />
                          ) : (
                            conversation.name.slice(0, 1)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.type === 'private' && (
                        <span className={cn(
                          'absolute bottom-0 right-0 size-3 rounded-full border-2 border-card',
                          conversation.online ? 'bg-green-500' : 'bg-gray-400'
                        )} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{conversation.name}</p>
                        <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                          {conversation.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread > 0 && (
                      <span className="size-5 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center shrink-0">
                        {conversation.unread > 99 ? '99+' : conversation.unread}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Middle Column - Conversation Messages */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className={cn(
                    'text-xs font-medium',
                    selectedConversation.type === 'group'
                      ? 'bg-violet-100 text-violet-600'
                      : 'bg-primary/10 text-primary'
                  )}>
                    {selectedConversation.type === 'group' ? (
                      <Users className="size-4" />
                    ) : (
                      selectedConversation.name.slice(0, 1)
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-semibold">{selectedConversation.name}</h2>
                  {selectedConversation.type === 'private' && (
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.online ? '在线' : '离线'}
                    </p>
                  )}
                  {selectedConversation.type === 'group' && selectedConversation.members && (
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.members.length} 位成员
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-8">
                  <Phone className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                  <Video className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.isCurrentUser ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      'flex gap-2 max-w-[70%]',
                      message.isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                    )}>
                      {!message.isCurrentUser && selectedConversation.type === 'group' && (
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback className="text-xs bg-muted">
                            {message.senderName.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        'flex flex-col',
                        message.isCurrentUser ? 'items-end' : 'items-start'
                      )}>
                        {!message.isCurrentUser && selectedConversation.type === 'group' && (
                          <span className="text-xs text-muted-foreground mb-1 px-1">
                            {message.senderName}
                          </span>
                        )}
                        <div className={cn(
                          'rounded-2xl px-4 py-2 shadow-sm',
                          message.isCurrentUser
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-card text-card-foreground rounded-bl-md'
                        )}>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <div className={cn(
                          'flex items-center gap-1 mt-1 px-1',
                          message.isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                        )}>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.isCurrentUser && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-end gap-2">
                <div className="flex gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-9 shrink-0">
                        <Smile className="size-5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2" align="start">
                      <div className="grid grid-cols-8 gap-1">
                        {emojis.map((emoji, i) => (
                          <button
                            key={i}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="size-8 flex items-center justify-center hover:bg-muted rounded text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-9 shrink-0">
                        <Paperclip className="size-5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="start">
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md text-sm">
                          <ImageIcon className="size-4" />
                          发送图片
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md text-sm">
                          <File className="size-4" />
                          发送文件
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入消息..."
                    rows={1}
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[40px] max-h-[120px]"
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                    }}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  size="icon"
                  className="size-10 shrink-0"
                >
                  <Send className="size-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                按 Enter 发送，Shift + Enter 换行
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="size-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">选择一个对话开始聊天</p>
              <p className="text-sm mt-1">从左侧列表中选择好友或群组</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Session Details */}
      {selectedConversation && (
        <div className="w-[260px] border-l border-border bg-card flex flex-col">
          {/* Right Panel Tabs (only for private chats) */}
          {selectedConversation.type === 'private' && (
            <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as 'details' | 'session')} className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="session" className="gap-1">
                  <Activity className="size-3" />
                  Session
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Profile Section */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-16 mb-3">
                <AvatarFallback className={cn(
                  'text-xl font-medium',
                  selectedConversation.type === 'group'
                    ? 'bg-violet-100 text-violet-600'
                    : 'bg-primary/10 text-primary'
                )}>
                  {selectedConversation.type === 'group' ? (
                    <Users className="size-8" />
                  ) : (
                    selectedConversation.name.slice(0, 1)
                  )}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-base">{selectedConversation.name}</h3>
              {selectedConversation.type === 'private' && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={cn(
                    'size-2 rounded-full',
                    selectedConversation.online ? 'bg-green-500' : 'bg-gray-400'
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {selectedConversation.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Session Status Tab Content */}
          {selectedConversation.type === 'private' && rightPanelTab === 'session' && sessionStatus && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 border border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <RefreshCw className="size-3" />
                    Live Status
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Conversation ID</span>
                      <Badge variant="outline" className="font-mono">
                        {sessionStatus.conversationId}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Latest Seq</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-primary">
                          {sessionStatus.latestSeq}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Messages
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Peer Read Seq</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-green-600">
                          {sessionStatus.peerReadSeq}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Read
                        </Badge>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Unread by Peer</span>
                      <Badge variant={sessionStatus.latestSeq - sessionStatus.peerReadSeq > 0 ? 'destructive' : 'secondary'}>
                        {sessionStatus.latestSeq - sessionStatus.peerReadSeq}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/30 p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Synchronization
                  </h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Last Update</span>
                      <span className="font-mono">
                        {sessionStatus.lastUpdate.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Update Interval</span>
                      <span className="font-mono">10s</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar for Read Status */}
                <div className="rounded-lg bg-muted/30 p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Read Progress
                  </h4>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{
                        width: sessionStatus.latestSeq > 0
                          ? `${(sessionStatus.peerReadSeq / sessionStatus.latestSeq) * 100}%`
                          : '100%'
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {sessionStatus.latestSeq > 0
                      ? `${Math.round((sessionStatus.peerReadSeq / sessionStatus.latestSeq) * 100)}% messages read by peer`
                      : 'No messages yet'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab Content (default for groups) */}
          {(selectedConversation.type === 'group' || rightPanelTab === 'details') && (
            <>
              {/* Details Section */}
              <div className="p-4 border-b border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Conversation Info
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversation ID</span>
                    <span className="font-mono text-xs">{selectedConversation.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{selectedConversation.type === 'private' ? 'Private' : 'Group'}</span>
                  </div>
                  {selectedConversation.type === 'private' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Message Status</span>
                      <span className="text-green-600">Delivered</span>
                    </div>
                  )}
                </div>
              </div>

          {/* Members Section (for groups) */}
          {selectedConversation.type === 'group' && selectedConversation.members && (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Members ({selectedConversation.members.length})
                </h4>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {getPaginatedMembers().map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="relative">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs bg-muted">
                            {member.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card',
                          member.online ? 'bg-green-500' : 'bg-gray-400'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : 'Member'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Pagination */}
              {totalMemberPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={memberPage === 0}
                    onClick={() => setMemberPage(p => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {memberPage + 1} / {totalMemberPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={memberPage >= totalMemberPages - 1}
                    onClick={() => setMemberPage(p => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Actions for Private Chat */}
          {selectedConversation.type === 'private' && (
            <div className="flex-1 flex flex-col p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Phone className="size-4" />
                  Voice Call
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Video className="size-4" />
                  Video Call
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Search className="size-4" />
                  Search Messages
                </Button>
              </div>

              <Separator className="my-4" />

              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Message Read Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCheck className="size-4 text-primary" />
                  <span>Peer has read latest message</span>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
