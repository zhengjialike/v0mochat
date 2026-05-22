'use client'

import { User, Bell, Shield, Palette, Globe, Info, ChevronRight } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function SettingsPage() {
  const settingsSections = [
    {
      title: '账户',
      icon: User,
      items: [
        { label: '个人资料', description: '修改头像、昵称和签名', hasArrow: true },
        { label: '账户安全', description: '密码和两步验证', hasArrow: true },
      ],
    },
    {
      title: '通知',
      icon: Bell,
      items: [
        { label: '消息通知', description: '接收新消息提醒', hasSwitch: true, defaultChecked: true },
        { label: '声音', description: '播放通知声音', hasSwitch: true, defaultChecked: true },
        { label: '桌面通知', description: '显示桌面弹窗', hasSwitch: true, defaultChecked: false },
      ],
    },
    {
      title: '隐私',
      icon: Shield,
      items: [
        { label: '在线状态', description: '允许他人看到我的在线状态', hasSwitch: true, defaultChecked: true },
        { label: '已读回执', description: '让他人知道我已读消息', hasSwitch: true, defaultChecked: true },
        { label: '黑名单', description: '管理被屏蔽的用户', hasArrow: true },
      ],
    },
    {
      title: '外观',
      icon: Palette,
      items: [
        { label: '主题', description: '浅色 / 深色 / 跟随系统', hasArrow: true },
        { label: '字体大小', description: '调整聊天字体大小', hasArrow: true },
      ],
    },
    {
      title: '语言',
      icon: Globe,
      items: [
        { label: '应用语言', description: '简体中文', hasArrow: true },
      ],
    },
  ]

  return (
    <div className="h-full flex flex-col bg-card overflow-y-auto mochat-scrollbar">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-card-foreground">设置</h1>
      </div>

      {/* Profile Card */}
      <div className="p-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium">
              张
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-medium">张明</h2>
            <p className="text-sm text-muted-foreground">ID: mochat_001</p>
          </div>
          <Button variant="outline" size="sm">
            编辑资料
          </Button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-4 pb-8">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">{section.title}</h3>
            </div>
            <div className="rounded-xl bg-muted/30 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  {itemIndex > 0 && <Separator className="bg-border/50" />}
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    {item.hasSwitch && (
                      <Switch defaultChecked={item.defaultChecked} />
                    )}
                    {item.hasArrow && (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* About Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">关于</h3>
          </div>
          <div className="rounded-xl bg-muted/30 p-4 text-center">
            <p className="text-2xl font-semibold text-primary mb-1">MoChat</p>
            <p className="text-sm text-muted-foreground">版本 1.0.0</p>
            <p className="text-xs text-muted-foreground mt-2">© 2024 MoChat. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
