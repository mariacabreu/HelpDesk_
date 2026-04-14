"use client"

import { useState, useEffect } from "react"
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils"

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

export function DashboardSuportePage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    let tecnicoId = ""
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      tecnicoId = user.id
    }

    fetch(`/api/stats/suporte?tecnico_id=${tecnicoId}`)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-[#3ba5d8]" />
      </div>
    )
  }

  const statCards = [
    {
      title: "Chamados Abertos",
      value: stats?.abertos || 0,
      description: "Aguardando atendimento",
      icon: ClipboardList,
      color: "text-[#3ba5d8]",
      bgColor: "bg-[#3ba5d8]/10",
    },
    {
      title: "Em Andamento",
      value: stats?.em_andamento || 0,
      description: "Sendo atendidos",
      icon: Clock,
      color: "text-[#f59e0b]",
      bgColor: "bg-[#f59e0b]/10",
    },
    {
      title: "Resolvidos",
      value: stats?.resolvidos || 0,
      description: "Finalizados com sucesso",
      icon: CheckCircle2,
      color: "text-[#7ac142]",
      bgColor: "bg-[#7ac142]/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Dashboard de Suporte</h1>
        <p className="text-muted-foreground">
          {userData?.empresa?.nome_fantasia || "SwiftDesk"} - Gestão de chamados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => (
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
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-[#1a3a5c]/5 border-b pt-10 pb-8">
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <div className="bg-[#3ba5d8]/10 p-2.5 rounded-full">
                <TrendingUp className="size-5 text-[#3ba5d8]" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-[#1a3a5c]">Chamados Recentes</CardTitle>
                <CardDescription className="text-xs">Últimas solicitações recebidas para atendimento</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a3a5c] hover:bg-[#1a3a5c]">
                  <TableHead className="text-center text-white font-semibold py-4">ID</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Solicitante</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Chamado</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Prioridade</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Status</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(stats?.recentes || []).map((ticket: any) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50/80 transition-colors group">
                    <TableCell className="text-center py-4">
                      <span className="text-xs font-bold text-[#3ba5d8] bg-[#3ba5d8]/5 px-2 py-1 rounded-md">
                        CH-{ticket.id.toString().padStart(3, '0')}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#1a3a5c]">{ticket.nome_solicitante || ticket.solicitante_nome || "N/A"}</span>
                          {ticket.solicitante_nivel && (
                            <Badge variant="outline" className="h-4 px-1 text-[9px] border-[#3ba5d8]/30 text-[#3ba5d8] font-extrabold uppercase bg-white">
                              {ticket.solicitante_nivel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-sm font-medium text-gray-700 max-w-[200px] truncate block mx-auto">
                        {ticket.titulo}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge variant="outline" className={`${prioridadeConfig[String(ticket.prioridade).toLowerCase()]?.cor || "bg-orange-100 text-orange-700 border-orange-200"} mx-auto rounded-full px-3`}>
                        {prioridadeConfig[String(ticket.prioridade).toLowerCase()]?.label || ticket.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge className={`${statusConfig[String(ticket.status).toLowerCase()]?.cor || "bg-yellow-100 text-yellow-700 border-yellow-200"} mx-auto shadow-none border-none rounded-full px-3`}>
                        {statusConfig[String(ticket.status).toLowerCase()]?.label || (ticket.status ? (ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')) : "Aberto")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-semibold text-gray-600">{formatDate(ticket.data_abertura).split(' ')[0]}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(ticket.data_abertura).split(' ')[1]}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#1a3a5c]">Performance da Equipe</CardTitle>
            <CardDescription>Resumo de produtividade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Casos Escalonados</span>
                <span className="font-medium">{stats?.perc_escalados || 0}%</span>
              </div>
              <Progress value={stats?.perc_escalados || 0} className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SLA Cumprido</span>
                <span className="font-medium">{stats?.perc_sla || 0}%</span>
              </div>
              <Progress value={stats?.perc_sla || 0} className="bg-gray-100" />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="size-5 text-blue-600" />
                    <div>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Concluídos</p>
                        <p className="text-lg font-bold text-[#1a3a5c]">{stats?.resolvidos || 0} Chamados</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
