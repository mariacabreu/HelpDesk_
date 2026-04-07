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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import { formatDateShort, formatDate } from "@/lib/utils"

const prioridadeConfig: Record<string, { label: string; cor: string }> = {
  baixa: { label: "Baixa", cor: "bg-green-100 text-green-800 border-green-200" },
  media: { label: "Média", cor: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  alta: { label: "Alta", cor: "bg-red-100 text-red-800 border-red-200" },
  critica: { label: "Crítica", cor: "bg-red-200 text-red-900 border-red-300" },
}

const statusConfig: Record<string, { label: string; cor: string }> = {
  aberto: { label: "Aberto", cor: "bg-blue-100 text-blue-800" },
  em_atendimento: { label: "Em Atendimento", cor: "bg-purple-100 text-purple-800" },
  escalado: { label: "Escalonado", cor: "bg-orange-100 text-orange-800" },
  resolvido: { label: "Resolvido", cor: "bg-green-100 text-green-800" },
  fechado: { label: "Fechado", cor: "bg-gray-100 text-gray-800" },
  cancelado: { label: "Cancelado", cor: "bg-red-100 text-red-800" },
}

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Portal da Empresa</h1>
          <p className="text-muted-foreground">
            {empresa?.nome_fantasia || "Tech Solutions Ltda"} - Gestão de Atendimento
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
          <Calendar className="size-4 text-[#3ba5d8]" />
          <span className="text-sm font-medium text-[#1a3a5c]">
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
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
            <CardTitle className="text-[#1a3a5c]">Chamados Recentes</CardTitle>
            <CardDescription>Últimas solicitações abertas pela sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1a3a5c]/5">
                    <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">ID</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Chamado</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Solicitante</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Prioridade</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Status</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Data</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c] text-right border border-[#1a3a5c]/10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-[#3ba5d8]/5">
                      <TableCell className="font-medium text-[#1a3a5c] border border-[#1a3a5c]/10">
                        CH-{ticket.id.toString().padStart(3, '0')}
                      </TableCell>
                      <TableCell className="font-medium border border-[#1a3a5c]/10">
                        {ticket.titulo}
                      </TableCell>
                      <TableCell className="border border-[#1a3a5c]/10">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{ticket.nome_solicitante || ticket.solicitante_nome || "N/A"}</span>
                            {ticket.solicitante_nivel && (
                              <Badge variant="outline" className="h-4 px-1 text-[10px] border-[#3ba5d8]/30 text-[#3ba5d8] font-semibold uppercase">
                                {ticket.solicitante_nivel}
                              </Badge>
                            )}
                          </div>
                          {ticket.email_solicitante && <span className="text-[10px] text-muted-foreground">{ticket.email_solicitante}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="border border-[#1a3a5c]/10">
                        <Badge variant="outline" className={prioridadeConfig[String(ticket.prioridade).toLowerCase()]?.cor || "bg-orange-100 text-orange-700 border-orange-200"}>
                          {prioridadeConfig[String(ticket.prioridade).toLowerCase()]?.label || ticket.prioridade}
                        </Badge>
                      </TableCell>
                      <TableCell className="border border-[#1a3a5c]/10">
                        <Badge className={statusConfig[String(ticket.status).toLowerCase()]?.cor || "bg-yellow-100 text-yellow-700 border-yellow-200"}>
                          {statusConfig[String(ticket.status).toLowerCase()]?.label || (ticket.status ? (ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')) : "Aberto")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm border border-[#1a3a5c]/10">
                        {formatDate(ticket.data_abertura)}
                      </TableCell>
                      <TableCell className="text-right border border-[#1a3a5c]/10">
                        <Button variant="ghost" size="sm" className="text-[#3ba5d8] hover:text-[#3ba5d8] hover:bg-[#3ba5d8]/10">
                          <Eye className="size-4 mr-2" />
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#1a3a5c]">Equipamentos</CardTitle>
            <CardDescription>Resumo de infraestrutura</CardDescription>
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

