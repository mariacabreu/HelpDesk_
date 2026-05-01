"use client"

import { useEffect, useState } from "react"
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
import { Search, RotateCcw, Info, Plus, Eye, Monitor, Smartphone, Server, Printer, Router } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { safeJson } from "@/lib/utils"

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
    status: "ativo",
    chamadosVinculados: 2,
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
    status: "inativo",
    chamadosVinculados: 8,
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

const tipoIcones: Record<string, any> = {
  notebook: Monitor,
  desktop: Monitor,
  servidor: Server,
  impressora: Printer,
  roteador: Router,
  smartphone: Smartphone,
}

export function EquipamentosPage() {
  const [filtros, setFiltros] = useState({
    patrimonio: "",
    tipo: "",
    marca: "",
  })
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<typeof equipamentosMock[0] | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [openNovo, setOpenNovo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    patrimonio: "",
    tipo: "",
    marca: "",
    modelo: "",
    numero_serie: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const u = JSON.parse(stored)
      setUserData(u)
      if (u?.empresa?.id) {
        fetch(`/api/equipamentos/${u.empresa.id}`)
          .then(r => safeJson<any[]>(r))
          .then(data => setEquipamentos(data || []))
          .catch(() => setEquipamentos([]))
      }
    }
  }, [])

  const lista = equipamentos.map((e: any) => ({
    id: e.id?.toString(),
    patrimonio: e.patrimonio,
    empresa: userData?.empresa?.nome_fantasia || userData?.empresa?.razao_social || "",
    tipo: e.tipo || "",
    marca: e.marca || "",
    modelo: e.modelo || "",
    numSerie: e.numero_serie || "",
    status: e.status || "ativo",
    chamadosVinculados: 0,
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    so: e.especificacoes?.so || "",
    mac: "",
    dataAquisicao: "",
    garantiaInicio: "",
    garantiaFim: "",
  }))

  const cadastrarEquipamento = async () => {
    if (!userData?.empresa?.id) {
      toast({ title: "Empresa não identificada", description: "Faça login novamente.", variant: "destructive" as any })
      return
    }
    if (!form.nome || !form.patrimonio) {
      toast({ title: "Campos obrigatórios", description: "Informe Nome e Patrimônio.", variant: "destructive" as any })
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/equipamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: userData.empresa.id,
          nome: form.nome,
          patrimonio: form.patrimonio,
          tipo: form.tipo || null,
          marca: form.marca || null,
          modelo: form.modelo || null,
          numero_serie: form.numero_serie || null,
          status: "ativo",
        }),
      })
      if (!res.ok) {
        const err = await safeJson<any>(res)
        throw new Error(err?.detail || `Falha ao cadastrar equipamento (${res.status})`)
      }
      const novo = await safeJson<any>(res)
      if (!novo) throw new Error("Resposta inválida ao cadastrar equipamento")
      
      setOpenNovo(false)
      setForm({ nome: "", patrimonio: "", tipo: "", marca: "", modelo: "", numero_serie: "" })
      toast({ title: "Equipamento cadastrado", description: `Patrimônio ${novo.patrimonio}` })
      // Recarregar lista
      const r = await fetch(`/api/equipamentos/${userData.empresa.id}`)
      const data = await safeJson<any[]>(r)
      setEquipamentos(data || [])
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Erro ao cadastrar equipamento.", variant: "destructive" as any })
    } finally {
      setSaving(false)
    }
  }

  const limparFiltros = () => {
    setFiltros({
      patrimonio: "",
      tipo: "",
      marca: "",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie todos os equipamentos cadastrados</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="patrimonio">N Patrimonio</Label>
              <Input
                id="patrimonio"
                placeholder="Ex: PAT-001"
                value={filtros.patrimonio}
                onChange={(e) => setFiltros({ ...filtros, patrimonio: e.target.value })}
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

      {/* Tabela de Equipamentos */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a3a5c] hover:bg-[#1a3a5c]">
                  <TableHead className="text-center text-white font-semibold border border-[#1a3a5c]/10 py-4">N Patrimonio</TableHead>
                  <TableHead className="text-center text-white font-semibold border border-[#1a3a5c]/10 py-4">Tipo</TableHead>
                  <TableHead className="text-center text-white font-semibold border border-[#1a3a5c]/10 py-4">Marca / Modelo</TableHead>
                  <TableHead className="text-center text-white font-semibold border border-[#1a3a5c]/10 py-4">N de Serie</TableHead>
                  <TableHead className="text-center text-white font-semibold border border-[#1a3a5c]/10 py-4">Status</TableHead>
                  <TableHead className="text-center text-white font-semibold border border-[#1a3a5c]/10 py-4">Chamados</TableHead>
                  <TableHead className="text-center text-white font-semibold border border-[#1a3a5c]/10 py-4">IP</TableHead>
                  <TableHead className="text-center text-white font-semibold border border-[#1a3a5c]/10 py-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((equipamento) => {
                  const Icon = tipoIcones[equipamento.tipo.toLowerCase()] || Monitor
                  return (
                    <TableRow key={equipamento.id} className="hover:bg-[#3ba5d8]/5">
                      <TableCell className="font-medium text-[#1a3a5c] border border-[#1a3a5c]/10">{equipamento.patrimonio}</TableCell>
                      <TableCell className="border border-[#1a3a5c]/10">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 text-muted-foreground" />
                          <span className="capitalize">{equipamento.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="border border-[#1a3a5c]/10">
                        <div className="flex flex-col">
                          <span className="text-sm">{equipamento.marca}</span>
                          <span className="text-xs text-muted-foreground">{equipamento.modelo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono border border-[#1a3a5c]/10">{equipamento.numSerie}</TableCell>
                      <TableCell className="border border-[#1a3a5c]/10">
                        <Badge variant="outline" className={statusColors[equipamento.status]}>
                          {statusLabels[equipamento.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center border border-[#1a3a5c]/10">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {equipamento.chamadosVinculados}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono border border-[#1a3a5c]/10">{equipamento.ip}</TableCell>
                      <TableCell className="text-right border border-[#1a3a5c]/10">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEquipamentoSelecionado(equipamento)}
                              className="size-8 bg-white border-gray-200 shadow-sm hover:bg-blue-50 hover:border-[#3ba5d8]/50 transition-all hover:scale-110"
                              title="Visualizar Detalhes"
                            >
                              <Eye className="size-4 text-[#3ba5d8]" />
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
                                <p className="font-medium">{equipamentoSelecionado?.so || "Não definido"}</p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Label className="text-muted-foreground text-xs">IP</Label>
                                <p className="font-medium font-mono">{equipamento.ip}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

