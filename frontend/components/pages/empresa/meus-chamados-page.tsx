"use client"

import { useState, useEffect } from "react"
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
import { formatDate } from "@/lib/utils"
import { 
  Building2, User, Mail, Eye, Paperclip, History, MessageSquare, XCircle, 
  Search, Filter, Calendar, Clock, AlertTriangle, CheckCircle2 
} from "lucide-react"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"



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
  cancelado: { label: "Cancelado", cor: "bg-red-100 text-red-800" },
}

export function MeusChamadosPage() {
  const [userData, setUserData] = useState<any>(null)
  const [chamados, setChamados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState("")
  const [filtroPrioridade, setFiltroPrioridade] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [busca, setBusca] = useState("")
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalComentario, setModalComentario] = useState(false)
  const [novoComentario, setNovoComentario] = useState("")
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [chamadoParaCancelar, setChamadoParaCancelar] = useState<any | null>(null)
  const [equipamentosById, setEquipamentosById] = useState<Record<string, { nome: string; patrimonio?: string }>>({})

  const enviarComentario = async () => {
    if (!novoComentario.trim() || !chamadoSelecionado || !userData?.id) return
    
    try {
      const res = await fetch(`/api/chamados/${chamadoSelecionado.id}/historico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: userData.id,
          acao: novoComentario.trim()
        })
      })
      
      if (!res.ok) throw new Error("Erro ao enviar comentário")
      
      const novoHist = await res.json()
      
      // Formatar para o frontend (o backend já retorna com nome do usuário se carregado, mas vamos garantir)
      const comentarioFormatado = {
        id: novoHist.id,
        acao: novoHist.acao,
        data: novoHist.data,
        usuario: userData.nome || "Você"
      }
      
      const atualizado = { 
        ...chamadoSelecionado, 
        historico: [...(chamadoSelecionado.historico || []), comentarioFormatado] 
      }
      
      setChamadoSelecionado(atualizado)
      setChamados(prev => prev.map(c => c.id === atualizado.id ? atualizado : c))
      setNovoComentario("")
      setModalComentario(false)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      
      const solicitanteId = user.id
      if (solicitanteId) {
        fetch(`/api/chamados/solicitante/${solicitanteId}`)
          .then(res => res.json())
          .then(data => setChamados(data))
          .catch(err => console.error("Erro ao buscar chamados:", err))
          .finally(() => setLoading(false))
      }

      const empresaId = user.empresa?.id
      if (empresaId) {
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

  const chamadosFiltrados = chamados.filter(chamado => {
    if (filtroStatus && filtroStatus !== "todos" && chamado.status !== filtroStatus) return false
    if (filtroPrioridade && filtroPrioridade !== "todas" && chamado.prioridade !== filtroPrioridade) return false
    if (filtroTipo && filtroTipo !== "todos" && chamado.tipo !== filtroTipo) return false
    if (busca && !chamado.titulo.toLowerCase().includes(busca.toLowerCase()) && 
        !chamado.id.toString().includes(busca)) return false
    return true
  })

  const abrirDetalhes = (chamado: any) => {
    setChamadoSelecionado(chamado)
    setModalAberto(true)
  }

  const abrirComentario = (chamado: any) => {
    setChamadoSelecionado(chamado)
    setModalComentario(true)
  }

  const pedirCancelamento = (chamado: any) => {
    setChamadoParaCancelar(chamado)
    setCancelOpen(true)
  }

  const confirmarCancelamento = async () => {
    if (!chamadoParaCancelar) return
    setCancelLoading(true)
    try {
      const res = await fetch(`/api/chamados/${chamadoParaCancelar.id}/cancelar`, {
        method: "PATCH"
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail || "Falha ao cancelar chamado")
      }
      const atualizado = await res.json()
      setChamados(prev => prev.map(c => c.id === atualizado.id ? atualizado : c))
      if (chamadoSelecionado?.id === atualizado.id) setChamadoSelecionado(atualizado)
      setCancelOpen(false)
      setChamadoParaCancelar(null)
    } catch (e) {
      setCancelOpen(false)
      setChamadoParaCancelar(null)
    } finally {
      setCancelLoading(false)
    }
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
                <p className="font-medium text-[#1a3a5c]">
                  {userData?.empresa?.nome_fantasia || userData?.empresa?.razao_social || "Não disponível"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <User className="size-5 text-[#3ba5d8]" />
              <div>
                <p className="text-xs text-muted-foreground">Usuário</p>
                <p className="font-medium text-[#1a3a5c]">
                  {userData?.nome || "Não disponível"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Mail className="size-5 text-[#3ba5d8]" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium text-[#1a3a5c]">
                  {userData?.email || "Não disponível"}
                </p>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando chamados...
                    </TableCell>
                  </TableRow>
                ) : chamadosFiltrados.length > 0 ? (
                  chamadosFiltrados.map((chamado) => (
                    <TableRow key={chamado.id}>
                      <TableCell className="font-mono font-medium">CH-{chamado.id.toString().padStart(3, '0')}</TableCell>
                      <TableCell className="font-medium">{chamado.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {chamado.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={prioridadeConfig[String(chamado.prioridade).toLowerCase() as keyof typeof prioridadeConfig]?.cor}>
                          {prioridadeConfig[String(chamado.prioridade).toLowerCase() as keyof typeof prioridadeConfig]?.label || chamado.prioridade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[String(chamado.status).toLowerCase() as keyof typeof statusConfig]?.cor || "bg-gray-100 text-gray-800"}>
                          {statusConfig[String(chamado.status).toLowerCase() as keyof typeof statusConfig]?.label || (chamado.status ? (chamado.status.charAt(0).toUpperCase() + chamado.status.slice(1)) : "N/A")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(chamado.data_abertura)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="size-8 bg-white border-gray-200 shadow-sm hover:bg-blue-50 hover:border-[#3ba5d8]/50 transition-all hover:scale-110"
                            title="Visualizar" 
                            onClick={() => abrirDetalhes(chamado)}
                          >
                            <Eye className="size-4 text-[#3ba5d8]" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="size-8 bg-white border-gray-200 shadow-sm hover:bg-blue-50 hover:border-[#1a3a5c]/30 transition-all hover:scale-110"
                            title="Comentar" 
                            onClick={() => abrirComentario(chamado)}
                          >
                            <MessageSquare className="size-4 text-[#1a3a5c]" />
                          </Button>
                          {chamado.status !== "fechado" && chamado.status !== "resolvido" && chamado.status !== "cancelado" && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="size-8 bg-white border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-300 transition-all hover:scale-110"
                              title="Cancelar chamado" 
                              onClick={() => pedirCancelamento(chamado)}
                            >
                              <XCircle className="size-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum chamado encontrado.
                    </TableCell>
                  </TableRow>
                )}
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
          
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setModalComentario(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-[#7ac142] hover:bg-[#6ab035]" 
              onClick={enviarComentario}
              disabled={!novoComentario.trim()}
            >
              Enviar Comentário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1a3a5c]">Cancelar chamado</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente cancelar o chamado {chamadoParaCancelar ? `CH-${String(chamadoParaCancelar.id).padStart(3,"0")}` : ""}? Esta ação fechará o chamado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel disabled={cancelLoading}>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCancelamento} disabled={cancelLoading}>
              {cancelLoading ? "Cancelando..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

