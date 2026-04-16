"use client"

import { useEffect, useState } from "react"
import {
  ClipboardList,
  CheckCircle2,
  Monitor,
  Users,
  Calendar,
  Eye,
  Paperclip,
  History,
  Download,
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
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import { formatDateShort, formatDate } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [equipamentosById, setEquipamentosById] = useState<Record<string, { nome: string; patrimonio?: string }>>({})

  const onViewTicket = (ticket: any) => {
    setChamadoSelecionado(ticket)
    setModalAberto(true)
  }

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

        // Buscar equipamentos para o mapa de nomes
        fetch(`/api/equipamentos/${empresaId}`)
          .then(res => res.json())
          .then((data) => {
            const map: Record<string, { nome: string; patrimonio?: string }> = {}
            ;(data || []).forEach((e: any) => {
              if (e?.id != null) map[String(e.id)] = { nome: e.nome, patrimonio: e.patrimonio }
            })
            setEquipamentosById(map)
          })
          .catch(() => setEquipamentosById({}))
      }
    }
  }, [])

  const empresa = userData?.empresa

  const [backupStats, setBackupStats] = useState({ total: 0, ultimo_data: null })

  useEffect(() => {
    if (userData?.empresa?.id) {
      // Buscar estatísticas de backup do sistema completo
      fetch(`/api/empresas/${userData.empresa.id}/system-backup-stats`)
        .then(res => res.json())
        .then(data => setBackupStats(data))
        .catch(err => console.error("Erro ao buscar stats de backup:", err))
    }
  }, [userData])

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
      title: "Backups Realizados",
      value: backupStats.total.toString(),
      description: "Cópias de segurança",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Último Backup",
      value: backupStats.ultimo_data ? formatDateShort(backupStats.ultimo_data) : "Nenhum",
      description: "Data da última execução",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Portal da Empresa</h1>
          <p className="text-muted-foreground">
            {empresa?.nome_fantasia || "Tech Solutions Ltda"} - Gestão de chamados
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

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b py-4 px-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#7ac142]/10 p-2 rounded-lg">
                <ClipboardList className="size-5 text-[#7ac142]" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-[#1a3a5c]">Chamados Recentes</CardTitle>
                <CardDescription className="text-xs">Últimas solicitações da empresa</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a3a5c] hover:bg-[#1a3a5c] border-b-0">
                  <TableHead className="text-center text-white font-semibold py-4">Chamado</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Solicitante</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Prioridade</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Status</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Data</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50/80 transition-colors group">
                    <TableCell className="py-4">
                      <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate block">
                        {ticket.titulo}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
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
                    <TableCell className="py-4">
                      <Badge variant="outline" className={`${prioridadeConfig[String(ticket.prioridade).toLowerCase()]?.cor || "bg-orange-100 text-orange-700 border-orange-200"} rounded-full px-3`}>
                        {prioridadeConfig[String(ticket.prioridade).toLowerCase()]?.label || ticket.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={`${statusConfig[String(ticket.status).toLowerCase()]?.cor || "bg-yellow-100 text-yellow-700 border-yellow-200"} shadow-none border-none rounded-full px-3`}>
                        {statusConfig[String(ticket.status).toLowerCase()]?.label || (ticket.status ? (ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')) : "Aberto")}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#1a3a5c] tracking-tight">{formatDate(ticket.data_abertura).split(' ')[0]}</span>
                        <span className="text-[10px] font-bold text-muted-foreground/70">{formatDate(ticket.data_abertura).split(' ')[1]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-left">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[#3ba5d8] hover:text-[#3ba5d8] hover:bg-[#3ba5d8]/10 h-8 w-8 p-0"
                        onClick={() => onViewTicket(ticket)}
                        title="Ver Detalhes"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal Detalhes */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">
              {chamadoSelecionado?.id} - {chamadoSelecionado?.titulo}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos do chamado
            </DialogDescription>
          </DialogHeader>
          
          {chamadoSelecionado && (
            <Tabs defaultValue="detalhes">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="anexos">Anexos ({chamadoSelecionado?.anexos?.length ?? 0})</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="detalhes" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <Badge variant="outline">
                      {chamadoSelecionado.tipo === "incidente" ? "Incidente" : "Solicitação"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Prioridade</p>
                    <Badge className={prioridadeConfig[String(chamadoSelecionado.prioridade).toLowerCase() as keyof typeof prioridadeConfig]?.cor}>
                      {prioridadeConfig[String(chamadoSelecionado.prioridade).toLowerCase() as keyof typeof prioridadeConfig]?.label || chamadoSelecionado.prioridade}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={statusConfig[String(chamadoSelecionado.status).toLowerCase() as keyof typeof statusConfig]?.cor}>
                      {statusConfig[String(chamadoSelecionado.status).toLowerCase() as keyof typeof statusConfig]?.label || chamadoSelecionado.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Data de Abertura</p>
                    <p className="text-sm font-medium">{formatDate(chamadoSelecionado.data_abertura ?? chamadoSelecionado.dataAbertura)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Equipamento</p>
                  <p className="text-sm font-medium">
                    {(() => {
                      const id = chamadoSelecionado.equipamento_id ?? chamadoSelecionado.equipamentoId ?? null
                      if (!id) return "Não informado"
                      const eq = equipamentosById[String(id)]
                      if (eq) return `${eq.nome}${eq.patrimonio ? ` (${eq.patrimonio})` : ""}`
                      return `ID ${id}`
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Solicitante</p>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{chamadoSelecionado.nome_solicitante || chamadoSelecionado.solicitante_nome || "N/A"}</p>
                    {chamadoSelecionado.email_solicitante && (
                      <p className="text-xs text-muted-foreground">{chamadoSelecionado.email_solicitante}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Responsável</p>
                  <p className="text-sm font-medium text-[#3ba5d8]">
                    {chamadoSelecionado.atribuido_a_nome || "Aguardando Atribuição"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{chamadoSelecionado.descricao}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="anexos" className="mt-4">
                {(chamadoSelecionado?.anexos?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    {(chamadoSelecionado?.anexos ?? []).map((anexo: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Paperclip className="size-4 text-[#3ba5d8]" />
                        <span className="text-sm">{anexo}</span>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          Baixar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum anexo neste chamado
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="historico" className="mt-4">
                <div className="space-y-3">
                  {(chamadoSelecionado?.historico ?? []).map((item: any, index: number) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="size-8 rounded-full bg-[#3ba5d8]/20 flex items-center justify-center">
                          <History className="size-4 text-[#3ba5d8]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.acao}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.data)} - {item.usuario}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

