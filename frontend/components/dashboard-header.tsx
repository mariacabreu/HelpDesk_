"use client"

import { useState } from "react"
import { Bell, User, LogOut, Settings, HelpCircle, Mail, Phone, Building, Shield, BellRing, Palette, Globe, Lock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

interface DashboardHeaderProps {
  userName?: string
  userEmail?: string
  userCargo?: string
  notificationCount?: number
  userRole?: "suporte" | "empresa"
  onRoleChange?: (role: "suporte" | "empresa") => void
}

export function DashboardHeader({
  userName = "João Silva",
  userEmail = "joao.silva@empresa.com",
  userCargo = "Suporte N1",
  notificationCount = 3,
  userRole = "suporte",
  onRoleChange,
}: DashboardHeaderProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[#1a3a5c]/10 bg-white px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-[#1a3a5c] hover:bg-[#3ba5d8]/10" />
          <h1 className="text-lg font-semibold text-[#1a3a5c] hidden sm:block">
            {userRole === "suporte" ? "Painel de Suporte" : "Portal da Empresa"}
          </h1>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notificações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[#1a3a5c] hover:bg-[#3ba5d8]/10"
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
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <span className="font-medium text-sm">Novo chamado atribuído</span>
                <span className="text-xs text-muted-foreground">Chamado #1234 - Problema com impressora</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <span className="font-medium text-sm">Chamado escalonado</span>
                <span className="text-xs text-muted-foreground">Chamado #1220 foi escalonado para N2</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <span className="font-medium text-sm">SLA próximo do vencimento</span>
                <span className="text-xs text-muted-foreground">Chamado #1210 vence em 2 horas</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-[#3ba5d8] cursor-pointer">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Perfil */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-[#3ba5d8]/10 px-2"
              >
                <Avatar className="size-8">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-[#3ba5d8] text-white text-sm">
                    {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium text-[#1a3a5c]">{userName}</span>
                  <span className="text-xs text-[#1a3a5c]/60">{userCargo}</span>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a3a5c]">
              {userRole === "empresa" ? "Perfil da Empresa" : "Meu Perfil"}
            </DialogTitle>
            <DialogDescription>
              {userRole === "empresa" ? "Informações cadastrais da empresa." : "Visualize e edite suas informações pessoais."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <Avatar className="h-24 w-24 border-4 border-[#3ba5d8]/20">
              <AvatarFallback className="bg-[#3ba5d8] text-white text-3xl">
                {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="grid w-full gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {userRole === "empresa" ? "Empresa" : "Nome"}
                </Label>
                <Input id="name" value={userName} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" value={userEmail} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right flex items-center justify-end gap-1">
                  <Phone className="h-3 w-3" /> Telefone
                </Label>
                <Input value="(11) 98765-4321" className="col-span-3" readOnly />
              </div>
              {userRole === "suporte" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right flex items-center justify-end gap-1">
                    <Building className="h-3 w-3" /> Empresa
                  </Label>
                  <Input value="Tech Solutions Ltda" className="col-span-3" readOnly />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowProfileModal(false)}>Fechar</Button>
            <Button className="bg-[#1a3a5c]">Editar Dados</Button>
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
                <Switch />
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
