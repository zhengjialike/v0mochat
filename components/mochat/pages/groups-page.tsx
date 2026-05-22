'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Users,
  Crown,
  Shield,
  MoreHorizontal,
  ArrowLeft,
  UserPlus,
  LogOut,
  Trash2,
  UserMinus,
  Settings,
  Eye,
  Bell,
  ImagePlus,
  Check,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Types
interface GroupMember {
  id: string
  username: string
  avatar?: string
  role: 'owner' | 'admin' | 'member'
  isOnline: boolean
  joinedAt: string
}

interface JoinRequest {
  id: string
  userId: string
  username: string
  avatar?: string
  message: string
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

interface Group {
  id: string
  name: string
  avatar?: string
  description: string
  memberCount: number
  myRole: 'owner' | 'admin' | 'member'
  createdAt: string
  lastActive: string
  members: GroupMember[]
  joinRequests: JoinRequest[]
}

// Mock data
const initialGroups: Group[] = [
  {
    id: 'g1',
    name: '产品讨论组',
    avatar: '',
    description: '产品设计与功能讨论',
    memberCount: 12,
    myRole: 'owner',
    createdAt: '2024-01-15',
    lastActive: '1小时前',
    members: [
      { id: 'u1', username: '我', role: 'owner', isOnline: true, joinedAt: '2024-01-15' },
      { id: 'u2', username: '张伟', role: 'admin', isOnline: true, joinedAt: '2024-01-16' },
      { id: 'u3', username: '李娜', role: 'member', isOnline: false, joinedAt: '2024-01-17' },
      { id: 'u4', username: '王强', role: 'member', isOnline: true, joinedAt: '2024-01-18' },
      { id: 'u5', username: '赵敏', role: 'member', isOnline: false, joinedAt: '2024-01-19' },
    ],
    joinRequests: [
      { id: 'jr1', userId: 'u10', username: '周杰', message: '希望加入产品讨论，我是产品经理', requestedAt: '2小时前', status: 'pending' },
      { id: 'jr2', userId: 'u11', username: '吴敏', message: '对产品设计很感兴趣', requestedAt: '5小时前', status: 'pending' },
    ],
  },
  {
    id: 'g2',
    name: '技术团队',
    avatar: '',
    description: '技术开发与架构讨论',
    memberCount: 8,
    myRole: 'admin',
    createdAt: '2024-02-01',
    lastActive: '30分钟前',
    members: [
      { id: 'u6', username: '陈明', role: 'owner', isOnline: true, joinedAt: '2024-02-01' },
      { id: 'u1', username: '我', role: 'admin', isOnline: true, joinedAt: '2024-02-02' },
      { id: 'u7', username: '刘洋', role: 'member', isOnline: true, joinedAt: '2024-02-03' },
      { id: 'u8', username: '黄丽', role: 'member', isOnline: false, joinedAt: '2024-02-04' },
    ],
    joinRequests: [],
  },
  {
    id: 'g3',
    name: '设计部门',
    avatar: '',
    description: 'UI/UX设计交流',
    memberCount: 6,
    myRole: 'member',
    createdAt: '2024-02-15',
    lastActive: '2小时前',
    members: [
      { id: 'u9', username: '孙艺', role: 'owner', isOnline: false, joinedAt: '2024-02-15' },
      { id: 'u1', username: '我', role: 'member', isOnline: true, joinedAt: '2024-02-20' },
      { id: 'u10', username: '钱峰', role: 'member', isOnline: true, joinedAt: '2024-02-21' },
    ],
    joinRequests: [],
  },
  {
    id: 'g4',
    name: '市场营销',
    avatar: '',
    description: '市场推广与营销策略',
    memberCount: 15,
    myRole: 'member',
    createdAt: '2024-03-01',
    lastActive: '昨天',
    members: [
      { id: 'u11', username: '郑涛', role: 'owner', isOnline: true, joinedAt: '2024-03-01' },
      { id: 'u1', username: '我', role: 'member', isOnline: true, joinedAt: '2024-03-05' },
    ],
    joinRequests: [],
  },
  {
    id: 'g5',
    name: '运营团队',
    avatar: '',
    description: '产品运营与用户增长',
    memberCount: 10,
    myRole: 'owner',
    createdAt: '2024-03-15',
    lastActive: '3天前',
    members: [
      { id: 'u1', username: '我', role: 'owner', isOnline: true, joinedAt: '2024-03-15' },
      { id: 'u12', username: '吴磊', role: 'member', isOnline: false, joinedAt: '2024-03-16' },
      { id: 'u13', username: '徐静', role: 'member', isOnline: true, joinedAt: '2024-03-17' },
    ],
    joinRequests: [
      { id: 'jr3', userId: 'u14', username: '马云飞', message: '想了解运营相关内容', requestedAt: '1天前', status: 'pending' },
    ],
  },
]

// Role badge component
function RoleBadge({ role }: { role: 'owner' | 'admin' | 'member' }) {
  if (role === 'owner') {
    return (
      <Badge variant="default" className="gap-1 bg-amber-500 hover:bg-amber-500 text-white">
        <Crown className="size-3" />
        群主
      </Badge>
    )
  }
  if (role === 'admin') {
    return (
      <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
        <Shield className="size-3" />
        管理员
      </Badge>
    )
  }
  return null
}

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [searchQuery, setSearchQuery] = useState('')
  const [mainTab, setMainTab] = useState('my-groups')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [detailsTab, setDetailsTab] = useState('members')

  // Create group form state
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [newGroupAvatar, setNewGroupAvatar] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Alert dialog state
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
    actionText: string
    variant?: 'destructive' | 'default'
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
    actionText: '',
    variant: 'default',
  })

  // Filtered groups
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups
    const query = searchQuery.toLowerCase()
    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query)
    )
  }, [groups, searchQuery])

  // Get pending requests count for a group
  const getPendingRequestsCount = (group: Group) => {
    return group.joinRequests.filter((r) => r.status === 'pending').length
  }

  // Create new group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setCreateMessage({ type: 'error', text: '请输入群组名称' })
      return
    }

    setCreateLoading(true)
    setCreateMessage(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: newGroupName.trim(),
      avatar: newGroupAvatar,
      description: newGroupDescription.trim() || '暂无描述',
      memberCount: 1,
      myRole: 'owner',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: '刚刚',
      members: [
        { id: 'u1', username: '我', role: 'owner', isOnline: true, joinedAt: new Date().toISOString().split('T')[0] },
      ],
      joinRequests: [],
    }

    setGroups((prev) => [newGroup, ...prev])
    setCreateMessage({ type: 'success', text: `群组 "${newGroupName}" 创建成功！` })
    setNewGroupName('')
    setNewGroupDescription('')
    setNewGroupAvatar('')
    setCreateLoading(false)
  }

  // Leave group
  const handleLeaveGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId))
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null)
    }
    setAlertDialog({ ...alertDialog, open: false })
  }

  // Delete group (owner only)
  const handleDeleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId))
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null)
    }
    setAlertDialog({ ...alertDialog, open: false })
  }

  // Kick member (owner/admin only)
  const handleKickMember = (groupId: string, memberId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            members: g.members.filter((m) => m.id !== memberId),
            memberCount: g.memberCount - 1,
          }
        }
        return g
      })
    )
    if (selectedGroup?.id === groupId) {
      setSelectedGroup((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.filter((m) => m.id !== memberId),
              memberCount: prev.memberCount - 1,
            }
          : null
      )
    }
    setAlertDialog({ ...alertDialog, open: false })
  }

  // Approve join request
  const handleApproveRequest = (groupId: string, requestId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const request = g.joinRequests.find((r) => r.id === requestId)
          if (request) {
            const newMember: GroupMember = {
              id: request.userId,
              username: request.username,
              avatar: request.avatar,
              role: 'member',
              isOnline: false,
              joinedAt: new Date().toISOString().split('T')[0],
            }
            return {
              ...g,
              members: [...g.members, newMember],
              memberCount: g.memberCount + 1,
              joinRequests: g.joinRequests.map((r) =>
                r.id === requestId ? { ...r, status: 'approved' as const } : r
              ),
            }
          }
        }
        return g
      })
    )
    if (selectedGroup?.id === groupId) {
      const request = selectedGroup.joinRequests.find((r) => r.id === requestId)
      if (request) {
        const newMember: GroupMember = {
          id: request.userId,
          username: request.username,
          avatar: request.avatar,
          role: 'member',
          isOnline: false,
          joinedAt: new Date().toISOString().split('T')[0],
        }
        setSelectedGroup((prev) =>
          prev
            ? {
                ...prev,
                members: [...prev.members, newMember],
                memberCount: prev.memberCount + 1,
                joinRequests: prev.joinRequests.map((r) =>
                  r.id === requestId ? { ...r, status: 'approved' as const } : r
                ),
              }
            : null
        )
      }
    }
  }

  // Reject join request
  const handleRejectRequest = (groupId: string, requestId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            joinRequests: g.joinRequests.map((r) =>
              r.id === requestId ? { ...r, status: 'rejected' as const } : r
            ),
          }
        }
        return g
      })
    )
    if (selectedGroup?.id === groupId) {
      setSelectedGroup((prev) =>
        prev
          ? {
              ...prev,
              joinRequests: prev.joinRequests.map((r) =>
                r.id === requestId ? { ...r, status: 'rejected' as const } : r
              ),
            }
          : null
      )
    }
  }

  // Confirm dialog helper
  const showConfirmDialog = (
    title: string,
    description: string,
    action: () => void,
    actionText: string,
    variant: 'destructive' | 'default' = 'default'
  ) => {
    setAlertDialog({ open: true, title, description, action, actionText, variant })
  }

  // Group Details View
  if (selectedGroup) {
    const isOwner = selectedGroup.myRole === 'owner'
    const isAdmin = selectedGroup.myRole === 'admin'
    const canManage = isOwner || isAdmin
    const pendingRequests = selectedGroup.joinRequests.filter((r) => r.status === 'pending')

    return (
      <div className="h-full flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedGroup(null)}>
              <ArrowLeft className="size-5" />
            </Button>
            <Avatar className="size-12">
              {selectedGroup.avatar ? (
                <AvatarImage src={selectedGroup.avatar} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                  {selectedGroup.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{selectedGroup.name}</h1>
                <RoleBadge role={selectedGroup.myRole} />
              </div>
              <p className="text-sm text-muted-foreground">{selectedGroup.description}</p>
            </div>
            {isOwner && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={() =>
                  showConfirmDialog(
                    '解散群组',
                    `确定要解散群组 "${selectedGroup.name}" 吗？此操作不可撤销，所有成员将被移出群组。`,
                    () => handleDeleteGroup(selectedGroup.id),
                    '解散群组',
                    'destructive'
                  )
                }
              >
                <Trash2 className="size-4" />
                解散群组
              </Button>
            )}
            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={() =>
                  showConfirmDialog(
                    '退出群组',
                    `确定要退出群组 "${selectedGroup.name}" 吗？`,
                    () => handleLeaveGroup(selectedGroup.id),
                    '退出群组',
                    'destructive'
                  )
                }
              >
                <LogOut className="size-4" />
                退出群组
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={detailsTab} onValueChange={setDetailsTab} className="flex-1 flex flex-col">
          <div className="border-b border-border px-4">
            <TabsList className="bg-transparent h-12 p-0 gap-4">
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
              >
                <Users className="size-4 mr-2" />
                成员 ({selectedGroup.memberCount})
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger
                  value="requests"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  <UserPlus className="size-4 mr-2" />
                  加入申请
                  {pendingRequests.length > 0 && (
                    <Badge variant="destructive" className="ml-2 size-5 p-0 justify-center">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
              >
                <Settings className="size-4 mr-2" />
                群组信息
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Members Tab */}
          <TabsContent value="members" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {selectedGroup.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 group"
                  >
                    <div className="relative">
                      <Avatar className="size-10">
                        {member.avatar ? (
                          <AvatarImage src={member.avatar} />
                        ) : (
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {member.username.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-card ${
                          member.isOnline ? 'bg-green-500' : 'bg-muted-foreground/50'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{member.username}</span>
                        <RoleBadge role={member.role} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        加入于 {member.joinedAt}
                      </p>
                    </div>
                    {canManage && member.role === 'member' && member.id !== 'u1' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          showConfirmDialog(
                            '移除成员',
                            `确定要将 "${member.username}" 移出群组吗？`,
                            () => handleKickMember(selectedGroup.id, member.id),
                            '移除',
                            'destructive'
                          )
                        }
                      >
                        <UserMinus className="size-4 mr-1" />
                        移除
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Join Requests Tab (Owner Only) */}
          {isOwner && (
            <TabsContent value="requests" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {selectedGroup.joinRequests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <UserPlus className="size-12 mx-auto mb-3 opacity-50" />
                      <p>暂无加入申请</p>
                    </div>
                  ) : (
                    selectedGroup.joinRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 rounded-lg border ${
                          request.status === 'pending'
                            ? 'bg-card border-border'
                            : 'bg-muted/30 border-transparent opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="size-10">
                            {request.avatar ? (
                              <AvatarImage src={request.avatar} />
                            ) : (
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                {request.username.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{request.username}</span>
                              {request.status === 'approved' && (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-500">
                                  已通过
                                </Badge>
                              )}
                              {request.status === 'rejected' && (
                                <Badge variant="secondary" className="bg-red-100 text-red-700">
                                  已拒绝
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{request.requestedAt}</p>
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="gap-1"
                                onClick={() => handleApproveRequest(selectedGroup.id, request.id)}
                              >
                                <Check className="size-4" />
                                通过
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => handleRejectRequest(selectedGroup.id, request.id)}
                              >
                                <X className="size-4" />
                                拒绝
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">群组信息</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <Users className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">成员数量</p>
                        <p className="text-sm text-muted-foreground">{selectedGroup.memberCount} 人</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <Crown className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">群主</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedGroup.members.find((m) => m.role === 'owner')?.username || '未知'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <Bell className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">最近活跃</p>
                        <p className="text-sm text-muted-foreground">{selectedGroup.lastActive}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Alert Dialog */}
        <AlertDialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{alertDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={alertDialog.action}
                className={alertDialog.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {alertDialog.actionText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Main Groups View
  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-card-foreground">群组管理</h1>
      </div>

      {/* Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="flex-1 flex flex-col">
        <div className="border-b border-border px-4">
          <TabsList className="bg-transparent h-12 p-0 gap-6">
            <TabsTrigger
              value="my-groups"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
            >
              <Users className="size-4 mr-2" />
              我的群组 ({groups.length})
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
            >
              <Plus className="size-4 mr-2" />
              创建群组
            </TabsTrigger>
          </TabsList>
        </div>

        {/* My Groups Tab */}
        <TabsContent value="my-groups" className="flex-1 m-0 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索群组..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted border-none"
              />
            </div>
          </div>

          {/* Group List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="size-12 mx-auto mb-3 opacity-50" />
                  <p>{searchQuery ? '未找到匹配的群组' : '暂无群组'}</p>
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const pendingCount = getPendingRequestsCount(group)
                  return (
                    <div
                      key={group.id}
                      className="flex items-center gap-4 rounded-xl p-4 bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Avatar className="size-12">
                        {group.avatar ? (
                          <AvatarImage src={group.avatar} />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground text-base font-medium">
                            {group.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{group.name}</p>
                          <RoleBadge role={group.myRole} />
                          {group.myRole === 'owner' && pendingCount > 0 && (
                            <Badge variant="destructive" className="size-5 p-0 justify-center">
                              {pendingCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="size-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{group.memberCount} 成员</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">活跃于 {group.lastActive}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedGroup(group)}>
                          <Eye className="size-4 mr-1" />
                          查看
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedGroup(group)}>
                              <Eye className="size-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            {group.myRole === 'owner' && (
                              <DropdownMenuItem onClick={() => { setSelectedGroup(group); setDetailsTab('requests'); }}>
                                <UserPlus className="size-4 mr-2" />
                                加入申请
                                {pendingCount > 0 && (
                                  <Badge variant="destructive" className="ml-auto size-5 p-0 justify-center">
                                    {pendingCount}
                                  </Badge>
                                )}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {group.myRole === 'owner' ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  showConfirmDialog(
                                    '解散群组',
                                    `确定要解散群组 "${group.name}" 吗？此操作不可撤销。`,
                                    () => handleDeleteGroup(group.id),
                                    '解散群组',
                                    'destructive'
                                  )
                                }
                              >
                                <Trash2 className="size-4 mr-2" />
                                解散群组
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  showConfirmDialog(
                                    '退出群组',
                                    `确定要退出群组 "${group.name}" 吗？`,
                                    () => handleLeaveGroup(group.id),
                                    '退出群组',
                                    'destructive'
                                  )
                                }
                              >
                                <LogOut className="size-4 mr-2" />
                                退出群组
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Create Group Tab */}
        <TabsContent value="create" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-lg mx-auto">
              <div className="text-center mb-6">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Plus className="size-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">创建新群组</h2>
                <p className="text-sm text-muted-foreground mt-1">创建一个群组来与多人交流</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">
                    群组名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="group-name"
                    placeholder="输入群组名称"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-description">群组简介</Label>
                  <Textarea
                    id="group-description"
                    placeholder="输入群组简介（可选）"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-avatar">群组头像 URL</Label>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      {newGroupAvatar ? (
                        <AvatarImage src={newGroupAvatar} />
                      ) : (
                        <AvatarFallback className="bg-muted">
                          <ImagePlus className="size-5 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Input
                      id="group-avatar"
                      placeholder="输入头像图片 URL（可选）"
                      value={newGroupAvatar}
                      onChange={(e) => setNewGroupAvatar(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                {createMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      createMessage.type === 'error'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {createMessage.text}
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  onClick={handleCreateGroup}
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <>
                      <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      创建群组
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Alert Dialog */}
      <AlertDialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={alertDialog.action}
              className={alertDialog.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {alertDialog.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
