'use client'

import { useState, useEffect } from 'react'
import { TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info, CircleCheck as CheckCircle, Circle as XCircle, RefreshCw, Clock, Server, ArrowUpDown, Activity, Wrench, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Types based on backend data model
interface Alert {
  id: number
  alert_name: string
  severity: 'critical' | 'warning' | 'info'
  fingerprint: string
  status: 'firing' | 'resolved'
  labels: Record<string, string>
  annotations: Record<string, string>
  fired_at: string
  resolved_at: string | null
}

interface HealAction {
  id: number
  alert_id: number | null
  action_type: 'pod_restart' | 'hpa_scale_out' | 'hpa_scale_in' | 'node_drain' | 'service_restart' | 'config_reload'
  target_resource: string
  status: 'pending' | 'running' | 'success' | 'failed'
  result_message: string
  executed_at: string
}

// Mock data generators
const generateMockAlerts = (): Alert[] => {
  const alerts: Alert[] = [
    {
      id: 1,
      alert_name: 'HighCPUUsage',
      severity: 'critical',
      fingerprint: 'cpu-high-001',
      status: 'firing',
      labels: { service: 'api-gateway', node: 'node-1', namespace: 'production' },
      annotations: { description: 'CPU usage above 90% for 5 minutes', runbook_url: 'https://runbooks.io/cpu' },
      fired_at: new Date(Date.now() - 600000).toISOString(),
      resolved_at: null,
    },
    {
      id: 2,
      alert_name: 'MemoryPressure',
      severity: 'warning',
      fingerprint: 'mem-pressure-002',
      status: 'firing',
      labels: { service: 'user-service', node: 'node-3', namespace: 'production' },
      annotations: { description: 'Memory usage above 80%', runbook_url: 'https://runbooks.io/mem' },
      fired_at: new Date(Date.now() - 1800000).toISOString(),
      resolved_at: null,
    },
    {
      id: 3,
      alert_name: 'PodCrashLooping',
      severity: 'critical',
      fingerprint: 'pod-crash-003',
      status: 'firing',
      labels: { service: 'order-service', pod: 'order-5f8d9c', namespace: 'production' },
      annotations: { description: 'Pod has restarted 5 times in the last 10 minutes' },
      fired_at: new Date(Date.now() - 300000).toISOString(),
      resolved_at: null,
    },
    {
      id: 4,
      alert_name: 'DiskSpaceLow',
      severity: 'warning',
      fingerprint: 'disk-low-004',
      status: 'resolved',
      labels: { service: 'database', node: 'node-5', namespace: 'production' },
      annotations: { description: 'Disk usage above 85%' },
      fired_at: new Date(Date.now() - 7200000).toISOString(),
      resolved_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 5,
      alert_name: 'RequestLatencyHigh',
      severity: 'info',
      fingerprint: 'latency-high-005',
      status: 'firing',
      labels: { service: 'payment-service', endpoint: '/api/pay', namespace: 'production' },
      annotations: { description: 'P99 latency above 500ms' },
      fired_at: new Date(Date.now() - 900000).toISOString(),
      resolved_at: null,
    },
    {
      id: 6,
      alert_name: 'ConnectionPoolExhausted',
      severity: 'critical',
      fingerprint: 'pool-exh-006',
      status: 'firing',
      labels: { service: 'auth-service', database: 'postgres-primary', namespace: 'production' },
      annotations: { description: 'Database connection pool at 95% capacity' },
      fired_at: new Date(Date.now() - 120000).toISOString(),
      resolved_at: null,
    },
    {
      id: 7,
      alert_name: 'SSLExpirySoon',
      severity: 'warning',
      fingerprint: 'ssl-exp-007',
      status: 'resolved',
      labels: { domain: 'api.mochat.io', namespace: 'ingress' },
      annotations: { description: 'SSL certificate expires in 7 days' },
      fired_at: new Date(Date.now() - 86400000).toISOString(),
      resolved_at: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 8,
      alert_name: 'ReplicaLagHigh',
      severity: 'warning',
      fingerprint: 'repl-lag-008',
      status: 'firing',
      labels: { service: 'database-replica', lag_seconds: '45', namespace: 'production' },
      annotations: { description: 'Replica lag exceeding 30 seconds threshold' },
      fired_at: new Date(Date.now() - 1500000).toISOString(),
      resolved_at: null,
    },
  ]

  return alerts
}

const generateMockHealActions = (): HealAction[] => {
  const actions: HealAction[] = [
    {
      id: 1,
      alert_id: 1,
      action_type: 'hpa_scale_out',
      target_resource: 'deployment/api-gateway',
      status: 'success',
      result_message: 'Scaled from 3 to 5 replicas',
      executed_at: new Date(Date.now() - 540000).toISOString(),
    },
    {
      id: 2,
      alert_id: 3,
      action_type: 'pod_restart',
      target_resource: 'pod/order-5f8d9c',
      status: 'success',
      result_message: 'Pod restarted successfully, now running',
      executed_at: new Date(Date.now() - 240000).toISOString(),
    },
    {
      id: 3,
      alert_id: 6,
      action_type: 'config_reload',
      target_resource: 'deployment/auth-service',
      status: 'running',
      result_message: 'Applying new connection pool configuration',
      executed_at: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: 4,
      alert_id: 2,
      action_type: 'hpa_scale_out',
      target_resource: 'deployment/user-service',
      status: 'pending',
      result_message: 'Waiting for approval',
      executed_at: new Date(Date.now() - 30000).toISOString(),
    },
    {
      id: 5,
      alert_id: null,
      action_type: 'node_drain',
      target_resource: 'node/node-2',
      status: 'failed',
      result_message: 'Failed: pod disruption budget prevents eviction',
      executed_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 6,
      alert_id: 8,
      action_type: 'service_restart',
      target_resource: 'statefulset/database-replica',
      status: 'success',
      result_message: 'Replica sync restarted, lag now under 5s',
      executed_at: new Date(Date.now() - 1200000).toISOString(),
    },
  ]

  return actions
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    badgeVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    badgeVariant: 'secondary' as const,
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    badgeVariant: 'outline' as const,
  },
}

const statusConfig = {
  firing: {
    icon: Zap,
    color: 'text-orange-500',
    badgeVariant: 'destructive' as const,
  },
  resolved: {
    icon: CheckCircle,
    color: 'text-green-500',
    badgeVariant: 'secondary' as const,
  },
}

const healStatusConfig = {
  pending: { icon: Clock, color: 'text-gray-500', badgeVariant: 'outline' as const },
  running: { icon: RefreshCw, color: 'text-blue-500', badgeVariant: 'secondary' as const },
  success: { icon: CheckCircle, color: 'text-green-500', badgeVariant: 'default' as const },
  failed: { icon: XCircle, color: 'text-red-500', badgeVariant: 'destructive' as const },
}

const actionTypeLabels: Record<HealAction['action_type'], string> = {
  pod_restart: 'Pod Restart',
  hpa_scale_out: 'HPA Scale Out',
  hpa_scale_in: 'HPA Scale In',
  node_drain: 'Node Drain',
  service_restart: 'Service Restart',
  config_reload: 'Config Reload',
}

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function AIOpsDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [healActions, setHealActions] = useState<HealAction[]>([])
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setIsLoading(true)
    setTimeout(() => {
      setAlerts(generateMockAlerts())
      setHealActions(generateMockHealActions())
      setIsLoading(false)
    }, 500)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setAlerts(generateMockAlerts())
      setHealActions(generateMockHealActions())
      setIsLoading(false)
    }, 500)
  }

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false
    return true
  })

  // Stats
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'firing').length
  const warningCount = alerts.filter(a => a.severity === 'warning' && a.status === 'firing').length
  const infoCount = alerts.filter(a => a.severity === 'info' && a.status === 'firing').length
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Activity className="size-6" />
            AIOps Dashboard
          </h1>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="gap-2">
            <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{warningCount}</p>
                  <p className="text-xs text-muted-foreground">Warning</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Info className="size-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-500">{infoCount}</p>
                  <p className="text-xs text-muted-foreground">Info</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-500">{resolvedCount}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="size-4" />
              Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="heal" className="gap-2">
              <Wrench className="size-4" />
              Heal Actions ({healActions.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="alerts" className="flex-1 mt-0 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Filters */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Severity:</Label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Status:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="firing">Firing</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <span className="text-sm text-muted-foreground ml-auto">
                Showing {filteredAlerts.length} of {alerts.length} alerts
              </span>
            </div>

            {/* Alerts List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="size-8 mx-auto mb-2 animate-spin" />
                    <p>Loading alerts...</p>
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="size-8 mx-auto mb-2 text-green-500" />
                    <p>No alerts match your filters</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const sevConfig = severityConfig[alert.severity]
                    const statConfig = statusConfig[alert.status]
                    const SevIcon = sevConfig.icon
                    const StatIcon = statConfig.icon

                    return (
                      <Card
                        key={alert.id}
                        className={cn(
                          'transition-colors',
                          alert.status === 'firing' && 'hover:bg-muted/50',
                          alert.status === 'resolved' && 'opacity-70'
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              'size-10 rounded-lg flex items-center justify-center shrink-0',
                              sevConfig.bgColor
                            )}>
                              <SevIcon className={cn('size-5', sevConfig.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{alert.alert_name}</h3>
                                <Badge variant={sevConfig.badgeVariant}>
                                  {alert.severity}
                                </Badge>
                                <Badge variant={statConfig.badgeVariant} className="gap-1">
                                  <StatIcon className="size-3" />
                                  {alert.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {alert.annotations.description}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {Object.entries(alert.labels).map(([key, value]) => (
                                  <Badge key={key} variant="outline" className="font-mono">
                                    {key}={value}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-muted-foreground">{formatTimestamp(alert.fired_at)}</p>
                              {alert.resolved_at && (
                                <p className="text-xs text-green-500 mt-1">
                                  Resolved {formatTimestamp(alert.resolved_at)}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="heal" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="size-8 mx-auto mb-2 animate-spin" />
                  <p>Loading heal actions...</p>
                </div>
              ) : healActions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="size-8 mx-auto mb-2" />
                  <p>No heal actions recorded</p>
                </div>
              ) : (
                healActions.map((action) => {
                  const config = healStatusConfig[action.status]
                  const StatusIcon = config.icon

                  return (
                    <Card key={action.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'size-10 rounded-lg flex items-center justify-center shrink-0 bg-muted',
                            action.status === 'success' && 'bg-green-500/10',
                            action.status === 'failed' && 'bg-red-500/10',
                            action.status === 'running' && 'bg-blue-500/10'
                          )}>
                            <Wrench className={cn(
                              'size-5',
                              action.status === 'success' && 'text-green-500',
                              action.status === 'failed' && 'text-red-500',
                              action.status === 'running' && 'text-blue-500'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{actionTypeLabels[action.action_type]}</h3>
                              <Badge variant={config.badgeVariant} className="gap-1">
                                <StatusIcon className={cn(
                                  'size-3',
                                  action.status === 'running' && 'animate-spin'
                                )} />
                                {action.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Server className="size-4" />
                              <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                                {action.target_resource}
                              </code>
                            </div>
                            <p className="text-sm">{action.result_message}</p>
                            {action.alert_id && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Triggered by Alert #{action.alert_id}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(action.executed_at)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

