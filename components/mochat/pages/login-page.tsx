"use client"

import { useState } from "react"
import { MessageCircle, User, Key, Eye, EyeOff, Shield, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

interface FormErrors {
  username?: string
  password?: string
  publicKey?: string
  confirmPublicKey?: string
}

// Mock API functions
const mockLoginApi = async (username: string, password: string): Promise<{ success: boolean; sessionId?: string; error?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (!username || !password) {
    return { success: false, error: "用户名和密码不能为空" }
  }
  
  // Simulate success for demo
  if (username === "demo" && password === "demo123") {
    return { success: true, sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
  }
  
  // For any other credentials, also succeed (demo purposes)
  return { success: true, sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
}

const mockRegisterApi = async (username: string, publicKey: string): Promise<{ success: boolean; sessionId?: string; error?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (!username) {
    return { success: false, error: "用户名不能为空" }
  }
  
  if (!publicKey) {
    return { success: false, error: "公钥不能为空" }
  }
  
  // Validate Base64 format
  const base64Regex = /^[A-Za-z0-9+/=]+$/
  if (!base64Regex.test(publicKey) || publicKey.length < 32) {
    return { success: false, error: "无效的 Base64 编码公钥格式" }
  }
  
  return { success: true, sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
}

export function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginErrors, setLoginErrors] = useState<FormErrors>({})
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState("")
  const [publicKey, setPublicKey] = useState("")
  const [confirmPublicKey, setConfirmPublicKey] = useState("")
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({})

  const validateLoginForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!loginUsername.trim()) {
      errors.username = "请输入用户名"
    }
    
    if (!loginPassword) {
      errors.password = "请输入密码"
    } else if (loginPassword.length < 6) {
      errors.password = "密码长度至少为 6 位"
    }
    
    setLoginErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateRegisterForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!registerUsername.trim()) {
      errors.username = "请输入用户名"
    } else if (registerUsername.length < 3) {
      errors.username = "用户名长度至少为 3 个字符"
    }
    
    if (!publicKey.trim()) {
      errors.publicKey = "请输入 X25519 身份公钥"
    } else {
      const base64Regex = /^[A-Za-z0-9+/=]+$/
      if (!base64Regex.test(publicKey)) {
        errors.publicKey = "公钥必须为有效的 Base64 编码"
      }
    }
    
    if (!confirmPublicKey.trim()) {
      errors.confirmPublicKey = "请确认公钥"
    } else if (publicKey !== confirmPublicKey) {
      errors.confirmPublicKey = "两次输入的公钥不一致"
    }
    
    setRegisterErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async () => {
    if (!validateLoginForm()) return
    
    setIsLoading(true)
    
    try {
      const result = await mockLoginApi(loginUsername, loginPassword)
      
      if (result.success && result.sessionId) {
        console.log("Login successful! Session ID:", result.sessionId)
        setLoginSuccess(true)
        toast({
          title: "登录成功",
          description: "欢迎回来！正在跳转...",
        })
        
        // Simulate redirect after success
        setTimeout(() => {
          // In a real app, this would redirect to the main app
          window.location.href = "/"
        }, 1500)
      } else {
        setLoginErrors({ username: result.error })
        toast({
          title: "登录失败",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch {
      setLoginErrors({ username: "网络错误，请稍后重试" })
      toast({
        title: "登录失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!validateRegisterForm()) return
    
    setIsLoading(true)
    
    try {
      const result = await mockRegisterApi(registerUsername, publicKey)
      
      if (result.success && result.sessionId) {
        console.log("Registration successful! Session ID:", result.sessionId)
        setLoginSuccess(true)
        toast({
          title: "注册成功",
          description: "账户创建成功！正在跳转...",
        })
        
        // Simulate redirect after success
        setTimeout(() => {
          window.location.href = "/"
        }, 1500)
      } else {
        setRegisterErrors({ username: result.error })
        toast({
          title: "注册失败",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch {
      setRegisterErrors({ username: "网络错误，请稍后重试" })
      toast({
        title: "注册失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-[400px] shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-pulse">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">登录成功</h2>
            <p className="text-muted-foreground text-sm">正在跳转到主页...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-[400px] shadow-xl border-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 shadow-lg">
            <MessageCircle className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">MoChat</CardTitle>
          <CardDescription className="text-muted-foreground">
            现代化即时通讯平台
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-sm font-medium">
                  用户名
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="请输入用户名"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value)
                      if (loginErrors.username) {
                        setLoginErrors({ ...loginErrors, username: undefined })
                      }
                    }}
                    className="pl-10 h-11"
                    aria-invalid={!!loginErrors.username}
                  />
                </div>
                {loginErrors.username && (
                  <p className="text-sm text-destructive">{loginErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium">
                  密码
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value)
                      if (loginErrors.password) {
                        setLoginErrors({ ...loginErrors, password: undefined })
                      }
                    }}
                    className="pl-10 pr-10 h-11"
                    aria-invalid={!!loginErrors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-sm text-destructive">{loginErrors.password}</p>
                )}
              </div>

              <Button
                className="w-full h-11 mt-6"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    登录中...
                  </span>
                ) : (
                  "登录"
                )}
              </Button>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-sm font-medium">
                  用户名
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="请输入用户名"
                    value={registerUsername}
                    onChange={(e) => {
                      setRegisterUsername(e.target.value)
                      if (registerErrors.username) {
                        setRegisterErrors({ ...registerErrors, username: undefined })
                      }
                    }}
                    className="pl-10 h-11"
                    aria-invalid={!!registerErrors.username}
                  />
                </div>
                {registerErrors.username && (
                  <p className="text-sm text-destructive">{registerErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="public-key" className="text-sm font-medium">
                  X25519 身份公钥 (Base64)
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="public-key"
                    type="text"
                    placeholder="请输入 Base64 编码的公钥"
                    value={publicKey}
                    onChange={(e) => {
                      setPublicKey(e.target.value)
                      if (registerErrors.publicKey) {
                        setRegisterErrors({ ...registerErrors, publicKey: undefined })
                      }
                    }}
                    className="pl-10 h-11 font-mono text-sm"
                    aria-invalid={!!registerErrors.publicKey}
                  />
                </div>
                {registerErrors.publicKey && (
                  <p className="text-sm text-destructive">{registerErrors.publicKey}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-public-key" className="text-sm font-medium">
                  确认公钥
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-public-key"
                    type="text"
                    placeholder="请再次输入公钥"
                    value={confirmPublicKey}
                    onChange={(e) => {
                      setConfirmPublicKey(e.target.value)
                      if (registerErrors.confirmPublicKey) {
                        setRegisterErrors({ ...registerErrors, confirmPublicKey: undefined })
                      }
                    }}
                    className="pl-10 h-11 font-mono text-sm"
                    aria-invalid={!!registerErrors.confirmPublicKey}
                  />
                </div>
                {registerErrors.confirmPublicKey && (
                  <p className="text-sm text-destructive">{registerErrors.confirmPublicKey}</p>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">关于 X25519 公钥</p>
                <p>X25519 是一种椭圆曲线密钥交换算法，用于端对端加密。请使用本地生成的密钥对，确保私钥安全存储。</p>
              </div>

              <Button
                className="w-full h-11 mt-2"
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    注册中...
                  </span>
                ) : (
                  "注册"
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
