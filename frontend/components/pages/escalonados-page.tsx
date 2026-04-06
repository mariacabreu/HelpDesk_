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
import { Search, RotateCcw, Eye, Clock, Loader2, RefreshCw, CheckCircle, Lock, MoreHorizontal } from "lucide-react"
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
  resolvido: "bg-green-100 text-green-700 border-green-200",
  escalado: "bg-purple-100 text-purple-700 border-purple-200",
  cancelado: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_atendimento: "Em Atendimento",
  resolvido: "Resolvido",
  escalado: "Escalonado",
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
      fetchEscalonados()
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao escalonar chamado", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchEscalonados()
  }, [])

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
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Meus Atendimentos</h1>
        <p className="text-muted-foreground">Chamados que estão sob sua responsabilidade</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="periodo">Periodo</Label>
              <Input
                id="periodo"
                type="date"
                value={filtros.periodo}
                onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
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

            <div className="flex items-end gap-2">
              <Button className="bg-[#3ba5d8] hover:bg-[#2a8fc2] gap-2" onClick={fetchEscalonados}>
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
              <Loader2 className="size-8 animate-spin text-[#3ba5d8]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a3a5c]/5">
                  <TableHead className="font-semibold text-[#1a3a5c]">ID</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Chamado</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Cliente</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Prioridade</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Status</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c]">Data</TableHead>
                  <TableHead className="font-semibold text-[#1a3a5c] text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chamadosFiltrados.length > 0 ? (
                  chamadosFiltrados.map((c) => (
                    <TableRow key={c.id} className="hover:bg-[#3ba5d8]/5">
                      <TableCell className="font-medium text-[#1a3a5c]">CH-{c.id}</TableCell>
                      <TableCell className="font-medium">{c.titulo}</TableCell>
                      <TableCell>{c.empresa_nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={prioridadeColors[c.prioridade] || ""}>
                          {c.prioridade ? (c.prioridade.charAt(0).toUpperCase() + c.prioridade.slice(1)) : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[c.status] || ""}>
                          {statusLabels[c.status] || c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(c.data_abertura).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetalhesAberto(c)}>
                              <Eye className="size-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => escalonarChamado(c.id)}>
                              <RefreshCw className="size-4 mr-2" />
                              Escalonar
                            </DropdownMenuItem>
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
                <p className="font-medium">{detalhesAberto.empresa_nome}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Solicitante</Label>
                <p className="font-medium">{detalhesAberto.solicitante_nome}</p>
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
                <p className="font-medium">{new Date(detalhesAberto.data_abertura).toLocaleString()}</p>
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
    </div>
  )
}
