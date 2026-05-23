'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Lock, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Types based on backend data model
interface Message {
  msg_id: number
  conversation_id: number
  seq: number
  sender_uid: number
  sender_name: string
  payload_base64: string
  server_ts_ms: number
  kind: 'text' | 'system' | 'call' | 'video'
}

interface Conversation {
  id: number
  type: number // 0=private, 1=group
  name: string
  latest_seq: number
  latest_msg_time: string | null
  uid_1_seq: number
  uid_2_seq: number
}

// Mock data generators
const generateMockConversations = (): Conversation[] => {
  return [
    { id: 1001, type: 0, name: 'Alice Wang', latest_seq: 100, latest_msg_time: new Date().toISOString(), uid_1_seq: 100, uid_2_seq: 95 },
    { id: 1002, type: 0, name: 'Bob Chen', latest_seq: 75, latest_msg_time: new Date(Date.now() - 3600000).toISOString(), uid_1_seq: 75, uid_2_seq: 70 },
    { id: 1003, type: 0, name: 'Carol Li', latest_seq: 50, latest_msg_time: new Date(Date.now() - 7200000).toISOString(), uid_1_seq: 50, uid_2_seq: 48 },
    { id: 2001, type: 1, name: 'Product Team', latest_seq: 150, latest_msg_time: new Date(Date.now() - 1800000).toISOString(), uid_1_seq: 148, uid_2_seq: 145 },
    { id: 2002, type: 1, name: 'Engineering', latest_seq: 200, latest_msg_time: new Date().toISOString(), uid_1_seq: 195, uid_2_seq: 190 },
  ]
}

const generateMockMessages = (conversationId: number, count: number = 100): Message[] => {
  const messages: Message[] = []
  const baseTime = Date.now() - count * 60000 // 1 minute per message

  for (let i = 1; i <= count; i++) {
    const isCurrentUser = i % 3 === 0
    messages.push({
      msg_id: conversationId * 1000 + i,
      conversation_id: conversationId,
      seq: i,
      sender_uid: isCurrentUser ? 1 : 2,
      sender_name: isCurrentUser ? 'You' : ['Alice', 'Bob', 'Carol', 'David', 'Eve'][i % 5],
      payload_base64: btoa(`Message content ${i} - encrypted payload`),
      server_ts_ms: baseTime + i * 60000,
      kind: 'text'
    })
  }

  return messages
}

const decryptPayload = (_payload: string): string => {
  return '[encrypted]'
}

const formatTimestamp = (ts_ms: number): string => {
  const date = new Date(ts_ms)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function HistoryPage() {
  const [conversations] = useState<Conversation[]>(() => generateMockConversations())
  const [selectedConversationId, setSelectedConversationId] = useState<number>(conversations[0]?.id || 0)
  const [queryMode, setQueryMode] = useState<'cursor' | 'range'>('cursor')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Cursor pagination state
  const [cursorSeq, setCursorSeq] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 50

  // Range query state
  const [startSeq, setStartSeq] = useState('1')
  const [endSeq, setEndSeq] = useState('50')

  // All messages cache (for demo)
  const [allMessagesCache, setAllMessagesCache] = useState<Record<number, Message[]>>({})

  // Generate messages for selected conversation on mount
  useEffect(() => {
    if (selectedConversationId && !allMessagesCache[selectedConversationId]) {
      const msgData = generateMockMessages(selectedConversationId, 200)
      setAllMessagesCache(prev => ({ ...prev, [selectedConversationId]: msgData }))
    }
  }, [selectedConversationId, allMessagesCache])

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)
  const cachedMessages = allMessagesCache[selectedConversationId] || []

  // Load initial messages
  useEffect(() => {
    if (queryMode === 'cursor' && cachedMessages.length > 0) {
      const latestMessages = [...cachedMessages].sort((a, b) => b.seq - a.seq).slice(0, pageSize)
      setMessages(latestMessages)
      setCursorSeq(latestMessages[latestMessages.length - 1]?.seq || null)
      setHasMore(latestMessages.length >= pageSize)
    }
  }, [selectedConversationId, queryMode, cachedMessages])

  const handleLoadOlder = () => {
    if (!cursorSeq || isLoading) return
    setIsLoading(true)

    setTimeout(() => {
      const olderMessages = cachedMessages
        .filter(m => m.seq < cursorSeq)
        .sort((a, b) => b.seq - a.seq)
        .slice(0, pageSize)

      if (olderMessages.length > 0) {
        setMessages(prev => [...prev, ...olderMessages])
        setCursorSeq(olderMessages[olderMessages.length - 1]?.seq || null)
        setHasMore(olderMessages.length >= pageSize)
      } else {
        setHasMore(false)
      }
      setIsLoading(false)
    }, 300)
  }

  const handleRangeQuery = () => {
    const start = parseInt(startSeq, 10)
    const end = parseInt(endSeq, 10)

    if (isNaN(start) || isNaN(end) || start > end) {
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const rangeMessages = cachedMessages
        .filter(m => m.seq >= start && m.seq <= end)
        .sort((a, b) => a.seq - b.seq)
      setMessages(rangeMessages)
      setHasMore(false)
      setIsLoading(false)
    }, 300)
  }

  const handleRefresh = () => {
    setCursorSeq(null)
    setHasMore(true)
    if (queryMode === 'cursor' && cachedMessages.length > 0) {
      const latestMessages = [...cachedMessages].sort((a, b) => b.seq - a.seq).slice(0, pageSize)
      setMessages(latestMessages)
      setCursorSeq(latestMessages[latestMessages.length - 1]?.seq || null)
    }
  }

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => b.seq - a.seq)
  }, [messages])

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-card-foreground">History Query</h1>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>

        {/* Conversation Selector */}
        <div className="space-y-2">
          <Label>Select Conversation</Label>
          <Select value={String(selectedConversationId)} onValueChange={(v) => setSelectedConversationId(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a conversation" />
            </SelectTrigger>
            <SelectContent>
              {conversations.map((conv) => (
                <SelectItem key={conv.id} value={String(conv.id)}>
                  <div className="flex items-center gap-2">
                    <span>{conv.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {conv.type === 0 ? 'Private' : 'Group'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      (seq: {conv.latest_seq})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Query Mode Tabs */}
        <Tabs value={queryMode} onValueChange={(v) => setQueryMode(v as 'cursor' | 'range')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cursor">Cursor Pagination</TabsTrigger>
            <TabsTrigger value="range">Range Query</TabsTrigger>
          </TabsList>

          <TabsContent value="cursor" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Load messages in pages of {pageSize}. Current cursor: {cursorSeq || 'start'}
            </p>
          </TabsContent>

          <TabsContent value="range" className="mt-4 space-y-3">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label>Start Seq</Label>
                <Input
                  type="number"
                  value={startSeq}
                  onChange={(e) => setStartSeq(e.target.value)}
                  min={1}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>End Seq</Label>
                <Input
                  type="number"
                  value={endSeq}
                  onChange={(e) => setEndSeq(e.target.value)}
                  min={1}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleRangeQuery} disabled={isLoading}>
                  Query
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Conversation Info */}
        {selectedConversation && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conversation ID:</span>
              <span className="font-mono">{selectedConversation.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latest Seq:</span>
              <span className="font-mono">{selectedConversation.latest_seq}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Read Seq:</span>
              <span className="font-mono">{selectedConversation.uid_1_seq}</span>
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Load Older Button (Cursor mode) */}
          {queryMode === 'cursor' && hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadOlder}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronLeft className="size-4" />
                    Load Older Messages
                  </>
                )}
              </Button>
            </div>
          )}

          {sortedMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages found
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMessages.map((msg) => (
                <div
                  key={msg.msg_id}
                  className={cn(
                    'flex gap-3 p-3 rounded-lg border',
                    msg.sender_uid === 1 ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'
                  )}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className={msg.sender_uid === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                      {msg.sender_name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.sender_name}</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        seq: {msg.seq}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {msg.kind}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Lock className="size-3" />
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                        {decryptPayload(msg.payload_base64)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(msg.server_ts_ms)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasMore && messages.length > 0 && queryMode === 'cursor' && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No more messages
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {messages.length} messages
          </span>
          <span className="text-muted-foreground">
            Seq Range: {sortedMessages[sortedMessages.length - 1]?.seq || '-'} - {sortedMessages[0]?.seq || '-'}
          </span>
        </div>
      </div>
    </div>
  )
}
