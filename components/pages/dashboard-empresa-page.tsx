"use client"

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

const stats = [
  {
    title: "Chamados Ativos",
    value: "4",
    description: "Sendo atendidos agora",
    icon: ClipboardList,
    color: "text-[#7ac142]",
    bgColor: "bg-[#7ac142]/10",
  },
  {
    title: "Equipamentos",
    value: "25",
    description: "Total em inventário",
    icon: Monitor,
    color: "text-[#3ba5d8]",
    bgColor: "bg-[#3ba5d8]/10",
  },
  {
    title: "Funcionários",
    value: "18",
    description: "Usuários cadastrados",
    icon: Users,
    color: "text-[#1a3a5c]",
    bgColor: "bg-[#1a3a5c]/10",
  },
  {
    title: "Chamados no Mês",
    value: "12",
    description: "Total de solicitações",
    icon: Calendar,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

const recentTickets = [
  {
    id: "#1234",
    title: "Problema com impressora",
    priority: "Alta",
    status: "Aberto",
    date: "13/03/2026",
  },
  {
    id: "#1228",
    title: "Solicitação de Acesso VPN",
    priority: "Média",
    status: "Resolvido",
    date: "12/03/2026",
  },
]

export function DashboardEmpresaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Bem-vindo, Tech Solutions</h1>
        <p className="text-muted-foreground">Visão geral da sua infraestrutura de TI</p>
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
            <CardTitle className="text-[#1a3a5c]">Resumo de Chamados</CardTitle>
            <CardDescription>Seus últimos tickets registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[#3ba5d8]">{ticket.id}</span>
                    <span className="font-medium text-[#1a3a5c]">{ticket.title}</span>
                    <span className="text-xs text-muted-foreground">Aberto em {ticket.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={ticket.status === "Resolvido" ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
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
                    <p className="font-bold text-[#1a3a5c]">Tech Solutions Ltda</p>
                    <p className="text-xs text-muted-foreground">CNPJ: 12.345.678/0001-90</p>
                </div>
            </div>
            <div className="space-y-3">
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
