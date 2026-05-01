"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, safeJson } from "@/lib/utils"
import { 
  Search, Filter, Shield, Download, Eye, User, FileText, 
  Clock, ArrowRight, Database, Settings, Lock, PlusCircle, Pencil, Trash2, Play, RefreshCw, RotateCcw, ShieldCheck,
  Info, CheckCircle, AlertTriangle, AlertCircle
} from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

const moduloIcons = {
  Chamados: FileText,
  Equipamentos: Database,
  Funcionários: User,
  Backup: Lock,
  Configurações: Settings,
}

const tipoConfig = {
  info: { label: "Info", cor: "bg-blue-100 text-blue-800", icon: Info },
  success: { label: "Sucesso", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  warning: { label: "Alerta", cor: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  error: { label: "Erro", cor: "bg-red-100 text-red-800", icon: AlertCircle },
}

const acaoConfig = {
  create: { label: "Criação", cor: "bg-green-100 text-green-800" },
  update: { label: "Atualização", cor: "bg-blue-100 text-blue-800" },
  delete: { label: "Exclusão", cor: "bg-red-100 text-red-800" },
  login: { label: "Login", cor: "bg-purple-100 text-purple-800" },
  logout: { label: "Logout", cor: "bg-gray-100 text-gray-800" },
  view: { label: "Visualização", cor: "bg-cyan-100 text-cyan-800" },
}

export function AuditoriaPage() {
  const [userData, setUserData] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")
  const [filtroAcao, setFiltroAcao] = useState("")
  const [registroSelecionado, setRegistroSelecionado] = useState<any | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      
      // Buscar logs reais se houver empresa
      if (user.empresa?.id) {
        fetch(`/api/logs?empresa_id=${user.empresa.id}`)
          .then(res => safeJson<any[]>(res))
          .then(data => setLogs(data || []))
          .catch(err => console.error("Erro ao buscar logs para auditoria:", err))
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }
  }, [])

  const registrosFiltrados = logs.filter(item => {
    if (filtroModulo && filtroModulo !== "todos" && item.modulo !== filtroModulo) return false
    if (filtroAcao && filtroAcao !== "todas" && item.acao !== filtroAcao) return false
    
    const termoBusca = busca.toLowerCase()
    if (termoBusca && 
        !item.acao.toLowerCase().includes(termoBusca) && 
        !(item.usuario_nome || "").toLowerCase().includes(termoBusca)) {
      return false
    }
    return true
  })

  const usuarios = [...new Set(logs.map(r => r.usuario_nome || "Sistema"))]

  const atualizarAuditoria = () => {
    if (userData?.empresa?.id) {
      setLoading(true)
      fetch(`/api/logs?empresa_id=${userData.empresa.id}`)
        .then(res => safeJson<any[]>(res))
        .then(data => setLogs(data || []))
        .finally(() => setLoading(false))
    }
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    const tableData = registrosFiltrados.map(item => [
      formatDate(item.timestamp),
      item.usuario,
      item.modulo,
      item.acao,
      item.descricao,
      item.ip
    ])

    doc.text("Relatório de Auditoria - SwiftDesk", 14, 15)
    doc.setFontSize(10)
    doc.text(`Gerado em: ${formatDate(new Date())}`, 14, 22)
    doc.text(`Total de registros: ${registrosFiltrados.length}`, 14, 28)

    autoTable(doc, {
      startY: 35,
      head: [["Data/Hora", "Usuário", "Módulo", "Ação", "Descrição", "IP"]],
      body: tableData,
      headStyles: { fontStyle: "bold", fillColor: [26, 58, 92] },
    })

    doc.save(`auditoria-helpdesk-${new Date().getTime()}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Auditoria</h1>
          <p className="page-description">Rastreie todas as alterações realizadas no sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={atualizarAuditoria} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" className="gap-2" onClick={exportarPDF} disabled={loading || registrosFiltrados.length === 0}>
            <Download className="size-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Info className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {logs.filter(l => l.tipo === "info").length}
                </p>
                <p className="text-xs text-muted-foreground">Informativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {logs.filter(l => l.tipo === "success").length}
                </p>
                <p className="text-xs text-muted-foreground">Sucessos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {logs.filter(l => l.tipo === "warning").length}
                </p>
                <p className="text-xs text-muted-foreground">Alertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {logs.filter(l => l.tipo === "error").length}
                </p>
                <p className="text-xs text-muted-foreground">Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <Filter className="size-5" />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Descrição..." 
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Módulo</Label>
              <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Chamados">Chamados</SelectItem>
                  <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="Funcionários">Funcionários</SelectItem>
                  <SelectItem value="Backup">Backup</SelectItem>
                  <SelectItem value="Configurações">Configurações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ação</Label>
              <Select value={filtroAcao} onValueChange={setFiltroAcao}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Criar">Criar</SelectItem>
                  <SelectItem value="Atualizar">Atualizar</SelectItem>
                  <SelectItem value="Excluir">Excluir</SelectItem>
                  <SelectItem value="Executar">Executar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => {
                  setBusca("")
                  setFiltroModulo("")
                  setFiltroAcao("")
                }}
              >
                <RotateCcw className="size-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Registros */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a3a5c]">
                  <TableHead className="w-[120px] text-center text-white font-semibold py-4">Data/Hora</TableHead>
                  <TableHead className="w-[120px] text-center text-white font-semibold py-4">Módulo</TableHead>
                  <TableHead className="w-[150px] text-center text-white font-semibold py-4">Usuário</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Ação</TableHead>
                  <TableHead className="w-[120px] text-center text-white font-semibold py-4">IP</TableHead>
                  <TableHead className="w-[80px] text-center text-white font-semibold py-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando auditoria...
                    </TableCell>
                  </TableRow>
                ) : registrosFiltrados.length > 0 ? (
                  registrosFiltrados.map((registro) => {
                    const ModuloIcon = moduloIcons[registro.modulo as keyof typeof moduloIcons] || FileText
                    return (
                      <TableRow key={registro.id} className="data-table-row group">
                        <TableCell className="py-4 text-left">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-[#1a3a5c] tracking-tight">{formatDate(registro.timestamp).split(' ')[0]}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/70">{formatDate(registro.timestamp).split(' ')[1]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <ModuloIcon className="size-4 text-primary" />
                            {registro.modulo}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-left text-sm text-[#1a3a5c]">{registro.usuario_nome || "Sistema"}</TableCell>
                        <TableCell className="text-left">
                          <div className="flex flex-col gap-1">
                            <Badge className={`${tipoConfig[registro.tipo as keyof typeof tipoConfig]?.cor} rounded-full px-2 text-[9px] w-fit`}>
                              {registro.tipo.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-700">{registro.acao}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground text-left">{registro.ip || "N/A"}</TableCell>
                        <TableCell className="text-left">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8"
                            onClick={() => {
                              setRegistroSelecionado(registro)
                              setModalDetalhes(true)
                            }}
                          >
                            <Eye className="size-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum registro de auditoria encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Detalhes da Auditoria */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c] flex items-center gap-2">
              <Shield className="size-5 text-[#7ac142]" />
              Detalhes da Auditoria
            </DialogTitle>
            <DialogDescription>
              Registro detalhado de auditoria de segurança
            </DialogDescription>
          </DialogHeader>
          
          {registroSelecionado && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Data e Hora</p>
                  <p className="text-sm font-bold text-[#1a3a5c]">{formatDate(registroSelecionado.timestamp)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">IP de Origem</p>
                  <p className="text-sm font-mono text-gray-600">{registroSelecionado.ip}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Módulo Afetado</p>
                  <p className="text-sm font-medium">{registroSelecionado.modulo}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ação Realizada</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 whitespace-normal h-auto text-left py-1 px-2 font-semibold">
                      {registroSelecionado.acao.split(':')[0]}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 pt-4 border-t">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Usuário Responsável</p>
                <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50 w-fit pr-4">
                  <div className="size-8 rounded-full bg-[#7ac142] flex items-center justify-center shadow-sm">
                    <User className="size-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-[#1a3a5c] leading-tight">{registroSelecionado.usuario_nome || "Sistema"}</p>
                    <p className="text-[10px] text-muted-foreground">ID: {registroSelecionado.usuario_id || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Descrição Detalhada</p>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <div className="size-2 rounded-full bg-[#3ba5d8]" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {registroSelecionado.acao}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setModalDetalhes(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
