"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, FileText, Download, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

const logsMock = [
  { 
    id: "LOG-001",
    timestamp: "2024-01-15 14:32:15",
    tipo: "info",
    modulo: "Autenticação",
    usuario: "João Silva",
    acao: "Login realizado com sucesso",
    ip: "192.168.1.100"
  },
  { 
    id: "LOG-002",
    timestamp: "2024-01-15 14:30:45",
    tipo: "success",
    modulo: "Chamados",
    usuario: "João Silva",
    acao: "Chamado CH-001 criado",
    ip: "192.168.1.100"
  },
  { 
    id: "LOG-003",
    timestamp: "2024-01-15 14:28:00",
    tipo: "warning",
    modulo: "Equipamentos",
    usuario: "Maria Santos",
    acao: "Tentativa de edição sem permissão",
    ip: "192.168.1.101"
  },
  { 
    id: "LOG-004",
    timestamp: "2024-01-15 14:25:30",
    tipo: "error",
    modulo: "Sistema",
    usuario: "Sistema",
    acao: "Erro ao conectar com servidor de e-mail",
    ip: "127.0.0.1"
  },
  { 
    id: "LOG-005",
    timestamp: "2024-01-15 14:20:00",
    tipo: "info",
    modulo: "Funcionários",
    usuario: "Carlos Souza",
    acao: "Funcionário FUNC-004 inativado",
    ip: "192.168.1.102"
  },
  { 
    id: "LOG-006",
    timestamp: "2024-01-15 14:15:00",
    tipo: "success",
    modulo: "Backup",
    usuario: "Sistema",
    acao: "Backup automático concluído",
    ip: "127.0.0.1"
  },
  { 
    id: "LOG-007",
    timestamp: "2024-01-15 13:00:00",
    tipo: "info",
    modulo: "Autenticação",
    usuario: "Pedro Oliveira",
    acao: "Logout realizado",
    ip: "192.168.1.103"
  },
  { 
    id: "LOG-008",
    timestamp: "2024-01-15 12:45:00",
    tipo: "warning",
    modulo: "Segurança",
    usuario: "Sistema",
    acao: "Múltiplas tentativas de login falhas detectadas",
    ip: "192.168.1.200"
  },
]

const tipoConfig = {
  info: { label: "Info", cor: "bg-blue-100 text-blue-800", icon: Info },
  success: { label: "Sucesso", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  warning: { label: "Alerta", cor: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  error: { label: "Erro", cor: "bg-red-100 text-red-800", icon: AlertCircle },
}

export function LogsPage() {
  const [busca, setBusca] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")

  const logsFiltrados = logsMock.filter(log => {
    if (filtroTipo && log.tipo !== filtroTipo) return false
    if (filtroModulo && log.modulo !== filtroModulo) return false
    if (busca && !log.acao.toLowerCase().includes(busca.toLowerCase()) && 
        !log.usuario.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Logs do Sistema</h1>
          <p className="text-muted-foreground">Monitore todas as atividades do sistema</p>
        </div>
        <Button variant="outline">
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
                  {logsMock.filter(l => l.tipo === "info").length}
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
                  {logsMock.filter(l => l.tipo === "success").length}
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
                  {logsMock.filter(l => l.tipo === "warning").length}
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
                  {logsMock.filter(l => l.tipo === "error").length}
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
                {logsFiltrados.map((log) => {
                  const config = tipoConfig[log.tipo as keyof typeof tipoConfig]
                  const IconTipo = config.icon
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                      <TableCell>
                        <Badge className={config.cor}>
                          <IconTipo className="size-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.modulo}</TableCell>
                      <TableCell className="text-sm">{log.usuario}</TableCell>
                      <TableCell className="text-sm">{log.acao}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
