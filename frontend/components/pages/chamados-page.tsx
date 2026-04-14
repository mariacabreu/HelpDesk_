"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, RotateCcw, Eye, UserPlus, RefreshCw, CheckCircle, Lock, MoreHorizontal, Clock, AlertTriangle, Loader2, Shuffle, ArrowRight, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

const prioridadeColors: Record<string, string> = {
  baixa: "bg-emerald-100 text-emerald-700 border-emerald-200",
  media: "bg-amber-100 text-amber-700 border-amber-200",
  alta: "bg-orange-100 text-orange-700 border-orange-200",
  critica: "bg-red-100 text-red-700 border-red-200",
}

const statusColors: Record<string, string> = {
  aberto: "bg-blue-100 text-blue-700 border-blue-200",
  em_atendimento: "bg-yellow-100 text-yellow-700 border-yellow-200",
  escalado: "bg-purple-100 text-purple-700 border-purple-200",
  escalonamento_aprovado: "bg-indigo-100 text-indigo-700 border-indigo-200",
  resolvido: "bg-green-100 text-green-700 border-green-200",
  fechado: "bg-gray-100 text-gray-700 border-gray-200",
  cancelado: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_atendimento: "Em Atendimento",
  escalado: "Escalonado",
  escalonamento_aprovado: "Escalonamento Aprovado",
  resolvido: "Resolvido",
  fechado: "Fechado",
  cancelado: "Cancelado",
}

export function ChamadosPage() {
  const [filtros, setFiltros] = useState({
    numero: "",
    empresa: "",
    prioridade: "",
    status: "",
  })
  const [chamados, setChamados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any | null>(null)
  const [chamadoParaEscalonar, setChamadoParaEscalonar] = useState<any | null>(null)
  const [escalonando, setEscalonando] = useState(false)
  const [tecnicosN3, setTecnicosN3] = useState<any[]>([])
  const [tecnicoSelecionadoId, setTecnicoSelecionadoId] = useState<string>("")
  const [confirmarAcao, setConfirmarAcao] = useState<{tipo: 'resolvido' | 'fechado' | 'aberto', chamadoId: number} | null>(null)
  const [acaoLoading, setAcaoLoading] = useState(false)
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)

  const fetchChamados = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return
    const user = JSON.parse(storedUser)
    
    setLoading(true)
    try {
      // Se for suporte, buscar escalados disponíveis para o seu nível
      const url = user.role === "suporte" 
        ? `/api/chamados/escalados-disponiveis/${user.nivel || 'n1'}`
        : "/api/chamados"
        
      const res = await fetch(url)
      if (!res.ok) throw new Error("Erro ao buscar chamados")
      const data = await res.json()
      setChamados(data)
    } catch (err) {
      console.error(err)
      toast({ title: "Erro", description: "Falha ao carregar chamados", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
    }
    fetchChamados()
  }, [])

  const assumirChamado = async (chamadoId: number) => {
    if (!userData?.id) return
    
    try {
      const res = await fetch(`/api/chamados/${chamadoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          atribuido_a_id: userData.id
        })
      })
      
      if (!res.ok) throw new Error("Erro ao assumir chamado")
      
      toast({ title: "Sucesso", description: "Você assumiu este chamado." })
      fetchChamados()
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao assumir chamado", variant: "destructive" })
    }
  }

  const escalonarChamado = (chamado: any) => {
    setChamadoParaEscalonar(chamado)
    setTecnicoSelecionadoId("")
    
    // Se o usuário for N3, buscar outros técnicos N3 para seleção
    if (userData?.nivel === "n3" && userData?.empresa?.id) {
      fetch(`/api/funcionarios/empresa/${userData.empresa.id}`)
        .then(res => res.json())
        .then(data => {
          // Filtrar por nível n3 e remover o próprio usuário
          const n3s = data.filter((f: any) => f.nivel === "n3" && f.id !== userData.id)
          setTecnicosN3(n3s)
        })
        .catch(err => console.error("Erro ao buscar técnicos N3:", err))
    }
  }

  const escalonarChamadoConfirmado = async () => {
    if (!chamadoParaEscalonar) return
    
    const nivelAtual = userData?.nivel?.toLowerCase() || "n1"
    setEscalonando(true)
    try {
      const payload: any = {
        escalonado_por_nivel: nivelAtual,
        status: "escalado"
      }
      
      // Se tiver técnico selecionado (para o nível N3)
      if (tecnicoSelecionadoId && tecnicoSelecionadoId !== "-1") {
        payload.atribuido_a_id = parseInt(tecnicoSelecionadoId)
      }
      
      const res = await fetch(`/api/chamados/${chamadoParaEscalonar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error("Erro ao escalonar chamado")
      
      toast({ title: "Sucesso", description: "Chamado escalonado com sucesso." })
      setChamadoParaEscalonar(null)
      fetchChamados()
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao escalonar chamado", variant: "destructive" })
    } finally {
      setEscalonando(false)
    }
  }

  const executarAcaoConfirmada = async () => {
    if (!confirmarAcao) return
    
    setAcaoLoading(true)
    try {
      const res = await fetch(`/api/chamados/${confirmarAcao.chamadoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: confirmarAcao.tipo })
      })
      
      if (!res.ok) throw new Error(`Erro ao ${confirmarAcao.tipo === 'aberto' ? 'reabrir' : confirmarAcao.tipo === 'resolvido' ? 'resolver' : 'encerrar'} chamado`)
      
      const mensagens = {
        resolvido: "Chamado marcado como resolvido.",
        fechado: "Chamado encerrado com sucesso.",
        aberto: "Chamado reaberto com sucesso."
      }
      
      toast({ title: "Sucesso", description: mensagens[confirmarAcao.tipo] })
      setConfirmarAcao(null)
      fetchChamados()
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" })
    } finally {
      setAcaoLoading(false)
    }
  }

  const limparFiltros = () => {
    setFiltros({
      numero: "",
      empresa: "",
      prioridade: "",
      status: "",
    })
  }

  const chamadosFiltrados = chamados.filter(c => {
    if (filtros.numero && !c.id.toString().includes(filtros.numero)) return false
    if (filtros.empresa && !c.empresa_nome?.toLowerCase().includes(filtros.empresa.toLowerCase())) return false
    if (filtros.prioridade && c.prioridade !== filtros.prioridade) return false
    if (filtros.status && c.status !== filtros.status) return false
    return true
  })

  const getSlaIndicator = (dataAbertura: string, prioridade: string) => {
    // Lógica simplificada de SLA
    return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1"><Clock className="size-3" /> No prazo</Badge>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Chamados Escalonados</h1>
        <p className="page-description">Pool de chamados escalonados disponíveis para seu nível</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="section-title">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="numero">Número do Ticket</Label>
              <Input
                id="numero"
                placeholder="Ex: 15"
                value={filtros.numero}
                onChange={(e) => setFiltros({ ...filtros, numero: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                placeholder="Nome da empresa"
                value={filtros.empresa}
                onChange={(e) => setFiltros({ ...filtros, empresa: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Prioridade</Label>
              <Select value={filtros.prioridade} onValueChange={(value) => setFiltros({ ...filtros, prioridade: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select value={filtros.status} onValueChange={(value) => setFiltros({ ...filtros, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                  <SelectItem value="escalado">Escalado</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-4">
              <Button className="bg-[#3ba5d8] hover:bg-[#2a8fc2] gap-2" onClick={fetchChamados}>
                <Search className="size-4" />
                Filtrar
              </Button>
              <Button variant="outline" onClick={limparFiltros} className="gap-2">
                <RotateCcw className="size-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Chamados */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-8 animate-spin text-[#3ba5d8]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a3a5c]">
                  <TableHead className="w-[100px] text-center text-white font-semibold py-4">Nº Chamado</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Solicitante</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Equipamento</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Prioridade</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Status</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">SLA</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Data</TableHead>
                  <TableHead className="text-center text-white font-semibold py-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chamadosFiltrados.map((chamado) => (
                  <TableRow key={chamado.id} className="data-table-row">
                    <TableCell className="font-medium text-[#1a3a5c] text-center">CH-{chamado.id}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{chamado.nome_solicitante || chamado.solicitante_nome}</span>
                          {chamado.solicitante_nivel && (
                            <Badge variant="outline" className="h-3 px-1 text-[8px] border-[#3ba5d8]/30 text-[#3ba5d8] font-semibold uppercase">
                              {chamado.solicitante_nivel}
                            </Badge>
                          )}
                        </div>
                        {chamado.email_solicitante && <span className="text-[10px] text-muted-foreground">{chamado.email_solicitante}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">{chamado.equipamento_nome || "N/A"}</span>
                        <span className="text-xs text-muted-foreground">{chamado.equipamento_patrimonio}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${prioridadeColors[chamado.prioridade] || ""} mx-auto`}>
                        {chamado.prioridade ? (chamado.prioridade.charAt(0).toUpperCase() + chamado.prioridade.slice(1)) : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${statusColors[chamado.status] || ""} mx-auto`}>
                        {statusLabels[chamado.status] || chamado.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {getSlaIndicator(chamado.data_abertura, chamado.prioridade)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-center">
                      {formatDate(chamado.data_abertura)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center">
                            <DropdownMenuItem onClick={() => setChamadoSelecionado(chamado)}>
                              <Eye className="size-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            {!chamado.atribuido_a_id && (
                              <DropdownMenuItem onClick={() => assumirChamado(chamado.id)}>
                                <UserPlus className="size-4 mr-2" />
                                Assumir chamado
                              </DropdownMenuItem>
                            )}
                            {chamado.atribuido_a_id === userData?.id && (
                              <DropdownMenuItem onClick={() => escalonarChamado(chamado)}>
                                <RefreshCw className="size-4 mr-2" />
                                Escalonar
                              </DropdownMenuItem>
                            )}
                            {chamado.atribuido_a_id === userData?.id && chamado.status !== "resolvido" && chamado.status !== "fechado" && (
                              <DropdownMenuItem onClick={() => setConfirmarAcao({tipo: 'resolvido', chamadoId: chamado.id})}>
                                <CheckCircle className="size-4 mr-2" />
                                Registrar solução
                              </DropdownMenuItem>
                            )}
                            {chamado.status !== "fechado" && (
                              <DropdownMenuItem onClick={() => setConfirmarAcao({tipo: 'fechado', chamadoId: chamado.id})}>
                                <Lock className="size-4 mr-2" />
                                Encerrar
                              </DropdownMenuItem>
                            )}
                            {(chamado.status === "resolvido" || chamado.status === "fechado" || chamado.status === "cancelado") && (
                              <DropdownMenuItem onClick={() => setConfirmarAcao({tipo: 'aberto', chamadoId: chamado.id})}>
                                <RefreshCw className="size-4 mr-2" />
                                Reabrir chamado
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <Dialog open={!!chamadoSelecionado} onOpenChange={(open) => !open && setChamadoSelecionado(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Detalhes do Chamado CH-{chamadoSelecionado?.id}</DialogTitle>
            <DialogDescription>Informacoes completas do chamado</DialogDescription>
          </DialogHeader>
          {chamadoSelecionado && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Empresa</Label>
                <p className="font-medium">{chamadoSelecionado.empresa_nome}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Solicitante</Label>
                <div className="flex flex-col">
                  <p className="font-medium">{chamadoSelecionado.nome_solicitante || chamadoSelecionado.solicitante_nome || "N/A"}</p>
                  {chamadoSelecionado.email_solicitante && (
                    <p className="text-xs text-muted-foreground">{chamadoSelecionado.email_solicitante}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Equipamento</Label>
                <p className="font-medium">{chamadoSelecionado.equipamento_nome || "N/A"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Patrimônio</Label>
                <p className="font-medium">{chamadoSelecionado.equipamento_patrimonio || "N/A"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Prioridade</Label>
                <Badge variant="outline" className={prioridadeColors[chamadoSelecionado.prioridade] || ""}>
                  {chamadoSelecionado.prioridade ? (chamadoSelecionado.prioridade.charAt(0).toUpperCase() + chamadoSelecionado.prioridade.slice(1)) : "N/A"}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Status</Label>
                <Badge variant="outline" className={statusColors[chamadoSelecionado.status] || ""}>
                  {statusLabels[chamadoSelecionado.status] || chamadoSelecionado.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Responsável</Label>
                <p className="font-medium text-[#3ba5d8]">{chamadoSelecionado.atribuido_a_nome || "Aguardando Atribuição"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Data de Abertura</Label>
                <p className="font-medium">
                  {formatDate(chamadoSelecionado.data_abertura)}
                </p>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Titulo</Label>
                <p className="font-medium">{chamadoSelecionado.titulo}</p>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Descricao</Label>
                <p className="font-medium bg-gray-50 p-3 rounded-lg">{chamadoSelecionado.descricao}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Escalonamento */}
      <Dialog open={!!chamadoParaEscalonar} onOpenChange={(open) => !open && setChamadoParaEscalonar(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1a3a5c]">
              <RefreshCw className="size-5 text-[#3ba5d8]" />
              Escalonar Chamado CH-{chamadoParaEscalonar?.id}
            </DialogTitle>
            <DialogDescription>
              Confirme o escalonamento deste chamado aberto por <span className="font-bold text-[#1a3a5c]">{chamadoParaEscalonar?.nome_solicitante || chamadoParaEscalonar?.solicitante_nome}</span> para o próximo nível de suporte.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nível Atual</span>
                <Badge variant="outline" className="bg-white text-[#1a3a5c] border-[#1a3a5c]/20 px-3 py-1">
                  {userData?.nivel?.toUpperCase() || "N1"}
                </Badge>
              </div>
              
              <div className="flex flex-col items-center">
                <ArrowRight className="size-5 text-[#3ba5d8] animate-pulse" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Próximo Nível</span>
                <Badge className="bg-[#3ba5d8] text-white border-none px-3 py-1">
                  {(userData?.nivel?.toLowerCase() || "n1") === "n1" ? "N2" : "N3"}
                </Badge>
              </div>
            </div>

            {/* Se for N3, mostrar seleção de técnico */}
            {(userData?.nivel?.toLowerCase() || "n1") === "n3" && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Label className="text-sm font-bold text-[#1a3a5c] flex items-center gap-2">
                  <UserPlus className="size-4" />
                  Selecionar Técnico (Nível N3)
                </Label>
                <Select value={tecnicoSelecionadoId} onValueChange={setTecnicoSelecionadoId}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Escolha um técnico ou aleatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">
                      <div className="flex items-center gap-2">
                        <Shuffle className="size-4" />
                        Aleatório (Outro N3)
                      </div>
                    </SelectItem>
                    {tecnicosN3.map((f) => (
                      <SelectItem key={f.id} value={f.id.toString()}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Como você já está no nível máximo (N3), o escalonamento será feito para outro analista do mesmo nível.
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full shrink-0">
                  <Shuffle className="size-4 text-[#3ba5d8]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a3a5c]">
                    {tecnicoSelecionadoId && tecnicoSelecionadoId !== "-1" ? "Atribuição Direta" : "Atribuição Aleatória"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tecnicoSelecionadoId && tecnicoSelecionadoId !== "-1" 
                      ? "O chamado será encaminhado diretamente para o técnico selecionado." 
                      : "O sistema irá selecionar automaticamente um funcionário disponível do próximo nível para assumir este chamado."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full shrink-0">
                  <AlertCircle className="size-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a3a5c]">Visibilidade</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Após o escalonamento, o chamado aparecerá no pool de todos os funcionários do novo nível até ser aceito.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-4">
            <Button variant="outline" onClick={() => setChamadoParaEscalonar(null)} disabled={escalonando}>
              Cancelar
            </Button>
            <Button 
              className="bg-[#3ba5d8] hover:bg-[#2a8fc2] text-white gap-2 px-6" 
              onClick={escalonarChamadoConfirmado}
              disabled={escalonando}
            >
              {escalonando ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Confirmar Escalonamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Ação (Resolver/Fechar/Reabrir) */}
      <Dialog open={!!confirmarAcao} onOpenChange={(open) => !open && setConfirmarAcao(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1a3a5c]">
              {confirmarAcao?.tipo === 'resolvido' && <CheckCircle className="size-5 text-green-600" />}
              {confirmarAcao?.tipo === 'fechado' && <Lock className="size-5 text-gray-600" />}
              {confirmarAcao?.tipo === 'aberto' && <RefreshCw className="size-5 text-blue-600" />}
              {confirmarAcao?.tipo === 'resolvido' ? 'Resolver Chamado' : confirmarAcao?.tipo === 'fechado' ? 'Encerrar Chamado' : 'Reabrir Chamado'}
            </DialogTitle>
            <DialogDescription>
              {confirmarAcao?.tipo === 'resolvido' && (
                <>Tem certeza que deseja marcar como resolvido o chamado de <span className="font-bold text-[#1a3a5c]">{chamadosFiltrados.find(c => c.id === confirmarAcao.chamadoId)?.nome_solicitante || chamadosFiltrados.find(c => c.id === confirmarAcao.chamadoId)?.solicitante_nome}</span>?</>
              )}
              {confirmarAcao?.tipo === 'fechado' && (
                <>Tem certeza que deseja encerrar definitivamente o chamado de <span className="font-bold text-[#1a3a5c]">{chamadosFiltrados.find(c => c.id === confirmarAcao.chamadoId)?.nome_solicitante || chamadosFiltrados.find(c => c.id === confirmarAcao.chamadoId)?.solicitante_nome}</span>?</>
              )}
              {confirmarAcao?.tipo === 'aberto' && (
                <>Deseja reabrir o chamado de <span className="font-bold text-[#1a3a5c]">{chamadosFiltrados.find(c => c.id === confirmarAcao.chamadoId)?.nome_solicitante || chamadosFiltrados.find(c => c.id === confirmarAcao.chamadoId)?.solicitante_nome}</span> para novo atendimento?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-4">
            <Button variant="outline" onClick={() => setConfirmarAcao(null)} disabled={acaoLoading}>
              Cancelar
            </Button>
            <Button 
              className={`${confirmarAcao?.tipo === 'resolvido' ? 'bg-green-600 hover:bg-green-700' : confirmarAcao?.tipo === 'fechado' ? 'bg-gray-700 hover:bg-gray-800' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6`}
              onClick={executarAcaoConfirmada}
              disabled={acaoLoading}
            >
              {acaoLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
