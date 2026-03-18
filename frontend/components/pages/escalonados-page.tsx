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
import { Search, RotateCcw, Eye, History, RefreshCw, CheckCircle, MoreHorizontal, ArrowUpRight } from "lucide-react"

// Dados mock de chamados escalonados
const escalonadosMock = [
  {
    id: "CHM-002",
    chamado: "Servidor de backup fora do ar",
    cliente: "Banco Central",
    prioridade: "critica",
    nivelAtual: "N3",
    escalonadoDe: "N2",
    data: "2024-01-15 08:30",
    status: "em_atendimento",
    tecnicoResponsavel: "Carlos Mendes",
    historico: [
      { nivel: "N1", tecnico: "Joao Silva", data: "2024-01-15 08:00", acao: "Abertura do chamado" },
      { nivel: "N2", tecnico: "Maria Santos", data: "2024-01-15 08:15", acao: "Escalonado - Problema complexo de hardware" },
      { nivel: "N3", tecnico: "Carlos Mendes", data: "2024-01-15 08:30", acao: "Escalonado - Necessario acesso fisico ao servidor" },
    ]
  },
  {
    id: "CHM-004",
    chamado: "Tela azul frequente ao usar software contabil",
    cliente: "Escritorio XYZ",
    prioridade: "media",
    nivelAtual: "N2",
    escalonadoDe: "N1",
    data: "2024-01-15 11:00",
    status: "em_atendimento",
    tecnicoResponsavel: "Maria Santos",
    historico: [
      { nivel: "N1", tecnico: "Pedro Costa", data: "2024-01-15 10:15", acao: "Abertura do chamado" },
      { nivel: "N2", tecnico: "Maria Santos", data: "2024-01-15 11:00", acao: "Escalonado - Conflito de drivers" },
    ]
  },
  {
    id: "CHM-008",
    chamado: "Falha de autenticacao no Active Directory",
    cliente: "Tech Solutions",
    prioridade: "alta",
    nivelAtual: "N3",
    escalonadoDe: "N1",
    data: "2024-01-14 16:45",
    status: "em_atendimento",
    tecnicoResponsavel: "Carlos Mendes",
    historico: [
      { nivel: "N1", tecnico: "Ana Oliveira", data: "2024-01-14 14:30", acao: "Abertura do chamado" },
      { nivel: "N2", tecnico: "Maria Santos", data: "2024-01-14 15:30", acao: "Escalonado - Problema de GPO" },
      { nivel: "N3", tecnico: "Carlos Mendes", data: "2024-01-14 16:45", acao: "Escalonado - Requer acesso ao domain controller" },
    ]
  },
  {
    id: "CHM-012",
    chamado: "VPN nao conecta em notebooks remotos",
    cliente: "Hospital Regional",
    prioridade: "alta",
    nivelAtual: "N2",
    escalonadoDe: "N1",
    data: "2024-01-15 09:00",
    status: "aberto",
    tecnicoResponsavel: "Pedro Costa",
    historico: [
      { nivel: "N1", tecnico: "Joao Silva", data: "2024-01-15 08:30", acao: "Abertura do chamado" },
      { nivel: "N2", tecnico: "Pedro Costa", data: "2024-01-15 09:00", acao: "Escalonado - Configuracao de firewall" },
    ]
  },
]

const prioridadeColors: Record<string, string> = {
  baixa: "bg-emerald-100 text-emerald-700 border-emerald-200",
  media: "bg-amber-100 text-amber-700 border-amber-200",
  alta: "bg-orange-100 text-orange-700 border-orange-200",
  critica: "bg-red-100 text-red-700 border-red-200",
}

const nivelColors: Record<string, string> = {
  N1: "bg-blue-100 text-blue-700 border-blue-200",
  N2: "bg-purple-100 text-purple-700 border-purple-200",
  N3: "bg-red-100 text-red-700 border-red-200",
}

const statusColors: Record<string, string> = {
  aberto: "bg-blue-100 text-blue-700 border-blue-200",
  em_atendimento: "bg-yellow-100 text-yellow-700 border-yellow-200",
  resolvido: "bg-green-100 text-green-700 border-green-200",
}

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_atendimento: "Em Atendimento",
  resolvido: "Resolvido",
}

export function EscalonadosPage() {
  const [filtros, setFiltros] = useState({
    periodo: "",
    nivelOrigem: "",
    nivelAtual: "",
    prioridade: "",
    tecnico: "",
  })
  const [historicoAberto, setHistoricoAberto] = useState<typeof escalonadosMock[0] | null>(null)
  const [detalhesAberto, setDetalhesAberto] = useState<typeof escalonadosMock[0] | null>(null)

  const limparFiltros = () => {
    setFiltros({
      periodo: "",
      nivelOrigem: "",
      nivelAtual: "",
      prioridade: "",
      tecnico: "",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Chamados Escalonados</h1>
        <p className="text-muted-foreground">Chamados que foram transferidos entre niveis de suporte</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
              <Label>Nivel de Origem</Label>
              <Select value={filtros.nivelOrigem} onValueChange={(value) => setFiltros({ ...filtros, nivelOrigem: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N1">N1</SelectItem>
                  <SelectItem value="N2">N2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Nivel Atual</Label>
              <Select value={filtros.nivelAtual} onValueChange={(value) => setFiltros({ ...filtros, nivelAtual: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N2">N2</SelectItem>
                  <SelectItem value="N3">N3</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="tecnico">Tecnico Responsavel</Label>
              <Input
                id="tecnico"
                placeholder="Nome do tecnico"
                value={filtros.tecnico}
                onChange={(e) => setFiltros({ ...filtros, tecnico: e.target.value })}
              />
            </div>

            <div className="flex items-end gap-2">
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

      {/* Tabela de Chamados Escalonados */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1a3a5c]/5">
                <TableHead className="font-semibold text-[#1a3a5c]">ID</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Chamado</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Cliente</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Prioridade</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Nivel Atual</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Escalonado de</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Data</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Status</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c] text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalonadosMock.map((chamado) => (
                <TableRow key={chamado.id} className="hover:bg-[#3ba5d8]/5">
                  <TableCell className="font-medium text-[#1a3a5c]">{chamado.id}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="line-clamp-2 text-sm">{chamado.chamado}</span>
                  </TableCell>
                  <TableCell>{chamado.cliente}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={prioridadeColors[chamado.prioridade]}>
                      {chamado.prioridade.charAt(0).toUpperCase() + chamado.prioridade.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={nivelColors[chamado.nivelAtual]}>
                      {chamado.nivelAtual}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={nivelColors[chamado.escalonadoDe]}>
                        {chamado.escalonadoDe}
                      </Badge>
                      <ArrowUpRight className="size-3 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{chamado.data}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[chamado.status]}>
                      {statusLabels[chamado.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetalhesAberto(chamado)}>
                          <Eye className="size-4 mr-2" />
                          Visualizar detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setHistoricoAberto(chamado)}>
                          <History className="size-4 mr-2" />
                          Ver historico
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="size-4 mr-2" />
                          Escalonar novamente
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="size-4 mr-2" />
                          Finalizar chamado
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

      {/* Modal de Detalhes */}
      <Dialog open={!!detalhesAberto} onOpenChange={(open) => !open && setDetalhesAberto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Detalhes do Chamado {detalhesAberto?.id}</DialogTitle>
            <DialogDescription>Informacoes completas do chamado escalonado</DialogDescription>
          </DialogHeader>
          {detalhesAberto && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Descricao do Chamado</Label>
                <p className="font-medium">{detalhesAberto.chamado}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Cliente</Label>
                <p className="font-medium">{detalhesAberto.cliente}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Tecnico Responsavel</Label>
                <p className="font-medium">{detalhesAberto.tecnicoResponsavel}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Prioridade</Label>
                <Badge variant="outline" className={prioridadeColors[detalhesAberto.prioridade]}>
                  {detalhesAberto.prioridade.charAt(0).toUpperCase() + detalhesAberto.prioridade.slice(1)}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Nivel Atual</Label>
                <Badge variant="outline" className={nivelColors[detalhesAberto.nivelAtual]}>
                  {detalhesAberto.nivelAtual}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Status</Label>
                <Badge variant="outline" className={statusColors[detalhesAberto.status]}>
                  {statusLabels[detalhesAberto.status]}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">Data de Escalonamento</Label>
                <p className="font-medium">{detalhesAberto.data}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico */}
      <Dialog open={!!historicoAberto} onOpenChange={(open) => !open && setHistoricoAberto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Historico de Escalonamento - {historicoAberto?.id}</DialogTitle>
            <DialogDescription>Linha do tempo do chamado</DialogDescription>
          </DialogHeader>
          {historicoAberto && (
            <div className="py-4">
              <div className="relative">
                {historicoAberto.historico.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`size-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        item.nivel === "N1" ? "bg-blue-500" : item.nivel === "N2" ? "bg-purple-500" : "bg-red-500"
                      }`}>
                        {item.nivel}
                      </div>
                      {index < historicoAberto.historico.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{item.tecnico}</p>
                        <span className="text-xs text-muted-foreground">{item.data}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.acao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
