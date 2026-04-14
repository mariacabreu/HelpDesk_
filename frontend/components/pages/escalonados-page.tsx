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
import { Search, RotateCcw, Eye, Clock, Loader2, RefreshCw, CheckCircle, Lock, MoreHorizontal, Shuffle, ArrowRight, AlertCircle } from "lucide-react"
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
  resolvido: "bg-green-100 text-green-700 border-green-200",
  escalado: "bg-purple-100 text-purple-700 border-purple-200",
  escalonamento_aprovado: "bg-indigo-100 text-indigo-700 border-indigo-200",
  cancelado: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_atendimento: "Em Atendimento",
  resolvido: "Resolvido",
  escalado: "Escalonado",
  escalonamento_aprovado: "Escalonamento Aprovado",
  cancelado: "Cancelado",
}

export function EscalonadosPage() {
  const [filtros, setFiltros] = useState({
    periodo: "",
    prioridade: "",
  })
  const [chamados, setChamados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [detalhesAberto, setDetalhesAberto] = useState<any | null>(null)
  const [chamadoParaEscalonar, setChamadoParaEscalonar] = useState<any | null>(null)
  const [escalonando, setEscalonando] = useState(false)
  const [tecnicosN3, setTecnicosN3] = useState<any[]>([])
  const [tecnicoSelecionadoId, setTecnicoSelecionadoId] = useState<string>("")
  const [confirmarAcao, setConfirmarAcao] = useState<{tipo: 'resolvido' | 'fechado' | 'aberto', chamadoId: number} | null>(null)
  const [acaoLoading, setAcaoLoading] = useState(false)
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)

  const fetchEscalonados = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return
    
    const user = JSON.parse(storedUser)
    setUserData(user)
    
    setLoading(true)
    try {
      // Buscar chamados atribuídos a este técnico
      const res = await fetch(`/api/chamados/atribuido/${user.id}`)
      if (!res.ok) throw new Error("Erro ao buscar chamados")
      const data = await res.json()
      setChamados(data)
    } catch (err) {
      console.error(err)
      toast({ title: "Erro", description: "Falha ao carregar chamados escalonados", variant: "destructive" })
    } finally {
      setLoading(false)
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
      fetchEscalonados()
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao escalonar chamado", variant: "destructive" })
    } finally {
      setEscalonando(false)
    }
  }

  useEffect(() => {
    fetchEscalonados()
  }, [])

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
      fetchEscalonados()
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" })
    } finally {
      setAcaoLoading(false)
    }
  }

  const limparFiltros = () => {
    setFiltros({
      periodo: "",
      prioridade: "",
    })
  }

  const chamadosFiltrados = chamados.filter(c => {
    if (filtros.prioridade && c.prioridade !== filtros.prioridade) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Meus Atendimentos</h1>
        <p className="page-description">Chamados que estão sob sua responsabilidade</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="section-title">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="periodo" className="text-sm font-medium">Período</Label>
              <Input
                id="periodo"
                type="date"
                value={filtros.periodo}
                onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Prioridade</Label>
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

            <div className="flex items-end gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={fetchEscalonados}>
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

      {/* Tabela de Chamados Atribuídos */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a3a5c]">
                  <TableHead className="text-white font-semibold w-[100px] text-center py-4">ID</TableHead>
                  <TableHead className="text-white font-semibold text-center py-4">Solicitante</TableHead>
                  <TableHead className="text-white font-semibold text-center py-4">Chamado</TableHead>
                  <TableHead className="text-white font-semibold text-center py-4">Prioridade</TableHead>
                  <TableHead className="text-white font-semibold text-center py-4">Status</TableHead>
                  <TableHead className="text-white font-semibold text-center py-4">Data</TableHead>
                  <TableHead className="text-white font-semibold text-center py-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chamadosFiltrados.length > 0 ? (
                  chamadosFiltrados.map((c) => (
                    <TableRow key={c.id} className="data-table-row">
                      <TableCell className="font-medium text-primary text-center border-border">CH-{c.id}</TableCell>
                      <TableCell className="text-center border-border">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{c.nome_solicitante || c.solicitante_nome || "N/A"}</span>
                            {c.solicitante_nivel && (
                              <Badge variant="outline" className="h-4 px-1 text-[10px] border-primary/30 text-primary font-semibold uppercase">
                                {c.solicitante_nivel}
                              </Badge>
                            )}
                          </div>
                          {c.email_solicitante && <span className="text-[10px] text-muted-foreground">{c.email_solicitante}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-center border-border">{c.titulo}</TableCell>
                      <TableCell className="text-center border-border">
                        <Badge variant="outline" className={`${prioridadeColors[c.prioridade] || ""} mx-auto`}>
                          {c.prioridade ? (c.prioridade.charAt(0).toUpperCase() + c.prioridade.slice(1)) : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center border-border">
                        <Badge variant="outline" className={`${statusColors[c.status] || ""} mx-auto`}>
                          {statusLabels[c.status] || c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-center border-border">
                        {formatDate(c.data_abertura)}
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
                              <DropdownMenuItem onClick={() => setDetalhesAberto(c)}>
                                <Eye className="size-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => escalonarChamado(c)}>
                                <RefreshCw className="size-4 mr-2" />
                                Escalonar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setConfirmarAcao({tipo: 'resolvido', chamadoId: c.id})}>
                                <CheckCircle className="size-4 mr-2" />
                                Registrar solução
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setConfirmarAcao({tipo: 'fechado', chamadoId: c.id})}>
                                <Lock className="size-4 mr-2" />
                                Encerrar
                              </DropdownMenuItem>
                              {(c.status === "resolvido" || c.status === "fechado" || c.status === "cancelado") && (
                                <DropdownMenuItem onClick={() => setConfirmarAcao({tipo: 'aberto', chamadoId: c.id})}>
                                  <RefreshCw className="size-4 mr-2" />
                                  Reabrir chamado
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum chamado atribuído encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={!!detalhesAberto} onOpenChange={(open) => !open && setDetalhesAberto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Detalhes do Chamado CH-{detalhesAberto?.id}</DialogTitle>
            <DialogDescription>Informações completas do chamado escalonado</DialogDescription>
          </DialogHeader>
          
          {detalhesAberto && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cliente / Empresa</Label>
                <p className="font-medium">{detalhesAberto.empresa_nome || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Solicitante</Label>
                <div className="flex flex-col">
                  <p className="font-medium">{detalhesAberto.nome_solicitante || detalhesAberto.solicitante_nome || "N/A"}</p>
                  {detalhesAberto.email_solicitante && (
                    <p className="text-xs text-muted-foreground">{detalhesAberto.email_solicitante}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Prioridade</Label>
                <Badge variant="outline" className={prioridadeColors[detalhesAberto.prioridade] || ""}>
                  {detalhesAberto.prioridade}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Badge variant="outline" className={statusColors[detalhesAberto.status] || ""}>
                  {statusLabels[detalhesAberto.status] || detalhesAberto.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Data de Abertura</Label>
                <p className="font-medium">
                  {formatDate(detalhesAberto.data_abertura)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Equipamento</Label>
                <p className="font-medium">{detalhesAberto.equipamento_nome || "N/A"}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Título</Label>
                <p className="font-medium">{detalhesAberto.titulo}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <div className="bg-gray-50 p-3 rounded-lg text-sm border">
                  {detalhesAberto.descricao}
                </div>
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
              {confirmarAcao?.tipo === 'resolvido' && "Tem certeza que deseja marcar este chamado como resolvido?"}
              {confirmarAcao?.tipo === 'fechado' && "Tem certeza que deseja encerrar definitivamente este chamado?"}
              {confirmarAcao?.tipo === 'aberto' && "Deseja reabrir este chamado para novo atendimento?"}
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
