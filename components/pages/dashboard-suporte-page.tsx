"use client"

import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  User,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const stats = [
  {
    title: "Chamados Abertos",
    value: "12",
    description: "Aguardando atendimento",
    icon: ClipboardList,
    color: "text-[#3ba5d8]",
    bgColor: "bg-[#3ba5d8]/10",
  },
  {
    title: "Em Andamento",
    value: "5",
    description: "Sendo atendidos",
    icon: Clock,
    color: "text-[#f59e0b]",
    bgColor: "bg-[#f59e0b]/10",
  },
  {
    title: "Resolvidos Hoje",
    value: "8",
    description: "Finalizados com sucesso",
    icon: CheckCircle2,
    color: "text-[#7ac142]",
    bgColor: "bg-[#7ac142]/10",
  },
  {
    title: "SLA Crítico",
    value: "2",
    description: "Atenção necessária",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
]

const recentTickets = [
  {
    id: "#1234",
    title: "Problema com impressora",
    company: "Tech Solutions",
    priority: "Alta",
    status: "Aberto",
    sla: "2h restantes",
  },
  {
    id: "#1233",
    title: "Instalação de software",
    company: "Gourmet Garden",
    priority: "Média",
    status: "Em andamento",
    sla: "4h restantes",
  },
  {
    id: "#1232",
    title: "Acesso ao sistema",
    company: "Mega Store",
    priority: "Baixa",
    status: "Aberto",
    sla: "8h restantes",
  },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Alta": return "bg-red-100 text-red-700 border-red-200"
    case "Média": return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "Baixa": return "bg-green-100 text-green-700 border-green-200"
    default: return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export function DashboardSuportePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Dashboard de Suporte</h1>
        <p className="text-muted-foreground">Visão geral operacional da equipe de TI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[#3ba5d8]">{ticket.id}</span>
                    <span className="font-medium text-[#1a3a5c]">{ticket.title}</span>
                    <span className="text-xs text-muted-foreground">{ticket.company}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <div className="text-right">
                        <p className="text-xs font-medium text-muted-foreground">SLA</p>
                        <p className="text-xs text-red-500 font-bold">{ticket.sla}</p>
                    </div>
                  </div>
                </div>
              ))}
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
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Média Mensal</p>
                        <p className="text-lg font-bold text-[#1a3a5c]">145 Chamados</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
