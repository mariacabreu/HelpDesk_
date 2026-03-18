"use client"

import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    priority: "Alta",
    status: "Aberto",
    sla: "2h restantes",
  },
  {
    id: "#1233",
    title: "Instalação de software",
    priority: "Média",
    status: "Em andamento",
    sla: "4h restantes",
  },
  {
    id: "#1232",
    title: "Acesso ao sistema",
    priority: "Baixa",
    status: "Aberto",
    sla: "8h restantes",
  },
  {
    id: "#1231",
    title: "Configuração de e-mail",
    priority: "Média",
    status: "Em andamento",
    sla: "3h restantes",
  },
  {
    id: "#1230",
    title: "Troca de equipamento",
    priority: "Alta",
    status: "Escalonado",
    sla: "1h restante",
  },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Alta":
      return "bg-red-100 text-red-700 border-red-200"
    case "Média":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "Baixa":
      return "bg-green-100 text-green-700 border-green-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Aberto":
      return "bg-[#3ba5d8]/10 text-[#3ba5d8] border-[#3ba5d8]/20"
    case "Em andamento":
      return "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
    case "Escalonado":
      return "bg-purple-100 text-purple-700 border-purple-200"
    case "Resolvido":
      return "bg-[#7ac142]/10 text-[#7ac142] border-[#7ac142]/20"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export function DashboardContent() {
  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6 bg-[#f8fafc]">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-[#1a3a5c]/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#1a3a5c]/70">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1a3a5c]">{stat.value}</div>
              <p className="text-xs text-[#1a3a5c]/60 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chamados Recentes */}
      <Card className="border-[#1a3a5c]/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#1a3a5c]">Chamados Recentes</CardTitle>
              <CardDescription>Últimos chamados atribuídos a você</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-[#7ac142]">
              <TrendingUp className="size-4" />
              <span className="text-sm font-medium">+12% esta semana</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a3a5c]/10">
                  <th className="text-left py-3 px-2 text-sm font-medium text-[#1a3a5c]/70">ID</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-[#1a3a5c]/70">Título</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-[#1a3a5c]/70">Prioridade</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-[#1a3a5c]/70">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-[#1a3a5c]/70">SLA</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-[#1a3a5c]/5 hover:bg-[#3ba5d8]/5 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-2 text-sm font-mono text-[#3ba5d8]">{ticket.id}</td>
                    <td className="py-3 px-2 text-sm text-[#1a3a5c]">{ticket.title}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-[#1a3a5c]/60">{ticket.sla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
