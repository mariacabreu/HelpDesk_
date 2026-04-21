"use client"

import { useState, useEffect } from "react"
import { Bell, User, LogOut, Settings, HelpCircle, Mail, Phone, Building, Shield, BellRing, Palette, Globe, Lock, Moon, Sun, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { safeJson } from "@/lib/utils"

interface DashboardHeaderProps {
  userId?: number
  userName?: string
  userEmail?: string
  userCargo?: string
  userNivel?: string
  userLogin?: string
  userSetor?: string
  userRole?: "suporte" | "empresa"
  empresaData?: {
    razao_social?: string
    nome_fantasia?: string
    cnpj?: string
    email?: string
    telefone?: string
    cep?: string
    endereco?: string
    cidade?: string
    estado?: string
  }
}

export function DashboardHeader({
  userId,
  userName = "João Silva",
  userEmail = "joao.silva@empresa.com",
  userCargo = "Suporte N1",
  userNivel,
  userLogin,
  userSetor,
  userRole = "suporte",
  empresaData,
}: DashboardHeaderProps) {
  const { setTheme, theme } = useTheme()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationCount, setNotificationCount] = useState(0)

  const fetchNotifications = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/notificacoes/${userId}`)
      if (res.ok) {
        const data = await safeJson<any[]>(res)
        if (data) {
          setNotifications(data)
          setNotificationCount(data.length)
        }
      }
    } catch (err) {
      console.error("Erro ao buscar notificações:", err)
    }
  }

  const handleClearNotifications = async () => {
    if (!userId || notificationCount === 0) return
    try {
      const res = await fetch(`/api/notificacoes/ler-todas/${userId}`, {
        method: "PATCH"
      })
      if (res.ok) {
        setNotificationCount(0)
        // Não limpamos o array de notificações imediatamente para que o usuário 
        // possa vê-las no menu que acabou de abrir.
      }
    } catch (err) {
      console.error("Erro ao limpar notificações:", err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [userId])

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-foreground hover:bg-accent" />
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            {userRole === "suporte" ? "Painel de Suporte" : "Portal da Empresa"}
          </h1>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notificações */}
          <DropdownMenu onOpenChange={(open) => open && handleClearNotifications()}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-foreground hover:bg-accent"
              >
                <Bell className="size-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 bg-[#7ac142] text-white text-xs">
                    {notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 cursor-default p-4">
                    <span className="font-medium text-sm leading-tight">{notif.mensagem}</span>
                    <span className="text-xs text-muted-foreground">{new Date(notif.data).toLocaleString()}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Sem novas notificações.
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Perfil */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-accent px-2"
              >
                <Avatar className="size-8">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                  {userNivel && (
                    <Badge variant="outline" className="h-4 px-1 text-[10px] border-primary/30 text-primary font-semibold uppercase">
                      {userNivel}
                    </Badge>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span>{userName}</span>
                <span className="text-xs font-normal text-muted-foreground">{userEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => setShowProfileModal(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setShowSettingsModal(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setShowHelpModal(true)}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Modal Meu Perfil */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a3a5c] flex items-center gap-2">
              {userRole === "empresa" ? (empresaData?.nome_fantasia || userName) : userName}
              {userNivel && (
                <Badge className="bg-[#3ba5d8] text-white border-none px-3 py-1 text-xs font-bold uppercase">
                  {userNivel}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {userRole === "empresa" ? "Informações de acesso e dados da empresa." : "Informações de acesso e perfil do colaborador."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <Avatar className="h-24 w-24 border-4 border-[#3ba5d8]/20">
              <AvatarFallback className="bg-[#3ba5d8] text-white text-3xl font-bold">
                {(userRole === "empresa" ? (empresaData?.nome_fantasia || userName) : userName).split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="grid w-full gap-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                {userRole === "empresa" ? (
                  <>
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Razão Social</span>
                      <span className="text-sm font-medium text-[#1a3a5c]">{empresaData?.razao_social || userName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CNPJ</span>
                      <span className="text-sm font-medium text-[#1a3a5c]">{empresaData?.cnpj || "N/A"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Telefone</span>
                      <span className="text-sm font-medium text-[#1a3a5c]">{empresaData?.telefone || "N/A"}</span>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Endereço</span>
                      <span className="text-sm font-medium text-[#1a3a5c]">
                        {empresaData?.endereco ? `${empresaData.endereco}, ${empresaData.cidade} - ${empresaData.estado}` : "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CEP</span>
                      <span className="text-sm font-medium text-[#1a3a5c]">{empresaData?.cep || "N/A"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nome Completo</span>
                      <span className="text-sm font-medium text-[#1a3a5c]">{userName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nível de Suporte</span>
                      <span className="text-sm font-medium text-[#1a3a5c] uppercase">{userNivel || "N1"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Departamento / Setor</span>
                      <span className="text-sm font-medium text-[#1a3a5c] uppercase">{userSetor || "N/A"}</span>
                    </div>
                  </>
                )}
                
                <div className="col-span-2 flex flex-col gap-2 pt-4 border-t border-gray-100 mt-2">
                  <p className="text-[10px] font-bold text-[#1a3a5c] flex items-center gap-2 uppercase tracking-wider">
                    <Lock className="size-3" />
                    Credenciais de Acesso
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="bg-blue-600/10 p-2 rounded-lg">
                      <User className="size-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-tight">Login / Acesso</p>
                      <p className="text-lg font-mono font-black text-blue-700 tracking-wider">
                      {userLogin || (typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem("user") || "{}").login || "N/A") : "N/A")}
                    </p>
                    </div>
                    <div className="bg-white/50 p-1.5 rounded-md border border-blue-100">
                      <Shield className="size-3 text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Configurações */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a3a5c]">Configurações</DialogTitle>
            <DialogDescription>Personalize sua experiência no SwiftDesk.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            </TabsList>
            <TabsContent value="geral" className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[#3ba5d8]" />
                    <Label className="font-bold">Tema Escuro</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Alternar visual da interface</p>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#3ba5d8]" />
                    <Label className="font-bold">Idioma</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Português (Brasil)</p>
                </div>
                <Button variant="ghost" size="sm">Alterar</Button>
              </div>
            </TabsContent>
            <TabsContent value="notificacoes" className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-[#7ac142]" />
                    <Label className="font-bold">Alertas por E-mail</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Receber atualizações de chamados</p>
                </div>
                <Switch defaultChecked />
              </div>
            </TabsContent>
            <TabsContent value="seguranca" className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-red-500" />
                    <Label className="font-bold">Autenticação em Duas Etapas</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Aumentar a segurança da conta</p>
                </div>
                <Button size="sm" variant="outline">Configurar</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal Ajuda */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a3a5c]">Central de Ajuda</DialogTitle>
            <DialogDescription>Precisa de suporte com o SwiftDesk?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Shield className="h-6 w-6 text-[#3ba5d8]" />
              </div>
              <div>
                <h4 className="font-bold text-[#1a3a5c]">Base de Conhecimento</h4>
                <p className="text-sm text-muted-foreground">Consulte tutoriais e manuais de uso.</p>
                <Button variant="link" className="p-0 h-auto text-[#3ba5d8]">Acessar Documentação</Button>
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <HelpCircle className="h-6 w-6 text-[#7ac142]" />
              </div>
              <div>
                <h4 className="font-bold text-[#1a3a5c]">Suporte Técnico Swift</h4>
                <p className="text-sm text-muted-foreground">Fale diretamente com nossa equipe.</p>
                <p className="text-xs font-medium mt-1">suporte@swiftdesk.com.br</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
