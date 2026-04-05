"use client"

import { useEffect, useState } from "react"
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Users,
  Building2,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateShort } from "@/lib/utils"

export function DashboardEmpresaPage() {
  const [userData, setUserData] = useState<any>(null)
  const [dynamicStats, setDynamicStats] = useState<any>(null)
  const [recentTickets, setRecentTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      
      const empresaId = user.empresa?.id
      if (empresaId) {
        // Buscar estatísticas
        fetch(`/api/stats/empresa/${empresaId}`)
          .then(res => res.json())
          .then(data => setDynamicStats(data))
          .catch(err => console.error("Erro ao buscar estatísticas:", err))
          
        // Buscar chamados recentes
        fetch(`/api/chamados/empresa/${empresaId}`)
          .then(res => res.json())
          .then(data => {
            // Ordenar por data de abertura (mais recente primeiro) e pegar os 5 primeiros
            const sorted = data.sort((a: any, b: any) => 
              new Date(b.data_abertura).getTime() - new Date(a.data_abertura).getTime()
            ).slice(0, 5)
            setRecentTickets(sorted)
          })
          .catch(err => console.error("Erro ao buscar chamados recentes:", err))
          .finally(() => setLoading(false))
      }
    }
  }, [])

  const empresa = userData?.empresa

  const displayStats = [
    {
      title: "Chamados Ativos",
      value: dynamicStats?.chamados_ativos?.toString() || "0",
      description: "Sendo atendidos agora",
      icon: ClipboardList,
      color: "text-[#7ac142]",
      bgColor: "bg-[#7ac142]/10",
    },
    {
      title: "Equipamentos",
      value: dynamicStats?.total_equipamentos?.toString() || "0",
      description: "Total em inventário",
      icon: Monitor,
      color: "text-[#3ba5d8]",
      bgColor: "bg-[#3ba5d8]/10",
    },
    {
      title: "Funcionários",
      value: dynamicStats?.total_funcionarios?.toString() || "0",
      description: "Usuários cadastrados",
      icon: Users,
      color: "text-[#1a3a5c]",
      bgColor: "bg-[#1a3a5c]/10",
    },
    {
      title: "Chamados no Mês",
      value: dynamicStats?.total_chamados?.toString() || "0",
      description: "Total de solicitações",
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Bem-vindo, {empresa?.nome_fantasia || "Tech Solutions"}</h1>
        <p className="text-muted-foreground">Visão geral da sua infraestrutura de TI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-[#1a3a5c] mt-1">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#1a3a5c]">Resumo de Chamados</CardTitle>
            <CardDescription>Seus últimos tickets registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-4 text-muted-foreground">Carregando chamados...</p>
              ) : recentTickets.length > 0 ? (
                recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-[#3ba5d8]">CH-{ticket.id.toString().padStart(3, '0')}</span>
                      <span className="font-medium text-[#1a3a5c]">{ticket.titulo}</span>
                      <span className="text-xs text-muted-foreground">Aberto em {formatDateShort(ticket.data_abertura)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={ticket.status === "resolvido" || ticket.status === "fechado" ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">Nenhum chamado encontrado.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#1a3a5c]">Informações da Empresa</CardTitle>
            <CardDescription>Dados cadastrais ativos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border">
                <Building2 className="size-8 text-[#7ac142]" />
                <div>
                    <p className="font-bold text-[#1a3a5c]">{empresa?.razao_social || "Tech Solutions Ltda"}</p>
                    <p className="text-xs text-muted-foreground">CNPJ: {empresa?.cnpj || "12.345.678/0001-90"}</p>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Segmento</span>
                    <span className="font-bold text-[#1a3a5c]">{empresa?.segmento || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cidade/UF</span>
                    <span className="font-bold text-[#1a3a5c]">{empresa ? `${empresa.cidade}/${empresa.estado}` : "São Paulo/SP"}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SLA Médio de Atendimento</span>
                    <span className="font-bold text-[#1a3a5c]">4.2 horas</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nível de Satisfação (CSAT)</span>
                    <span className="font-bold text-[#7ac142]">4.8 / 5.0</span>
                </div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2 items-center text-yellow-800 mb-1">
                    <AlertTriangle className="size-4" />
                    <span className="text-xs font-bold uppercase">Manutenção Pendente</span>
                </div>
                <p className="text-xs text-yellow-800">
                    O backup mensal agendado para hoje não foi detectado. Por favor, verifique os logs.
                </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

