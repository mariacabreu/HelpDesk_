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
import { Search, RotateCcw, Info, Plus } from "lucide-react"

// Dados mock de equipamentos
const equipamentosMock = [
  {
    id: "1",
    patrimonio: "PAT-001",
    empresa: "Tech Solutions",
    tipo: "Computador",
    marca: "Dell",
    modelo: "Optiplex 7090",
    numSerie: "SN123456789",
    localizacao: "Sala TI - Rack 01",
    status: "ativo",
    chamadosVinculados: 3,
    ultimaManutencao: "2024-01-10",
    ip: "192.168.1.45",
    so: "Windows 11 Pro",
    mac: "00:1A:2B:3C:4D:5E",
    dataAquisicao: "2023-06-15",
    garantiaInicio: "2023-06-15",
    garantiaFim: "2026-06-15",
  },
  {
    id: "2",
    patrimonio: "PAT-002",
    empresa: "Banco Central",
    tipo: "Servidor",
    marca: "HP",
    modelo: "ProLiant DL380",
    numSerie: "SN987654321",
    localizacao: "Datacenter - Rack A01",
    status: "ativo",
    chamadosVinculados: 1,
    ultimaManutencao: "2024-01-05",
    ip: "10.0.0.10",
    so: "Windows Server 2022",
    mac: "00:1B:2C:3D:4E:5F",
    dataAquisicao: "2022-03-20",
    garantiaInicio: "2022-03-20",
    garantiaFim: "2025-03-20",
  },
  {
    id: "3",
    patrimonio: "PAT-003",
    empresa: "Loja ABC",
    tipo: "Impressora",
    marca: "Epson",
    modelo: "L3150",
    numSerie: "SN456789123",
    localizacao: "Recepcao",
    status: "manutencao",
    chamadosVinculados: 5,
    ultimaManutencao: "2024-01-14",
    ip: "192.168.2.20",
    so: "N/A",
    mac: "00:1C:2D:3E:4F:60",
    dataAquisicao: "2023-01-10",
    garantiaInicio: "2023-01-10",
    garantiaFim: "2024-01-10",
  },
  {
    id: "4",
    patrimonio: "PAT-004",
    empresa: "Escritorio XYZ",
    tipo: "Notebook",
    marca: "Lenovo",
    modelo: "ThinkPad T14",
    numSerie: "SN321654987",
    localizacao: "Diretoria",
    status: "ativo",
    chamadosVinculados: 2,
    ultimaManutencao: "2023-12-20",
    ip: "192.168.1.78",
    so: "Windows 11 Pro",
    mac: "00:1D:2E:3F:40:51",
    dataAquisicao: "2023-08-01",
    garantiaInicio: "2023-08-01",
    garantiaFim: "2026-08-01",
  },
  {
    id: "5",
    patrimonio: "PAT-005",
    empresa: "Hospital Regional",
    tipo: "Roteador",
    marca: "Cisco",
    modelo: "ISR 4321",
    numSerie: "SN654987321",
    localizacao: "Setor Emergencia - Sala de Rede",
    status: "inativo",
    chamadosVinculados: 8,
    ultimaManutencao: "2024-01-14",
    ip: "10.10.0.1",
    so: "Cisco IOS XE",
    mac: "00:1E:2F:30:41:52",
    dataAquisicao: "2021-05-10",
    garantiaInicio: "2021-05-10",
    garantiaFim: "2024-05-10",
  },
]

const statusColors: Record<string, string> = {
  ativo: "bg-green-100 text-green-700 border-green-200",
  inativo: "bg-gray-100 text-gray-700 border-gray-200",
  manutencao: "bg-amber-100 text-amber-700 border-amber-200",
}

const statusLabels: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  manutencao: "Em Manutencao",
}

export function EquipamentosPage() {
  const [filtros, setFiltros] = useState({
    patrimonio: "",
    empresa: "",
    tipo: "",
    marca: "",
    localizacao: "",
  })
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<typeof equipamentosMock[0] | null>(null)

  const limparFiltros = () => {
    setFiltros({
      patrimonio: "",
      empresa: "",
      tipo: "",
      marca: "",
      localizacao: "",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie todos os equipamentos cadastrados</p>
        </div>
        <Button className="bg-[#7ac142] hover:bg-[#6ab032] gap-2">
          <Plus className="size-4" />
          Adicionar Equipamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="patrimonio">N Patrimonio</Label>
              <Input
                id="patrimonio"
                placeholder="PAT-001"
                value={filtros.patrimonio}
                onChange={(e) => setFiltros({ ...filtros, patrimonio: e.target.value })}
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
              <Label>Tipo</Label>
              <Select value={filtros.tipo} onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computador">Computador</SelectItem>
                  <SelectItem value="notebook">Notebook</SelectItem>
                  <SelectItem value="servidor">Servidor</SelectItem>
                  <SelectItem value="impressora">Impressora</SelectItem>
                  <SelectItem value="roteador">Roteador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                placeholder="Dell, HP..."
                value={filtros.marca}
                onChange={(e) => setFiltros({ ...filtros, marca: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="localizacao">Localizacao</Label>
              <Input
                id="localizacao"
                placeholder="Sala, Rack..."
                value={filtros.localizacao}
                onChange={(e) => setFiltros({ ...filtros, localizacao: e.target.value })}
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

      {/* Tabela de Equipamentos */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1a3a5c]/5">
                <TableHead className="font-semibold text-[#1a3a5c]">N Patrimonio</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Empresa</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Tipo</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Marca / Modelo</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">N de Serie</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Localizacao</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Status</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Chamados</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Ultima Manut.</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">IP</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c] text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipamentosMock.map((equipamento) => (
                <TableRow key={equipamento.id} className="hover:bg-[#3ba5d8]/5">
                  <TableCell className="font-medium text-[#1a3a5c]">{equipamento.patrimonio}</TableCell>
                  <TableCell>{equipamento.empresa}</TableCell>
                  <TableCell>{equipamento.tipo}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{equipamento.marca}</span>
                      <span className="text-xs text-muted-foreground">{equipamento.modelo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{equipamento.numSerie}</TableCell>
                  <TableCell className="text-sm">{equipamento.localizacao}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[equipamento.status]}>
                      {statusLabels[equipamento.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {equipamento.chamadosVinculados}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{equipamento.ultimaManutencao}</TableCell>
                  <TableCell className="text-sm font-mono">{equipamento.ip}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEquipamentoSelecionado(equipamento)}
                          className="gap-1"
                        >
                          <Info className="size-4" />
                          Descricao
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-[#1a3a5c]">
                            Detalhes do Equipamento - {equipamento.patrimonio}
                          </DialogTitle>
                          <DialogDescription>Informacoes completas do equipamento</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Empresa</Label>
                            <p className="font-medium">{equipamento.empresa}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Tipo</Label>
                            <p className="font-medium">{equipamento.tipo}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Marca</Label>
                            <p className="font-medium">{equipamento.marca}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Modelo</Label>
                            <p className="font-medium">{equipamento.modelo}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">N de Serie</Label>
                            <p className="font-medium font-mono">{equipamento.numSerie}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Patrimonio</Label>
                            <p className="font-medium">{equipamento.patrimonio}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Sistema Operacional</Label>
                            <p className="font-medium">{equipamento.so}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Endereco MAC</Label>
                            <p className="font-medium font-mono">{equipamento.mac}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">IP</Label>
                            <p className="font-medium font-mono">{equipamento.ip}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Localizacao Fisica</Label>
                            <p className="font-medium">{equipamento.localizacao}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Data de Aquisicao</Label>
                            <p className="font-medium">{equipamento.dataAquisicao}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-muted-foreground text-xs">Garantia (Inicio / Fim)</Label>
                            <p className="font-medium">{equipamento.garantiaInicio} ate {equipamento.garantiaFim}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
