"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { Search, Filter, FileText, Download, AlertCircle, CheckCircle, Info, AlertTriangle, RotateCcw, Eye, User } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const tipoConfig = {
  info: { label: "Info", cor: "bg-blue-100 text-blue-800", icon: Info },
  success: { label: "Sucesso", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  warning: { label: "Alerta", cor: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  error: { label: "Erro", cor: "bg-red-100 text-red-800", icon: AlertCircle },
}

export function LogsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")
  const [logSelecionado, setLogSelecionado] = useState<any | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)

  const fetchLogs = async (empresaId: string) => {
    try {
      const response = await fetch(`/api/logs?empresa_id=${empresaId}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      if (user.empresa?.id) {
        fetchLogs(user.empresa.id)
      } else {
        setLoading(false)
      }
    }
  }, [])

  const logsFiltrados = logs.filter(log => {
    if (filtroTipo && filtroTipo !== "todos" && log.tipo !== filtroTipo) return false
    if (filtroModulo && filtroModulo !== "todos" && log.modulo !== filtroModulo) return false
    
    const termoBusca = busca.toLowerCase()
    if (busca && 
        !log.acao.toLowerCase().includes(termoBusca) && 
        !(log.usuario_nome || "").toLowerCase().includes(termoBusca)) {
      return false
    }
    return true
  })

  const exportarPDF = () => {
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(18)
    doc.text("Relatório de Logs do Sistema", 14, 22)
    
    // Data de exportação
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Gerado em: ${formatDate(new Date())}`, 14, 30)
    
    // Tabela
    const tableData = logsFiltrados.map(log => [
      formatDate(log.timestamp),
      log.tipo.toUpperCase(),
      log.modulo,
      log.usuario_nome || "Sistema",
      log.acao,
      log.ip
    ])
    
    autoTable(doc, {
      head: [['Timestamp', 'Tipo', 'Módulo', 'Usuário', 'Ação', 'IP']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [26, 58, 92] }, // #1a3a5c
      styles: { fontSize: 8 }
    })
    
    doc.save(`logs-sistema-${new Date().getTime()}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Logs do Sistema</h1>
          <p className="page-description">Monitore todas as atividades do sistema</p>
        </div>
        <Button 
          variant="outline" 
          className="bg-white dark:bg-background border-gray-200 shadow-sm hover:bg-blue-50 hover:border-primary/50 transition-all gap-2" 
          onClick={exportarPDF}
        >
          <Download className="size-4 text-primary" />
          Exportar Logs
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Ação ou usuário..." 
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="warning">Alerta</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Módulo</Label>
              <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Autenticação">Autenticação</SelectItem>
                  <SelectItem value="Chamados">Chamados</SelectItem>
                  <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="Funcionários">Funcionários</SelectItem>
                  <SelectItem value="Sistema">Sistema</SelectItem>
                  <SelectItem value="Backup">Backup</SelectItem>
                  <SelectItem value="Segurança">Segurança</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => {
                  setBusca("")
                  setFiltroTipo("")
                  setFiltroModulo("")
                }}
              >
                <RotateCcw className="size-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="data-table-header">
                  <TableHead className="w-[120px] text-[10px] font-bold text-[#1a3a5c]/60 uppercase tracking-widest py-4 text-left">Data/Hora</TableHead>
                  <TableHead className="w-[100px] text-[10px] font-bold text-[#1a3a5c]/60 uppercase tracking-widest py-4 text-left">Tipo</TableHead>
                  <TableHead className="w-[120px] text-[10px] font-bold text-[#1a3a5c]/60 uppercase tracking-widest py-4 text-left">Módulo</TableHead>
                  <TableHead className="w-[150px] text-[10px] font-bold text-[#1a3a5c]/60 uppercase tracking-widest py-4 text-left">Usuário</TableHead>
                  <TableHead className="text-[10px] font-bold text-[#1a3a5c]/60 uppercase tracking-widest py-4 text-left">Ação Realizada</TableHead>
                  <TableHead className="w-[120px] text-[10px] font-bold text-[#1a3a5c]/60 uppercase tracking-widest py-4 text-left">IP</TableHead>
                  <TableHead className="w-[80px] text-[10px] font-bold text-[#1a3a5c]/60 uppercase tracking-widest py-4 text-left">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando logs...
                    </TableCell>
                  </TableRow>
                ) : logsFiltrados.length > 0 ? (
                  logsFiltrados.map((log) => {
                    const config = tipoConfig[log.tipo as keyof typeof tipoConfig]
                    return (
                      <TableRow key={log.id} className="data-table-row group">
                        <TableCell className="py-4 text-left">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-[#1a3a5c] tracking-tight">{formatDate(log.timestamp).split(' ')[0]}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/70">{formatDate(log.timestamp).split(' ')[1]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <Badge className={`${config.cor} rounded-full px-2 text-[9px] shadow-none border-none`}>
                            <config.icon className="size-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-left text-sm text-gray-600">{log.modulo}</TableCell>
                        <TableCell className="font-bold text-left text-sm text-[#1a3a5c]">{log.usuario_nome || log.usuario || "Sistema"}</TableCell>
                        <TableCell className="text-sm text-left text-gray-700">{log.acao}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground text-left">{log.ip}</TableCell>
                        <TableCell className="py-4 text-left">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#3ba5d8] hover:text-[#3ba5d8] hover:bg-[#3ba5d8]/10 h-8 px-2"
                            onClick={() => {
                              setLogSelecionado(log)
                              setModalDetalhes(true)
                            }}
                          >
                            <Eye className="size-4 mr-1.5" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Detalhes do Log */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c] flex items-center gap-2">
              <FileText className="size-5 text-[#3ba5d8]" />
              Detalhes do Registro
            </DialogTitle>
            <DialogDescription>
              Informações completas do log de sistema
            </DialogDescription>
          </DialogHeader>
          
          {logSelecionado && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Data e Hora</p>
                  <p className="text-sm font-bold text-[#1a3a5c]">{formatDate(logSelecionado.timestamp)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">IP de Acesso</p>
                  <p className="text-sm font-mono text-gray-600">{logSelecionado.ip}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Módulo</p>
                  <p className="text-sm font-medium">{logSelecionado.modulo}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tipo</p>
                  <Badge className={tipoConfig[logSelecionado.tipo as keyof typeof tipoConfig]?.cor}>
                    {logSelecionado.tipo}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1 pt-4 border-t">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Usuário Responsável</p>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-[#3ba5d8]/10 flex items-center justify-center">
                    <User className="size-4 text-[#3ba5d8]" />
                  </div>
                  <p className="text-sm font-bold text-[#1a3a5c]">{logSelecionado.usuario_nome || logSelecionado.usuario}</p>
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ação Realizada</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{logSelecionado.acao}</p>
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
