'use client'

import { useState, useMemo } from 'react'
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  UserMinus, 
  Ban, 
  Unlock,
  Send,
  Check,
  X,
  Clock,
  Users,
  Inbox,
  SendHorizontal
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Types
interface Friend {
  id: string
  name: string
  status: 'online' | 'offline' | 'away' | 'busy'
  signature: string
  isBlocked: boolean
}

interface FriendRequest {
  id: string
  userId: string
  username: string
  message: string
  timestamp: string
  status: 'pending' | 'accepted' | 'rejected'
}

// Mock data
const initialFriends: Friend[] = [
  { id: '1', name: '李华', status: 'online', signature: '努力工作中...', isBlocked: false },
  { id: '2', name: '小红', status: 'online', signature: '在线摸鱼', isBlocked: false },
  { id: '3', name: '王伟', status: 'away', signature: '开会中', isBlocked: false },
  { id: '4', name: '张明', status: 'offline', signature: '下班了', isBlocked: false },
  { id: '5', name: '陈刚', status: 'busy', signature: '请勿打扰', isBlocked: true },
  { id: '6', name: '刘芳', status: 'online', signature: '今天天气真好', isBlocked: false },
  { id: '7', name: '赵强', status: 'offline', signature: '周末愉快', isBlocked: false },
  { id: '8', name: '孙丽', status: 'online', signature: '正在学习', isBlocked: false },
]

const initialReceivedRequests: FriendRequest[] = [
  { id: 'r1', userId: 'u101', username: '周杰', message: '你好，我是通过群聊认识你的', timestamp: '2024-01-15 14:30', status: 'pending' },
  { id: 'r2', userId: 'u102', username: '吴敏', message: '同事介绍，想加个好友', timestamp: '2024-01-14 09:15', status: 'pending' },
  { id: 'r3', userId: 'u103', username: '郑涛', message: '', timestamp: '2024-01-13 18:45', status: 'pending' },
]

const initialSentRequests: FriendRequest[] = [
  { id: 's1', userId: 'u201', username: '林小明', message: '你好，加个好友吧', timestamp: '2024-01-15 10:00', status: 'pending' },
  { id: 's2', userId: 'u202', username: '黄雨', message: '我是老同学', timestamp: '2024-01-12 16:20', status: 'accepted' },
  { id: 's3', userId: 'u203', username: '钱程', message: '在论坛看到你的帖子', timestamp: '2024-01-10 11:30', status: 'rejected' },
]

const statusColors: Record<string, string> = {
  online: 'bg-online',
  offline: 'bg-offline',
  away: 'bg-away',
  busy: 'bg-busy',
}

const statusLabels: Record<string, string> = {
  online: '在线',
  offline: '离线',
  away: '离开',
  busy: '忙碌',
}

export function FriendsPage() {
  const [activeTab, setActiveTab] = useState('my-friends')
  const [friends, setFriends] = useState<Friend[]>(initialFriends)
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>(initialReceivedRequests)
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>(initialSentRequests)
  const [searchQuery, setSearchQuery] = useState('')
  const [requestSubTab, setRequestSubTab] = useState('received')
  
  // Add friend form state
  const [targetUserId, setTargetUserId] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  const [addFriendStatus, setAddFriendStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends
    return friends.filter(friend => 
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.signature.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [friends, searchQuery])

  // Separate online and offline friends
  const onlineFriends = filteredFriends.filter(f => f.status === 'online' && !f.isBlocked)
  const otherFriends = filteredFriends.filter(f => f.status !== 'online' && !f.isBlocked)
  const blockedFriends = filteredFriends.filter(f => f.isBlocked)

  // Pending request counts
  const pendingReceivedCount = receivedRequests.filter(r => r.status === 'pending').length
  const pendingSentCount = sentRequests.filter(r => r.status === 'pending').length

  // Handle friend actions
  const handleDeleteFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId))
  }

  const handleBlockFriend = (friendId: string) => {
    setFriends(prev => prev.map(f => 
      f.id === friendId ? { ...f, isBlocked: true } : f
    ))
  }

  const handleUnblockFriend = (friendId: string) => {
    setFriends(prev => prev.map(f => 
      f.id === friendId ? { ...f, isBlocked: false } : f
    ))
  }

  // Handle add friend
  const handleSendRequest = async () => {
    if (!targetUserId.trim()) {
      setAddFriendStatus({ type: 'error', message: '请输入用户ID' })
      return
    }

    setIsSubmitting(true)
    setAddFriendStatus(null)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock validation - simulate user not found for specific IDs
    if (targetUserId === '000' || targetUserId === 'invalid') {
      setAddFriendStatus({ type: 'error', message: '用户不存在' })
      setIsSubmitting(false)
      return
    }

    // Check if already friends
    if (friends.some(f => f.id === targetUserId)) {
      setAddFriendStatus({ type: 'error', message: '该用户已经是你的好友' })
      setIsSubmitting(false)
      return
    }

    // Check if request already sent
    if (sentRequests.some(r => r.userId === targetUserId && r.status === 'pending')) {
      setAddFriendStatus({ type: 'error', message: '已向该用户发送过好友请求' })
      setIsSubmitting(false)
      return
    }

    // Success - add to sent requests
    const newRequest: FriendRequest = {
      id: `s${Date.now()}`,
      userId: targetUserId,
      username: `用户${targetUserId}`,
      message: requestMessage,
      timestamp: new Date().toLocaleString('zh-CN'),
      status: 'pending'
    }
    setSentRequests(prev => [newRequest, ...prev])
    setAddFriendStatus({ type: 'success', message: '好友请求已发送' })
    setTargetUserId('')
    setRequestMessage('')
    setIsSubmitting(false)
  }

  // Handle friend requests
  const handleAcceptRequest = (requestId: string) => {
    const request = receivedRequests.find(r => r.id === requestId)
    if (!request) return

    // Add to friends
    const newFriend: Friend = {
      id: request.userId,
      name: request.username,
      status: 'online',
      signature: '新添加的好友',
      isBlocked: false
    }
    setFriends(prev => [...prev, newFriend])

    // Update request status
    setReceivedRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: 'accepted' as const } : r
    ))
  }

  const handleRejectRequest = (requestId: string) => {
    setReceivedRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    ))
  }

  const handleCancelRequest = (requestId: string) => {
    setSentRequests(prev => prev.filter(r => r.id !== requestId))
  }

  // Friend list item component
  const FriendItem = ({ friend }: { friend: Friend }) => (
    <div className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors group">
      <div className="relative">
        <Avatar className="size-10">
          <AvatarFallback className={`${friend.isBlocked ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary'} text-sm font-medium`}>
            {friend.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        {!friend.isBlocked && (
          <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${statusColors[friend.status]}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${friend.isBlocked ? 'text-muted-foreground' : ''}`}>
            {friend.name}
          </p>
          {friend.isBlocked && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              已屏蔽
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{friend.signature}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity size-8"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {friend.isBlocked ? (
            <DropdownMenuItem onClick={() => handleUnblockFriend(friend.id)}>
              <Unlock className="size-4" />
              取消屏蔽
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleBlockFriend(friend.id)}>
              <Ban className="size-4" />
              屏蔽好友
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            variant="destructive"
            onClick={() => handleDeleteFriend(friend.id)}
          >
            <UserMinus className="size-4" />
            删除好友
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-card-foreground">好友管理</h1>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b border-border">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="my-friends" className="gap-2">
              <Users className="size-4" />
              我的好友
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {friends.filter(f => !f.isBlocked).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="add-friend" className="gap-2">
              <UserPlus className="size-4" />
              添加好友
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Inbox className="size-4" />
              好友请求
              {pendingReceivedCount > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {pendingReceivedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* My Friends Tab */}
        <TabsContent value="my-friends" className="flex-1 overflow-hidden m-0 p-4">
          <div className="h-full flex flex-col">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索好友..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted border-none"
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="pr-4 space-y-6">
                {/* Online Friends */}
                {onlineFriends.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-online" />
                      在线 - {onlineFriends.length}
                    </h2>
                    <div className="space-y-1">
                      {onlineFriends.map(friend => (
                        <FriendItem key={friend.id} friend={friend} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Friends */}
                {otherFriends.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">
                      其他 - {otherFriends.length}
                    </h2>
                    <div className="space-y-1">
                      {otherFriends.map(friend => (
                        <FriendItem key={friend.id} friend={friend} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Blocked Friends */}
                {blockedFriends.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Ban className="size-3" />
                      已屏蔽 - {blockedFriends.length}
                    </h2>
                    <div className="space-y-1">
                      {blockedFriends.map(friend => (
                        <FriendItem key={friend.id} friend={friend} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {filteredFriends.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="size-12 mb-4 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? '没有找到匹配的好友' : '暂无好友'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Add Friend Tab */}
        <TabsContent value="add-friend" className="flex-1 overflow-hidden m-0 p-4">
          <div className="max-w-md mx-auto pt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="size-5" />
                  添加好友
                </CardTitle>
                <CardDescription>
                  输入用户ID发送好友请求
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">用户ID <span className="text-destructive">*</span></Label>
                  <Input
                    id="userId"
                    placeholder="请输入目标用户ID"
                    value={targetUserId}
                    onChange={(e) => {
                      setTargetUserId(e.target.value)
                      setAddFriendStatus(null)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">验证消息（可选）</Label>
                  <Textarea
                    id="message"
                    placeholder="向对方介绍一下自己..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Status message */}
                {addFriendStatus && (
                  <div className={`flex items-center gap-2 text-sm ${
                    addFriendStatus.type === 'success' ? 'text-online' : 'text-destructive'
                  }`}>
                    {addFriendStatus.type === 'success' ? (
                      <Check className="size-4" />
                    ) : (
                      <X className="size-4" />
                    )}
                    {addFriendStatus.message}
                  </div>
                )}

                <Button 
                  className="w-full gap-2" 
                  onClick={handleSendRequest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      发送中...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      发送好友请求
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Friend Requests Tab */}
        <TabsContent value="requests" className="flex-1 overflow-hidden m-0 flex flex-col">
          {/* Sub-tabs */}
          <Tabs value={requestSubTab} onValueChange={setRequestSubTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-2">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="received" className="gap-2">
                  <Inbox className="size-4" />
                  收到的请求
                  {pendingReceivedCount > 0 && (
                    <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                      {pendingReceivedCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sent" className="gap-2">
                  <SendHorizontal className="size-4" />
                  发出的请求
                  {pendingSentCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {pendingSentCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Received Requests */}
            <TabsContent value="received" className="flex-1 overflow-hidden m-0 p-4">
              <ScrollArea className="h-full">
                <div className="pr-4 space-y-3">
                  {receivedRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Inbox className="size-12 mb-4 opacity-50" />
                      <p className="text-sm">暂无好友请求</p>
                    </div>
                  ) : (
                    receivedRequests.map(request => (
                      <Card key={request.id} className={request.status !== 'pending' ? 'opacity-60' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="size-12">
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {request.username.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{request.username}</span>
                                <span className="text-xs text-muted-foreground">ID: {request.userId}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {request.message || '对方没有留言'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="size-3" />
                                {request.timestamp}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {request.status === 'pending' ? (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAcceptRequest(request.id)}
                                    className="gap-1"
                                  >
                                    <Check className="size-3" />
                                    接受
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleRejectRequest(request.id)}
                                    className="gap-1"
                                  >
                                    <X className="size-3" />
                                    拒绝
                                  </Button>
                                </>
                              ) : (
                                <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                                  {request.status === 'accepted' ? '已接受' : '已拒绝'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Sent Requests */}
            <TabsContent value="sent" className="flex-1 overflow-hidden m-0 p-4">
              <ScrollArea className="h-full">
                <div className="pr-4 space-y-3">
                  {sentRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <SendHorizontal className="size-12 mb-4 opacity-50" />
                      <p className="text-sm">暂无发出的请求</p>
                    </div>
                  ) : (
                    sentRequests.map(request => (
                      <Card key={request.id} className={request.status !== 'pending' ? 'opacity-60' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="size-12">
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                {request.username.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{request.username}</span>
                                <span className="text-xs text-muted-foreground">ID: {request.userId}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {request.message || '未添加验证消息'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="size-3" />
                                {request.timestamp}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {request.status === 'pending' ? (
                                <>
                                  <Badge variant="secondary" className="gap-1">
                                    <Clock className="size-3" />
                                    等待验证
                                  </Badge>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleCancelRequest(request.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="size-4" />
                                  </Button>
                                </>
                              ) : (
                                <Badge variant={request.status === 'accepted' ? 'default' : 'destructive'}>
                                  {request.status === 'accepted' ? '已通过' : '已拒绝'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
