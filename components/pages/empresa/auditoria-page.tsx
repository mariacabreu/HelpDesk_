"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, Filter, Shield, Download, Eye, User, FileText, 
  Clock, ArrowRight, Database, Settings, Lock
} from "lucide-react"

const auditoriaMock = [
  { 
    id: "AUD-001",
    timestamp: "2024-01-15 14:32:15",
    usuario: "João Silva",
    modulo: "Chamados",
    acao: "Criar",
    descricao: "Criou novo chamado CH-001",
    detalhes: {
      antes: null,
      depois: {
        id: "CH-001",
        titulo: "Sistema não inicia",
        prioridade: "alta",
        status: "aberto"
      }
    },
    ip: "192.168.1.100"
  },
  { 
    id: "AUD-002",
    timestamp: "2024-01-15 14:25:00",
    usuario: "Carlos Souza",
    modulo: "Funcionários",
    acao: "Atualizar",
    descricao: "Alterou status do funcionário FUNC-004",
    detalhes: {
      antes: { status: "ativo" },
      depois: { status: "inativo" }
    },
    ip: "192.168.1.102"
  },
  { 
    id: "AUD-003",
    timestamp: "2024-01-15 13:50:00",
    usuario: "Maria Santos",
    modulo: "Equipamentos",
    acao: "Atualizar",
    descricao: "Editou equipamento EQ-003",
    detalhes: {
      antes: { status: "ativo" },
      depois: { status: "manutencao" }
    },
    ip: "192.168.1.101"
  },
  { 
    id: "AUD-004",
    timestamp: "2024-01-15 11:30:00",
    usuario: "Pedro Oliveira",
    modulo: "Chamados",
    acao: "Atualizar",
    descricao: "Adicionou comentário ao chamado CH-002",
    detalhes: {
      antes: null,
      depois: { comentario: "Aguardando aprovação de orçamento" }
    },
    ip: "192.168.1.103"
  },
  { 
    id: "AUD-005",
    timestamp: "2024-01-15 10:00:00",
    usuario: "Sistema",
    modulo: "Backup",
    acao: "Executar",
    descricao: "Backup automático realizado",
    detalhes: {
      antes: null,
      depois: { arquivo: "BKP-001", tamanho: "2.5 GB" }
    },
    ip: "127.0.0.1"
  },
  { 
    id: "AUD-006",
    timestamp: "2024-01-14 16:45:00",
    usuario: "Carlos Souza",
    modulo: "Configurações",
    acao: "Atualizar",
    descricao: "Alterou configurações de backup",
    detalhes: {
      antes: { horario: "03:00", retencao: 15 },
      depois: { horario: "02:00", retencao: 30 }
    },
    ip: "192.168.1.102"
  },
  { 
    id: "AUD-007",
    timestamp: "2024-01-14 15:30:00",
    usuario: "João Silva",
    modulo: "Equipamentos",
    acao: "Criar",
    descricao: "Cadastrou novo equipamento EQ-005",
    detalhes: {
      antes: null,
      depois: {
        id: "EQ-005",
        nome: "Notebook Lenovo ThinkPad",
        patrimonio: "NB-2024-005"
      }
    },
    ip: "192.168.1.100"
  },
]

const acaoConfig = {
  Criar: { cor: "bg-green-100 text-green-800" },
  Atualizar: { cor: "bg-blue-100 text-blue-800" },
  Excluir: { cor: "bg-red-100 text-red-800" },
  Executar: { cor: "bg-purple-100 text-purple-800" },
}

const moduloIcons = {
  Chamados: FileText,
  Funcionários: User,
  Equipamentos: Database,
  Backup: Database,
  Configurações: Settings,
  Autenticação: Lock,
}

export function AuditoriaPage() {
  const [busca, setBusca] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")
  const [filtroAcao, setFiltroAcao] = useState("")
  const [filtroUsuario, setFiltroUsuario] = useState("")
  const [registroSelecionado, setRegistroSelecionado] = useState<typeof auditoriaMock[0] | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)

  const registrosFiltrados = auditoriaMock.filter(registro => {
    if (filtroModulo && registro.modulo !== filtroModulo) return false
    if (filtroAcao && registro.acao !== filtroAcao) return false
    if (filtroUsuario && registro.usuario !== filtroUsuario) return false
    if (busca && !registro.descricao.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const usuarios = [...new Set(auditoriaMock.map(r => r.usuario))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Auditoria</h1>
          <p className="text-muted-foreground">Rastreie todas as alterações realizadas no sistema</p>
        </div>
        <Button variant="outline">
          <Download className="size-4 mr-2" />
          Exportar Relatório
        </Button>
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
                <p className="text-2xl font-bold text-[#1a3a5c]">{auditoriaMock.length}</p>
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
                  {auditoriaMock.filter(r => r.acao === "Criar").length}
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
                  {auditoriaMock.filter(r => r.acao === "Atualizar").length}
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
                      <TableCell className="font-mono text-xs">{registro.timestamp}</TableCell>
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
                          variant="ghost" 
                          size="icon"
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
