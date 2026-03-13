"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, User, Mail, Eye, Paperclip, History, MessageSquare, XCircle, 
  Search, Filter, Calendar, Clock, AlertTriangle, CheckCircle2 
} from "lucide-react"

const chamadosMock = [
  { 
    id: "CH-001", 
    titulo: "Sistema não inicia", 
    prioridade: "alta", 
    status: "aberto", 
    dataAbertura: "2024-01-15 09:30",
    tipo: "incidente",
    equipamento: "Notebook Dell Latitude",
    descricao: "O sistema operacional não está iniciando. Aparece tela azul com erro.",
    anexos: ["erro.png", "foto_tela.jpg"],
    historico: [
      { data: "2024-01-15 09:30", acao: "Chamado aberto", usuario: "João Silva" },
      { data: "2024-01-15 10:15", acao: "Chamado visualizado pelo suporte", usuario: "Sistema" },
    ]
  },
  { 
    id: "CH-002", 
    titulo: "Solicitação de novo monitor", 
    prioridade: "baixa", 
    status: "em_atendimento", 
    dataAbertura: "2024-01-14 14:00",
    tipo: "solicitacao",
    equipamento: "N/A",
    descricao: "Necessito de um segundo monitor para aumentar a produtividade.",
    anexos: [],
    historico: [
      { data: "2024-01-14 14:00", acao: "Chamado aberto", usuario: "João Silva" },
      { data: "2024-01-14 15:30", acao: "Chamado atribuído ao técnico Carlos", usuario: "Sistema" },
      { data: "2024-01-15 08:00", acao: "Em análise de disponibilidade", usuario: "Carlos Souza" },
    ]
  },
  { 
    id: "CH-003", 
    titulo: "Impressora não imprime", 
    prioridade: "media", 
    status: "escalonado", 
    dataAbertura: "2024-01-13 11:20",
    tipo: "incidente",
    equipamento: "Impressora Epson L3150",
    descricao: "A impressora está ligada mas não recebe os trabalhos de impressão.",
    anexos: ["config_impressora.pdf"],
    historico: [
      { data: "2024-01-13 11:20", acao: "Chamado aberto", usuario: "João Silva" },
      { data: "2024-01-13 12:00", acao: "Escalonado para N2", usuario: "Maria Fernandes" },
    ]
  },
  { 
    id: "CH-004", 
    titulo: "Atualização do Office", 
    prioridade: "baixa", 
    status: "resolvido", 
    dataAbertura: "2024-01-10 16:45",
    tipo: "solicitacao",
    equipamento: "Desktop HP ProDesk",
    descricao: "Solicito atualização do pacote Office para a versão mais recente.",
    anexos: [],
    historico: [
      { data: "2024-01-10 16:45", acao: "Chamado aberto", usuario: "João Silva" },
      { data: "2024-01-11 09:00", acao: "Atualização realizada com sucesso", usuario: "Pedro Alves" },
      { data: "2024-01-11 09:30", acao: "Chamado resolvido", usuario: "Pedro Alves" },
    ]
  },
  { 
    id: "CH-005", 
    titulo: "VPN não conecta", 
    prioridade: "alta", 
    status: "fechado", 
    dataAbertura: "2024-01-08 08:00",
    tipo: "incidente",
    equipamento: "Notebook Dell Latitude",
    descricao: "Não consigo conectar na VPN da empresa para acessar os sistemas.",
    anexos: ["erro_vpn.png"],
    historico: [
      { data: "2024-01-08 08:00", acao: "Chamado aberto", usuario: "João Silva" },
      { data: "2024-01-08 08:30", acao: "Problema identificado: certificado expirado", usuario: "Ana Costa" },
      { data: "2024-01-08 09:00", acao: "Certificado renovado", usuario: "Ana Costa" },
      { data: "2024-01-08 09:15", acao: "Chamado fechado pelo usuário", usuario: "João Silva" },
    ]
  },
]

const prioridadeConfig = {
  baixa: { label: "Baixa", cor: "bg-green-100 text-green-800 border-green-200" },
  media: { label: "Média", cor: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  alta: { label: "Alta", cor: "bg-red-100 text-red-800 border-red-200" },
}

const statusConfig = {
  aberto: { label: "Aberto", cor: "bg-blue-100 text-blue-800" },
  em_atendimento: { label: "Em Atendimento", cor: "bg-purple-100 text-purple-800" },
  escalonado: { label: "Escalonado", cor: "bg-orange-100 text-orange-800" },
  resolvido: { label: "Resolvido", cor: "bg-green-100 text-green-800" },
  fechado: { label: "Fechado", cor: "bg-gray-100 text-gray-800" },
}

export function MeusChamadosPage() {
  const [filtroStatus, setFiltroStatus] = useState("")
  const [filtroPrioridade, setFiltroPrioridade] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [busca, setBusca] = useState("")
  const [chamadoSelecionado, setChamadoSelecionado] = useState<typeof chamadosMock[0] | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalComentario, setModalComentario] = useState(false)
  const [novoComentario, setNovoComentario] = useState("")

  const chamadosFiltrados = chamadosMock.filter(chamado => {
    if (filtroStatus && chamado.status !== filtroStatus) return false
    if (filtroPrioridade && chamado.prioridade !== filtroPrioridade) return false
    if (filtroTipo && chamado.tipo !== filtroTipo) return false
    if (busca && !chamado.titulo.toLowerCase().includes(busca.toLowerCase()) && !chamado.id.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const abrirDetalhes = (chamado: typeof chamadosMock[0]) => {
    setChamadoSelecionado(chamado)
    setModalAberto(true)
  }

  const abrirComentario = (chamado: typeof chamadosMock[0]) => {
    setChamadoSelecionado(chamado)
    setModalComentario(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Meus Chamados</h1>
        <p className="text-muted-foreground">Acompanhe e gerencie seus chamados abertos</p>
      </div>

      {/* Dados da Empresa */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Building2 className="size-5 text-[#3ba5d8]" />
              <div>
                <p className="text-xs text-muted-foreground">Empresa</p>
                <p className="font-medium text-[#1a3a5c]">Tech Solutions Ltda</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <User className="size-5 text-[#3ba5d8]" />
              <div>
                <p className="text-xs text-muted-foreground">Usuário</p>
                <p className="font-medium text-[#1a3a5c]">João Silva</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Mail className="size-5 text-[#3ba5d8]" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium text-[#1a3a5c]">joao@techsolutions.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  placeholder="Nº ou título..." 
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                  <SelectItem value="escalonado">Escalonado</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="baixa">Baixa (N1)</SelectItem>
                  <SelectItem value="media">Média (N2)</SelectItem>
                  <SelectItem value="alta">Alta (N3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="incidente">Incidente</SelectItem>
                  <SelectItem value="solicitacao">Solicitação</SelectItem>
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

      {/* Lista de Chamados */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1a3a5c]">Lista de Chamados</CardTitle>
          <CardDescription>{chamadosFiltrados.length} chamados encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Nº</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead className="w-[100px]">Prioridade</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px]">Data Abertura</TableHead>
                  <TableHead className="w-[180px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chamadosFiltrados.map((chamado) => (
                  <TableRow key={chamado.id}>
                    <TableCell className="font-mono font-medium">{chamado.id}</TableCell>
                    <TableCell className="font-medium">{chamado.titulo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {chamado.tipo === "incidente" ? "Incidente" : "Solicitação"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={prioridadeConfig[chamado.prioridade as keyof typeof prioridadeConfig].cor}>
                        {prioridadeConfig[chamado.prioridade as keyof typeof prioridadeConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[chamado.status as keyof typeof statusConfig].cor}>
                        {statusConfig[chamado.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {chamado.dataAbertura}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Visualizar" onClick={() => abrirDetalhes(chamado)}>
                          <Eye className="size-4 text-[#3ba5d8]" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Ver anexos" disabled={chamado.anexos.length === 0}>
                          <Paperclip className="size-4 text-[#7ac142]" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Comentar" onClick={() => abrirComentario(chamado)}>
                          <MessageSquare className="size-4 text-[#1a3a5c]" />
                        </Button>
                        {chamado.status !== "fechado" && chamado.status !== "resolvido" && (
                          <Button variant="ghost" size="icon" title="Cancelar chamado">
                            <XCircle className="size-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
                <TabsTrigger value="anexos">Anexos ({chamadoSelecionado.anexos.length})</TabsTrigger>
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
                    <Badge className={prioridadeConfig[chamadoSelecionado.prioridade as keyof typeof prioridadeConfig].cor}>
                      {prioridadeConfig[chamadoSelecionado.prioridade as keyof typeof prioridadeConfig].label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={statusConfig[chamadoSelecionado.status as keyof typeof statusConfig].cor}>
                      {statusConfig[chamadoSelecionado.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Data de Abertura</p>
                    <p className="text-sm font-medium">{chamadoSelecionado.dataAbertura}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Equipamento</p>
                  <p className="text-sm font-medium">{chamadoSelecionado.equipamento}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{chamadoSelecionado.descricao}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="anexos" className="mt-4">
                {chamadoSelecionado.anexos.length > 0 ? (
                  <div className="space-y-2">
                    {chamadoSelecionado.anexos.map((anexo, index) => (
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
                  {chamadoSelecionado.historico.map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="size-8 rounded-full bg-[#3ba5d8]/20 flex items-center justify-center">
                          <History className="size-4 text-[#3ba5d8]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.acao}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.data} - {item.usuario}
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

      {/* Modal Comentário */}
      <Dialog open={modalComentario} onOpenChange={setModalComentario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Adicionar Comentário</DialogTitle>
            <DialogDescription>
              {chamadoSelecionado?.id} - {chamadoSelecionado?.titulo}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea 
              placeholder="Digite seu comentário..."
              rows={4}
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalComentario(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#7ac142] hover:bg-[#6ab035]">
              Enviar Comentário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
