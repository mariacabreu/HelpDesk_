"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { Search, Filter, FileText, Download, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      
      // Simulação de busca de logs do backend (não há endpoint real para isso ainda)
      // Mas removemos o mock estático global
      setLogs([])
      setLoading(false)
    }
  }, [])

  const logsFiltrados = logs.filter(log => {
    if (filtroTipo && log.tipo !== filtroTipo) return false
    if (filtroModulo && log.modulo !== filtroModulo) return false
    if (busca && !log.acao.toLowerCase().includes(busca.toLowerCase()) && 
        !log.usuario.toLowerCase().includes(busca.toLowerCase())) return false
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
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30)
    
    // Tabela
    const tableData = logsFiltrados.map(log => [
      formatDate(log.timestamp),
      log.tipo.toUpperCase(),
      log.modulo,
      log.usuario,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Logs do Sistema</h1>
          <p className="text-muted-foreground">Monitore todas as atividades do sistema</p>
        </div>
        <Button variant="outline" onClick={exportarPDF}>
          <Download className="size-4 mr-2" />
          Exportar Logs
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
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
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
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
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
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
          <CardTitle className="text-lg text-[#1a3a5c] flex items-center gap-2">
            <Filter className="size-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
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
              <Label>Tipo</Label>
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
              <Label>Módulo</Label>
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
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button className="w-full bg-[#3ba5d8] hover:bg-[#2d8bc0]">
                <Filter className="size-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1a3a5c] flex items-center gap-2">
            <FileText className="size-5" />
            Registros
          </CardTitle>
          <CardDescription>{logsFiltrados.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Timestamp</TableHead>
                  <TableHead className="w-[80px]">Tipo</TableHead>
                  <TableHead className="w-[120px]">Módulo</TableHead>
                  <TableHead className="w-[120px]">Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead className="w-[120px]">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando logs...
                    </TableCell>
                  </TableRow>
                ) : logsFiltrados.length > 0 ? (
                  logsFiltrados.map((log) => {
                    const config = tipoConfig[log.tipo as keyof typeof tipoConfig]
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{formatDate(log.timestamp)}</TableCell>
                        <TableCell>
                          <Badge className={config.cor}>
                            <config.icon className="size-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.modulo}</TableCell>
                        <TableCell className="text-sm">{log.usuario}</TableCell>
                        <TableCell className="text-sm">{log.acao}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
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
    </div>
  )
}
