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
import { formatDate } from "@/lib/utils"
import { 
  Search, Filter, Shield, Download, Eye, User, FileText, 
  Clock, ArrowRight, Database, Settings, Lock, PlusCircle, Pencil, Trash2, Play, RefreshCw
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const moduloIcons = {
  Chamados: FileText,
  Equipamentos: Database,
  Funcionários: User,
  Backup: Lock,
  Configurações: Settings,
}

const acaoConfig = {
  Criar: { label: "Criar", cor: "bg-green-100 text-green-800" },
  Atualizar: { label: "Atualizar", cor: "bg-blue-100 text-blue-800" },
  Excluir: { label: "Excluir", cor: "bg-red-100 text-red-800" },
  Executar: { label: "Executar", cor: "bg-purple-100 text-purple-800" },
}

const auditoriaMock = [
  {
    id: "AUD-001",
    timestamp: "2024-04-04T10:30:00Z",
    usuario: "Maria Souza",
    modulo: "Chamados",
    acao: "Criar",
    descricao: "Novo chamado CH-005 criado para 'Notebook lento'",
    ip: "192.168.1.15",
    detalhes: {
      antes: null,
      depois: { titulo: "Notebook lento", prioridade: "alta", tipo: "incidente" }
    }
  },
  {
    id: "AUD-002",
    timestamp: "2024-04-04T11:15:20Z",
    usuario: "Maria Souza",
    modulo: "Funcionários",
    acao: "Atualizar",
    descricao: "Alteração de cargo do funcionário João Silva",
    ip: "192.168.1.15",
    detalhes: {
      antes: { cargo: "Analista Jr" },
      depois: { cargo: "Analista Pleno" }
    }
  },
  {
    id: "AUD-003",
    timestamp: "2024-04-04T12:00:00Z",
    usuario: "Sistema",
    modulo: "Backup",
    acao: "Executar",
    descricao: "Execução de backup manual solicitada",
    ip: "127.0.0.1",
    detalhes: {
      antes: null,
      depois: { status: "em_andamento", tipo: "manual" }
    }
  },
  {
    id: "AUD-004",
    timestamp: "2024-04-03T15:45:10Z",
    usuario: "João Silva",
    modulo: "Equipamentos",
    acao: "Criar",
    descricao: "Novo equipamento PAT-2024-010 cadastrado",
    ip: "192.168.1.16",
    detalhes: {
      antes: null,
      depois: { nome: "Monitor LG 29", patrimonio: "PAT-2024-010", status: "ativo" }
    }
  },
  {
    id: "AUD-005",
    timestamp: "2024-04-03T14:20:00Z",
    usuario: "Maria Souza",
    modulo: "Configurações",
    acao: "Atualizar",
    descricao: "Alteração do horário de backup automático",
    ip: "192.168.1.15",
    detalhes: {
      antes: { horario: "02:00" },
      depois: { horario: "03:00" }
    }
  },
  {
    id: "AUD-006",
    timestamp: "2024-04-03T10:00:00Z",
    usuario: "Sistema",
    modulo: "Backup",
    acao: "Executar",
    descricao: "Backup automático concluído com sucesso",
    ip: "127.0.0.1",
    detalhes: {
      antes: null,
      depois: { status: "concluido", tamanho: "2.8 GB" }
    }
  },
  {
    id: "AUD-007",
    timestamp: "2024-04-02T16:30:00Z",
    usuario: "Maria Souza",
    modulo: "Funcionários",
    acao: "Criar",
    descricao: "Novo funcionário 'Carlos Lima' cadastrado",
    ip: "192.168.1.15",
    detalhes: {
      antes: null,
      depois: { nome: "Carlos Lima", cargo: "Estagiário", setor: "TI" }
    }
  },
  {
    id: "AUD-008",
    timestamp: "2024-04-02T09:15:00Z",
    usuario: "João Silva",
    modulo: "Chamados",
    acao: "Atualizar",
    descricao: "Status do chamado CH-001 alterado para 'Em Atendimento'",
    ip: "192.168.1.16",
    detalhes: {
      antes: { status: "aberto" },
      depois: { status: "em_atendimento" }
    }
  }
]

export function AuditoriaPage() {
  const [userData, setUserData] = useState<any>(null)
  const [auditoria, setAuditoria] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")
  const [filtroAcao, setFiltroAcao] = useState("")
  const [filtroUsuario, setFiltroUsuario] = useState("")
  const [registroSelecionado, setRegistroSelecionado] = useState<any | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      
      // Simulação de busca de auditoria (não há endpoint real para isso ainda)
      setAuditoria(auditoriaMock)
      setLoading(false)
    }
  }, [])

  const registrosFiltrados = auditoria.filter(item => {
    if (filtroModulo && filtroModulo !== "todos" && item.modulo !== filtroModulo) return false
    if (filtroAcao && filtroAcao !== "todas" && item.acao !== filtroAcao) return false
    if (filtroUsuario && filtroUsuario !== "todos" && item.usuario !== filtroUsuario) return false
    if (busca && !item.descricao.toLowerCase().includes(busca.toLowerCase()) && 
        !item.usuario.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const usuarios = [...new Set(auditoria.map(r => r.usuario))]

  const atualizarAuditoria = () => {
    setLoading(true)
    setTimeout(() => {
      setAuditoria([...auditoriaMock].sort(() => Math.random() - 0.5))
      setLoading(false)
    }, 800)
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

    doc.text("Relatório de Auditoria - HelpDesk", 14, 15)
    doc.setFontSize(10)
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 22)
    doc.text(`Total de registros: ${registrosFiltrados.length}`, 14, 28)

    autoTable(doc, {
      startY: 35,
      head: [["Data/Hora", "Usuário", "Módulo", "Ação", "Descrição", "IP"]],
      body: tableData,
      headStyles: { fillStyle: "bold", fillColor: [26, 58, 92] },
    })

    doc.save(`auditoria-helpdesk-${new Date().getTime()}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Auditoria</h1>
          <p className="text-muted-foreground">Rastreie todas as alterações realizadas no sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={atualizarAuditoria} disabled={loading}>
            <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportarPDF} disabled={loading || registrosFiltrados.length === 0}>
            <Download className="size-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">{auditoria.length}</p>
                <p className="text-xs text-muted-foreground">Total de Registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
                  {auditoria.filter(r => r.acao === "Criar").length}
                </p>
                <p className="text-xs text-muted-foreground">Criações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Settings className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
                  {auditoria.filter(r => r.acao === "Atualizar").length}
                </p>
                <p className="text-xs text-muted-foreground">Atualizações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">{usuarios.length}</p>
                <p className="text-xs text-muted-foreground">Usuários Ativos</p>
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
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
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
              <Label>Módulo</Label>
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
              <Label>Ação</Label>
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
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {usuarios.map(usuario => (
                    <SelectItem key={usuario} value={usuario}>{usuario}</SelectItem>
                  ))}
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

      {/* Lista de Registros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1a3a5c] flex items-center gap-2">
            <Shield className="size-5" />
            Registros de Auditoria
          </CardTitle>
          <CardDescription>{registrosFiltrados.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Data/Hora</TableHead>
                  <TableHead className="w-[120px]">Usuário</TableHead>
                  <TableHead className="w-[120px]">Módulo</TableHead>
                  <TableHead className="w-[100px]">Ação</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[100px]">IP</TableHead>
                  <TableHead className="w-[80px] text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrosFiltrados.map((registro) => {
                  const ModuloIcon = moduloIcons[registro.modulo as keyof typeof moduloIcons] || FileText
                  return (
                    <TableRow key={registro.id}>
                      <TableCell className="font-mono text-xs">{formatDate(registro.timestamp)}</TableCell>
                      <TableCell>{registro.usuario}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ModuloIcon className="size-4 text-[#3ba5d8]" />
                          {registro.modulo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={acaoConfig[registro.acao as keyof typeof acaoConfig]?.cor}>
                          {registro.acao}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{registro.descricao}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{registro.ip}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="size-8 bg-white border-gray-200 shadow-sm hover:bg-blue-50 hover:border-[#3ba5d8]/50 transition-all hover:scale-110"
                          onClick={() => {
                            setRegistroSelecionado(registro)
                            setModalDetalhes(true)
                          }}
                        >
                          <Eye className="size-4 text-[#3ba5d8]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Detalhes */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Detalhes da Auditoria</DialogTitle>
            <DialogDescription>{registroSelecionado?.id}</DialogDescription>
          </DialogHeader>
          
          {registroSelecionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="size-4 text-[#3ba5d8]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data/Hora</p>
                    <p className="text-sm font-medium">{registroSelecionado.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <User className="size-4 text-[#3ba5d8]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Usuário</p>
                    <p className="text-sm font-medium">{registroSelecionado.usuario}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Descrição da Ação</p>
                <p className="text-sm font-medium">{registroSelecionado.descricao}</p>
              </div>

              <Tabs defaultValue="depois">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="antes">Antes</TabsTrigger>
                  <TabsTrigger value="depois">Depois</TabsTrigger>
                </TabsList>
                <TabsContent value="antes" className="mt-4">
                  {registroSelecionado.detalhes.antes ? (
                    <pre className="p-4 bg-red-50 rounded-lg text-sm overflow-auto">
                      {JSON.stringify(registroSelecionado.detalhes.antes, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum valor anterior (registro criado)
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="depois" className="mt-4">
                  {registroSelecionado.detalhes.depois ? (
                    <pre className="p-4 bg-green-50 rounded-lg text-sm overflow-auto">
                      {JSON.stringify(registroSelecionado.detalhes.depois, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum valor posterior (registro excluído)
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
