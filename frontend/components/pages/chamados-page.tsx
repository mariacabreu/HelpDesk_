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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, RotateCcw, Eye, UserPlus, RefreshCw, CheckCircle, Lock, MoreHorizontal, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  resolvido: "bg-green-100 text-green-700 border-green-200",
  fechado: "bg-gray-100 text-gray-700 border-gray-200",
  cancelado: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_atendimento: "Em Atendimento",
  escalado: "Escalonado",
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
      setUserData(JSON.parse(storedUser))
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
          atribuido_a_id: userData.id,
          status: "em_atendimento"
        })
      })
      
      if (!res.ok) throw new Error("Erro ao assumir chamado")
      
      toast({ title: "Sucesso", description: "Você assumiu este chamado." })
      fetchChamados()
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao assumir chamado", variant: "destructive" })
    }
  }

  const escalonarChamado = async (chamadoId: number) => {
    if (!userData?.nivel) return
    
    try {
      const res = await fetch(`/api/chamados/${chamadoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalonado_por_nivel: userData.nivel,
          atribuido_a_id: null, // Volta para o pool
          status: "escalado"
        })
      })
      
      if (!res.ok) throw new Error("Erro ao escalonar chamado")
      
      toast({ title: "Sucesso", description: "Chamado escalonado com sucesso." })
      fetchChamados()
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao escalonar chamado", variant: "destructive" })
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
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Chamados Escalonados</h1>
        <p className="text-muted-foreground">Pool de chamados escalonados disponíveis para seu nível</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="numero">Numero do Ticket</Label>
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
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Critica</SelectItem>
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
                <TableRow className="bg-[#1a3a5c]/5">
                  <TableHead className="font-semibold text-[#1a3a5c]">N Chamado</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Empresa</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Equipamento</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Prioridade</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Status</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">SLA</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Data/Hora</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c] text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chamadosFiltrados.map((chamado) => (
                  <TableRow key={chamado.id} className="hover:bg-[#3ba5d8]/5">
                    <TableCell className="font-medium text-[#1a3a5c]">CH-{chamado.id}</TableCell>
                    <TableCell>{chamado.empresa_nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{chamado.equipamento_nome || "N/A"}</span>
                        <span className="text-xs text-muted-foreground">{chamado.equipamento_patrimonio}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={prioridadeColors[chamado.prioridade] || ""}>
                        {chamado.prioridade ? (chamado.prioridade.charAt(0).toUpperCase() + chamado.prioridade.slice(1)) : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[chamado.status] || ""}>
                        {statusLabels[chamado.status] || chamado.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getSlaIndicator(chamado.data_abertura, chamado.prioridade)}</TableCell>
                    <TableCell className="text-sm">{new Date(chamado.data_abertura).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                            <DropdownMenuItem onClick={() => escalonarChamado(chamado.id)}>
                              <RefreshCw className="size-4 mr-2" />
                              Escalonar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <CheckCircle className="size-4 mr-2" />
                            Registrar solucao
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Lock className="size-4 mr-2" />
                            Encerrar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                <p className="font-medium">{chamadoSelecionado.solicitante_nome}</p>
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
                <p className="font-medium">{new Date(chamadoSelecionado.data_abertura).toLocaleString()}</p>
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
    </div>
  )
}
