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

  useEffect(() => {
    fetch("/api/stats/suporte")
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
    {
      title: "SLA Crítico",
      value: "0",
      description: "Atenção necessária",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Dashboard de Suporte</h1>
        <p className="text-muted-foreground">Visão geral operacional da equipe de TI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#1a3a5c]">Chamados Recentes</CardTitle>
            <CardDescription>Últimas solicitações recebidas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1a3a5c]/5">
                      <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">ID</TableHead>
                      <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Chamado</TableHead>
                      <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Cliente</TableHead>
                      <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Prioridade</TableHead>
                      <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Status</TableHead>
                      <TableHead className="font-semibold text-[#1a3a5c] border border-[#1a3a5c]/10">Data</TableHead>
                      <TableHead className="font-semibold text-[#1a3a5c] text-right border border-[#1a3a5c]/10">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(stats?.recentes || []).map((ticket: any) => (
                      <TableRow key={ticket.id} className="hover:bg-[#3ba5d8]/5">
                        <TableCell className="font-medium text-[#1a3a5c] border border-[#1a3a5c]/10">
                          CH-{ticket.id.toString().padStart(3, '0')}
                        </TableCell>
                        <TableCell className="font-medium border border-[#1a3a5c]/10">
                          {ticket.titulo}
                        </TableCell>
                        <TableCell className="border border-[#1a3a5c]/10">
                          {ticket.empresa || "N/A"}
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
                          {new Date(ticket.data_abertura || Date.now()).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right border border-[#1a3a5c]/10">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="size-9"
                          >
                            <Eye className="size-4 text-[#3ba5d8]" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
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
                <span className="text-muted-foreground">Resolução no N1</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SLA Cumprido</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="bg-gray-100" />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="size-5 text-blue-600" />
                    <div>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Resolvidos</p>
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
