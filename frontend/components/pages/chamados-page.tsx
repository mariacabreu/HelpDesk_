"use client"

import { useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, RotateCcw, Eye, UserPlus, RefreshCw, CheckCircle, Lock, MoreHorizontal, Clock, AlertTriangle } from "lucide-react"

// Dados mock de chamados
const chamadosMock = [
  {
    id: "CHM-001",
    empresa: "Tech Solutions",
    equipamento: "Desktop Dell Optiplex",
    ip: "192.168.1.45",
    prioridade: "alta",
    status: "aberto",
    sla: 2,
    slaTotal: 4,
    dataAbertura: "2024-01-15 09:30",
    descricao: "Computador não liga após queda de energia",
    imagem: null,
  },
  {
    id: "CHM-002",
    empresa: "Banco Central",
    equipamento: "Servidor HP ProLiant",
    ip: "10.0.0.10",
    prioridade: "critica",
    status: "em_atendimento",
    sla: 0.5,
    slaTotal: 2,
    dataAbertura: "2024-01-15 08:00",
    descricao: "Servidor de backup fora do ar",
    imagem: null,
  },
  {
    id: "CHM-003",
    empresa: "Loja ABC",
    equipamento: "Impressora Epson L3150",
    ip: "192.168.2.20",
    prioridade: "baixa",
    status: "aberto",
    sla: 6,
    slaTotal: 8,
    dataAbertura: "2024-01-14 14:00",
    descricao: "Impressora não puxa papel corretamente",
    imagem: null,
  },
  {
    id: "CHM-004",
    empresa: "Escritório XYZ",
    equipamento: "Notebook Lenovo ThinkPad",
    ip: "192.168.1.78",
    prioridade: "media",
    status: "escalado",
    sla: 3,
    slaTotal: 6,
    dataAbertura: "2024-01-15 10:15",
    descricao: "Tela azul frequente ao usar software contabil",
    imagem: null,
  },
  {
    id: "CHM-005",
    empresa: "Hospital Regional",
    equipamento: "Roteador Cisco",
    ip: "10.10.0.1",
    prioridade: "critica",
    status: "resolvido",
    sla: 1,
    slaTotal: 1,
    dataAbertura: "2024-01-14 23:45",
    descricao: "Rede do setor de emergencia fora do ar",
    imagem: null,
  },
]

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
}

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_atendimento: "Em Atendimento",
  escalado: "Escalado",
  resolvido: "Resolvido",
  fechado: "Fechado",
}

export function ChamadosPage() {
  const [filtros, setFiltros] = useState({
    numero: "",
    empresa: "",
    prioridade: "",
    status: "",
  })
  const [chamados, setChamados] = useState(chamadosMock)
  const [chamadoSelecionado, setChamadoSelecionado] = useState<typeof chamadosMock[0] | null>(null)

  const limparFiltros = () => {
    setFiltros({
      numero: "",
      empresa: "",
      prioridade: "",
      status: "",
    })
  }

  const getSlaIndicator = (sla: number, slaTotal: number) => {
    const porcentagem = (sla / slaTotal) * 100
    if (porcentagem <= 25) {
      return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 gap-1"><AlertTriangle className="size-3" /> {sla}h restantes</Badge>
    } else if (porcentagem <= 50) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 gap-1"><Clock className="size-3" /> {sla}h restantes</Badge>
    }
    return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1"><Clock className="size-3" /> {sla}h restantes</Badge>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Listar Chamados</h1>
        <p className="text-muted-foreground">Gerencie todos os chamados de suporte</p>
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
                placeholder="CHM-001"
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
              <Button className="bg-[#3ba5d8] hover:bg-[#2a8fc2] gap-2">
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
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1a3a5c]/5">
                <TableHead className="font-semibold text-[#1a3a5c]">N Chamado</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Empresa</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Equipamento / IP</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Prioridade</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Status</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">SLA</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Data/Hora</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Descricao</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c] text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chamados.map((chamado) => (
                <TableRow key={chamado.id} className="hover:bg-[#3ba5d8]/5">
                  <TableCell className="font-medium text-[#1a3a5c]">{chamado.id}</TableCell>
                  <TableCell>{chamado.empresa}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{chamado.equipamento}</span>
                      <span className="text-xs text-muted-foreground">{chamado.ip}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={prioridadeColors[chamado.prioridade]}>
                      {chamado.prioridade.charAt(0).toUpperCase() + chamado.prioridade.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[chamado.status]}>
                      {statusLabels[chamado.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{getSlaIndicator(chamado.sla, chamado.slaTotal)}</TableCell>
                  <TableCell className="text-sm">{chamado.dataAbertura}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{chamado.descricao}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setChamadoSelecionado(chamado); }}>
                              <Eye className="size-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                          </DialogTrigger>
                        </Dialog>
                        <DropdownMenuItem>
                          <UserPlus className="size-4 mr-2" />
                          Assumir chamado
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <Dialog open={!!chamadoSelecionado} onOpenChange={(open) => !open && setChamadoSelecionado(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Detalhes do Chamado {chamadoSelecionado?.id}</DialogTitle>
            <DialogDescription>Informacoes completas do chamado</DialogDescription>
          </DialogHeader>
          {chamadoSelecionado && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Empresa</Label>
                <p className="font-medium">{chamadoSelecionado.empresa}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Equipamento</Label>
                <p className="font-medium">{chamadoSelecionado.equipamento}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">IP</Label>
                <p className="font-medium">{chamadoSelecionado.ip}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Prioridade</Label>
                <Badge variant="outline" className={prioridadeColors[chamadoSelecionado.prioridade]}>
                  {chamadoSelecionado.prioridade.charAt(0).toUpperCase() + chamadoSelecionado.prioridade.slice(1)}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Status</Label>
                <Badge variant="outline" className={statusColors[chamadoSelecionado.status]}>
                  {statusLabels[chamadoSelecionado.status]}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Data de Abertura</Label>
                <p className="font-medium">{chamadoSelecionado.dataAbertura}</p>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Descricao</Label>
                <p className="font-medium">{chamadoSelecionado.descricao}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
