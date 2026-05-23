'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Key, Network, Gauge, LogOut, Copy, RefreshCw, Save, Shield, Clock, CircleAlert as AlertCircle, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

// Mock user data
interface UserProfile {
  id: string
  username: string
  publicKey: string
}

const initialUser: UserProfile = {
  id: '123456789012345678',
  username: 'zhang_ming',
  publicKey: 'MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAE' + Array.from({ length: 40 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='[
      Math.floor(Math.random() * 64)
    ]
  ).join('')
}

export function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser] = useState<UserProfile>(initialUser)
  const [editUsername, setEditUsername] = useState(user.username)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [copied, setCopied] = useState(false)

  // Network settings
  const [heartbeatInterval, setHeartbeatInterval] = useState('10')
  const [timeout, setTimeout] = useState('5')

  // Rate limit settings
  const [tokensPerSec, setTokensPerSec] = useState('20')
  const [burst, setBurst] = useState('100')

  // Load settings from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('mochat_username')
    if (savedUsername) {
      setUser(prev => ({ ...prev, username: savedUsername }))
      setEditUsername(savedUsername)
    }

    const savedHeartbeat = localStorage.getItem('mochat_heartbeat_interval')
    if (savedHeartbeat) setHeartbeatInterval(savedHeartbeat)

    const savedTimeout = localStorage.getItem('mochat_timeout')
    if (savedTimeout) setTimeout(savedTimeout)

    const savedTokens = localStorage.getItem('mochat_tokens_per_sec')
    if (savedTokens) setTokensPerSec(savedTokens)

    const savedBurst = localStorage.getItem('mochat_burst')
    if (savedBurst) setBurst(savedBurst)
  }, [])

  const handleSaveUsername = () => {
    if (!editUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Username cannot be empty',
        variant: 'destructive'
      })
      return
    }

    localStorage.setItem('mochat_username', editUsername)
    setUser(prev => ({ ...prev, username: editUsername }))
    setIsEditingUsername(false)
    toast({
      title: 'Success',
      description: 'Username saved successfully'
    })
  }

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText(user.publicKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: 'Copied',
      description: 'Public key copied to clipboard'
    })
  }

  const handleRegenerateKey = () => {
    const newKey = 'MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAE' + Array.from({ length: 40 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='[
        Math.floor(Math.random() * 64)
      ]
    ).join('')
    setUser(prev => ({ ...prev, publicKey: newKey }))
    toast({
      title: 'Key Regenerated',
      description: 'A new public key has been generated (demo only)'
    })
  }

  const handleSaveNetworkSettings = () => {
    const hbi = parseInt(heartbeatInterval, 10)
    const t = parseInt(timeout, 10)

    if (isNaN(hbi) || hbi < 1 || hbi > 60) {
      toast({
        title: 'Invalid Value',
        description: 'Heartbeat interval must be between 1 and 60 seconds',
        variant: 'destructive'
      })
      return
    }

    if (isNaN(t) || t < 1 || t > 30) {
      toast({
        title: 'Invalid Value',
        description: 'Timeout must be between 1 and 30 seconds',
        variant: 'destructive'
      })
      return
    }

    localStorage.setItem('mochat_heartbeat_interval', heartbeatInterval)
    localStorage.setItem('mochat_timeout', timeout)
    toast({
      title: 'Saved',
      description: 'Network settings saved successfully'
    })
  }

  const handleSaveRateLimitSettings = () => {
    const tps = parseInt(tokensPerSec, 10)
    const b = parseInt(burst, 10)

    if (isNaN(tps) || tps < 1 || tps > 1000) {
      toast({
        title: 'Invalid Value',
        description: 'Tokens per second must be between 1 and 1000',
        variant: 'destructive'
      })
      return
    }

    if (isNaN(b) || b < 1 || b > 10000) {
      toast({
        title: 'Invalid Value',
        description: 'Burst must be between 1 and 10000',
        variant: 'destructive'
      })
      return
    }

    localStorage.setItem('mochat_tokens_per_sec', tokensPerSec)
    localStorage.setItem('mochat_burst', burst)
    toast({
      title: 'Saved',
      description: 'Rate limit settings saved successfully'
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('mochat_session')
    localStorage.removeItem('mochat_username')
    toast({
      title: 'Logged Out',
      description: 'Session cleared. Redirecting to login...'
    })
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  }

  const truncateKey = (key: string) => {
    if (key.length <= 16) return key
    return `${key.slice(0, 8)}...${key.slice(-8)}`
  }

  return (
    <div className="h-full flex flex-col bg-card overflow-y-auto mochat-scrollbar">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-card-foreground">Settings</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">User ID:</Label>
                  <Badge variant="outline" className="font-mono">
                    {user.id.slice(0, 8)}...{user.id.slice(-6)}
                  </Badge>
                </div>

                {isEditingUsername ? (
                  <div className="flex gap-2">
                    <Input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="max-w-[200px]"
                    />
                    <Button size="sm" onClick={handleSaveUsername}>
                      <Save className="size-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditUsername(user.username)
                        setIsEditingUsername(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground">Username:</Label>
                    <span className="font-medium">{user.username}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingUsername(true)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* E2EE Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <CardTitle>End-to-End Encryption</CardTitle>
            </div>
            <CardDescription>Manage your encryption keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Public Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
                  {truncateKey(user.publicKey)}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyPublicKey}
                  className="shrink-0"
                >
                  {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Full key length: {user.publicKey.length} characters
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyPublicKey} className="gap-2">
                <Copy className="size-4" />
                Export Full Key
              </Button>
              <Button variant="outline" onClick={handleRegenerateKey} className="gap-2">
                <RefreshCw className="size-4" />
                Regenerate Key
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <p className="text-xs">
                  Key regeneration will invalidate all existing encrypted messages.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Network className="size-5 text-primary" />
              <CardTitle>Network Settings</CardTitle>
            </div>
            <CardDescription>Connection and heartbeat configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heartbeat">Heartbeat Interval (seconds)</Label>
                <Input
                  id="heartbeat"
                  type="number"
                  value={heartbeatInterval}
                  onChange={(e) => setHeartbeatInterval(e.target.value)}
                  min={1}
                  max={60}
                />
                <p className="text-xs text-muted-foreground">
                  Client sends heartbeat every {heartbeatInterval}s
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Connection Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(e.target.value)}
                  min={1}
                  max={30}
                />
                <p className="text-xs text-muted-foreground">
                  Timeout after {timeout}s of no response
                </p>
              </div>
            </div>

            <Button onClick={handleSaveNetworkSettings} className="gap-2">
              <Save className="size-4" />
              Save Network Settings
            </Button>
          </CardContent>
        </Card>

        {/* Rate Limit Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Gauge className="size-5 text-primary" />
              <CardTitle>Rate Limiting</CardTitle>
            </div>
            <CardDescription>Token bucket algorithm configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tokens">Tokens per Second</Label>
                <Input
                  id="tokens"
                  type="number"
                  value={tokensPerSec}
                  onChange={(e) => setTokensPerSec(e.target.value)}
                  min={1}
                  max={1000}
                />
                <p className="text-xs text-muted-foreground">
                  Refill rate: {tokensPerSec} tokens/s
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="burst">Burst Capacity</Label>
                <Input
                  id="burst"
                  type="number"
                  value={burst}
                  onChange={(e) => setBurst(e.target.value)}
                  min={1}
                  max={10000}
                />
                <p className="text-xs text-muted-foreground">
                  Max burst: {burst} tokens
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">
                With current settings: You can send up to {burst} messages instantly,
                then sustain {tokensPerSec} messages/second.
              </p>
            </div>

            <Button onClick={handleSaveRateLimitSettings} className="gap-2">
              <Save className="size-4" />
              Save Rate Limit Settings
            </Button>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LogOut className="size-5 text-destructive" />
              <CardTitle className="text-destructive">Session</CardTitle>
            </div>
            <CardDescription>Manage your current session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sign out of your account</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will clear your session and redirect to the login page
                </p>
              </div>
              <Button variant="destructive" onClick={handleLogout} className="gap-2">
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <div className="rounded-xl bg-muted/30 p-4 text-center mt-8">
          <p className="text-2xl font-semibold text-primary mb-1">MoChat</p>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-2">End-to-End Encrypted Messaging</p>
        </div>
      </div>
    </div>
  )
}
