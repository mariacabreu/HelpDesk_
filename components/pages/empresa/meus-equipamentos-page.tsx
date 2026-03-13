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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Eye, ClipboardList, Pencil, XCircle, Search, Filter, Monitor, Laptop, Printer, Server } from "lucide-react"

const equipamentosMock = [
  { 
    id: "EQ-001", 
    nome: "Notebook Dell Latitude 5520",
    tipo: "notebook",
    patrimonio: "NB-2024-001",
    modelo: "Latitude 5520",
    marca: "Dell",
    status: "ativo",
    chamados: 3,
    especificacoes: {
      processador: "Intel Core i7-1165G7",
      memoria: "16GB DDR4",
      armazenamento: "SSD 512GB",
      sistemaOperacional: "Windows 11 Pro"
    },
    historicoChamados: [
      { id: "CH-001", titulo: "Sistema não inicia", data: "2024-01-15", status: "aberto" },
      { id: "CH-008", titulo: "Atualização de drivers", data: "2023-12-20", status: "fechado" },
      { id: "CH-012", titulo: "Tela travando", data: "2023-11-10", status: "fechado" },
    ]
  },
  { 
    id: "EQ-002", 
    nome: "Desktop HP ProDesk 400 G7",
    tipo: "desktop",
    patrimonio: "DT-2024-002",
    modelo: "ProDesk 400 G7",
    marca: "HP",
    status: "ativo",
    chamados: 1,
    especificacoes: {
      processador: "Intel Core i5-10500",
      memoria: "8GB DDR4",
      armazenamento: "SSD 256GB",
      sistemaOperacional: "Windows 10 Pro"
    },
    historicoChamados: [
      { id: "CH-004", titulo: "Atualização do Office", data: "2024-01-10", status: "resolvido" },
    ]
  },
  { 
    id: "EQ-003", 
    nome: "Impressora Epson L3150",
    tipo: "impressora",
    patrimonio: "IMP-2024-003",
    modelo: "L3150",
    marca: "Epson",
    status: "manutencao",
    chamados: 2,
    especificacoes: {
      tipo: "Multifuncional",
      tecnologia: "Jato de Tinta",
      conexao: "Wi-Fi / USB",
      velocidade: "33 ppm"
    },
    historicoChamados: [
      { id: "CH-003", titulo: "Impressora não imprime", data: "2024-01-13", status: "escalonado" },
      { id: "CH-015", titulo: "Troca de cabeça de impressão", data: "2023-10-05", status: "fechado" },
    ]
  },
  { 
    id: "EQ-004", 
    nome: "Monitor LG 24MK430H",
    tipo: "monitor",
    patrimonio: "MON-2024-004",
    modelo: "24MK430H",
    marca: "LG",
    status: "ativo",
    chamados: 0,
    especificacoes: {
      tamanho: "24 polegadas",
      resolucao: "1920x1080 Full HD",
      painel: "IPS",
      conexoes: "HDMI / VGA"
    },
    historicoChamados: []
  },
  { 
    id: "EQ-005", 
    nome: "Notebook Lenovo ThinkPad",
    tipo: "notebook",
    patrimonio: "NB-2024-005",
    modelo: "ThinkPad E14",
    marca: "Lenovo",
    status: "inativo",
    chamados: 5,
    especificacoes: {
      processador: "Intel Core i5-1135G7",
      memoria: "8GB DDR4",
      armazenamento: "SSD 256GB",
      sistemaOperacional: "Windows 10 Pro"
    },
    historicoChamados: [
      { id: "CH-020", titulo: "Equipamento com defeito", data: "2024-01-02", status: "fechado" },
    ]
  },
]

const tipoIcon = {
  notebook: Laptop,
  desktop: Monitor,
  impressora: Printer,
  monitor: Monitor,
  servidor: Server,
}

const statusConfig = {
  ativo: { label: "Ativo", cor: "bg-green-100 text-green-800" },
  manutencao: { label: "Manutenção", cor: "bg-yellow-100 text-yellow-800" },
  inativo: { label: "Inativo", cor: "bg-red-100 text-red-800" },
}

export function MeusEquipamentosPage() {
  const [busca, setBusca] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<typeof equipamentosMock[0] | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)
  const [modalCadastro, setModalCadastro] = useState(false)

  const equipamentosFiltrados = equipamentosMock.filter(eq => {
    if (filtroTipo && eq.tipo !== filtroTipo) return false
    if (filtroStatus && eq.status !== filtroStatus) return false
    if (busca && !eq.nome.toLowerCase().includes(busca.toLowerCase()) && 
        !eq.patrimonio.toLowerCase().includes(busca.toLowerCase()) &&
        !eq.modelo.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const abrirDetalhes = (equipamento: typeof equipamentosMock[0]) => {
    setEquipamentoSelecionado(equipamento)
    setModalDetalhes(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Meus Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie os equipamentos da sua empresa</p>
        </div>
        <Button className="bg-[#7ac142] hover:bg-[#6ab035]" onClick={() => setModalCadastro(true)}>
          <Plus className="size-4 mr-2" />
          Cadastrar Equipamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1a3a5c] flex items-center gap-2">
            <Filter className="size-5" />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar equipamento</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Nome, patrimônio ou modelo..." 
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="notebook">Notebook</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="impressora">Impressora</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="servidor">Servidor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
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

      {/* Lista de Equipamentos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1a3a5c]">Lista de Equipamentos</CardTitle>
          <CardDescription>{equipamentosFiltrados.length} equipamentos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead className="w-[130px]">Patrimônio</TableHead>
                  <TableHead className="w-[150px]">Modelo</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[80px]">Chamados</TableHead>
                  <TableHead className="w-[180px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipamentosFiltrados.map((equipamento) => {
                  const IconTipo = tipoIcon[equipamento.tipo as keyof typeof tipoIcon] || Monitor
                  return (
                    <TableRow key={equipamento.id}>
                      <TableCell className="font-mono text-sm">{equipamento.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconTipo className="size-4 text-[#3ba5d8]" />
                          <span className="font-medium">{equipamento.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{equipamento.tipo}</TableCell>
                      <TableCell className="font-mono text-sm">{equipamento.patrimonio}</TableCell>
                      <TableCell>{equipamento.modelo}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig[equipamento.status as keyof typeof statusConfig].cor}>
                          {statusConfig[equipamento.status as keyof typeof statusConfig].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{equipamento.chamados}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Visualizar" onClick={() => abrirDetalhes(equipamento)}>
                            <Eye className="size-4 text-[#3ba5d8]" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Ver chamados">
                            <ClipboardList className="size-4 text-[#7ac142]" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Editar">
                            <Pencil className="size-4 text-[#1a3a5c]" />
                          </Button>
                          {equipamento.status !== "inativo" && (
                            <Button variant="ghost" size="icon" title="Inativar">
                              <XCircle className="size-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Detalhes */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">
              {equipamentoSelecionado?.nome}
            </DialogTitle>
            <DialogDescription>
              {equipamentoSelecionado?.patrimonio} - {equipamentoSelecionado?.marca}
            </DialogDescription>
          </DialogHeader>
          
          {equipamentoSelecionado && (
            <Tabs defaultValue="detalhes">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="detalhes">Especificações</TabsTrigger>
                <TabsTrigger value="chamados">Histórico de Chamados ({equipamentoSelecionado.chamados})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="detalhes" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="text-sm font-medium capitalize">{equipamentoSelecionado.tipo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Marca</p>
                    <p className="text-sm font-medium">{equipamentoSelecionado.marca}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Modelo</p>
                    <p className="text-sm font-medium">{equipamentoSelecionado.modelo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={statusConfig[equipamentoSelecionado.status as keyof typeof statusConfig].cor}>
                      {statusConfig[equipamentoSelecionado.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Especificações Técnicas</p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(equipamentoSelecionado.especificacoes).map(([key, value]) => (
                      <div key={key} className="p-2 bg-gray-50 rounded">
                        <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="chamados" className="mt-4">
                {equipamentoSelecionado.historicoChamados.length > 0 ? (
                  <div className="space-y-2">
                    {equipamentoSelecionado.historicoChamados.map((chamado) => (
                      <div key={chamado.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{chamado.id} - {chamado.titulo}</p>
                          <p className="text-xs text-muted-foreground">{chamado.data}</p>
                        </div>
                        <Badge variant="outline">{chamado.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum chamado registrado para este equipamento
                  </p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Cadastro */}
      <Dialog open={modalCadastro} onOpenChange={setModalCadastro}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Cadastrar Equipamento</DialogTitle>
            <DialogDescription>
              Adicione um novo equipamento ao seu inventário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome-eq">Nome do Equipamento</Label>
              <Input id="nome-eq" placeholder="Ex: Notebook Dell Latitude" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notebook">Notebook</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="impressora">Impressora</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="servidor">Servidor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patrimonio">Patrimônio</Label>
                <Input id="patrimonio" placeholder="Ex: NB-2024-006" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" placeholder="Ex: Dell" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input id="modelo" placeholder="Ex: Latitude 5520" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCadastro(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#7ac142] hover:bg-[#6ab035]">
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
