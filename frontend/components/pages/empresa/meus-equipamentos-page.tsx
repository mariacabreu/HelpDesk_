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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Eye, ClipboardList, Pencil, XCircle, Search, Filter, Monitor, Laptop, Printer, Server } from "lucide-react"
import { useToast } from "@/hooks/use-toast"



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
  const [userData, setUserData] = useState<any>(null)
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<any | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)
  const [modalCadastro, setModalCadastro] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cadastro, setCadastro] = useState({
    nome: "",
    tipo: "",
    patrimonio: "",
    marca: "",
    modelo: "",
    numero_serie: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      
      const empresaId = user.empresa?.id
      if (empresaId) {
        fetch(`http://localhost:8000/equipamentos/${empresaId}`)
          .then(res => res.json())
          .then(data => setEquipamentos(data))
          .catch(err => console.error("Erro ao buscar equipamentos:", err))
          .finally(() => setLoading(false))
      }
    }
  }, [])

  const equipamentosFiltrados = equipamentos.filter(eq => {
    if (filtroTipo && eq.tipo !== filtroTipo) return false
    if (filtroStatus && eq.status !== filtroStatus) return false
    if (busca && !eq.nome.toLowerCase().includes(busca.toLowerCase()) && 
        !eq.patrimonio.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const abrirDetalhes = (equipamento: any) => {
    setEquipamentoSelecionado(equipamento)
    setModalDetalhes(true)
  }

  const cadastrarEquipamento = async () => {
    if (!userData?.empresa?.id) {
      toast({ title: "Empresa não identificada", description: "Faça login novamente.", variant: "destructive" as any })
      return
    }
    if (!cadastro.nome.trim() || !cadastro.patrimonio.trim()) {
      toast({ title: "Campos obrigatórios", description: "Informe Nome e Patrimônio.", variant: "destructive" as any })
      return
    }
    try {
      setSaving(true)
      const res = await fetch("http://localhost:8000/equipamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: userData.empresa.id,
          nome: cadastro.nome.trim(),
          patrimonio: cadastro.patrimonio.trim(),
          tipo: cadastro.tipo || null,
          marca: cadastro.marca.trim() || null,
          modelo: cadastro.modelo.trim() || null,
          numero_serie: cadastro.numero_serie.trim() || null,
          status: "ativo",
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail || "Falha ao cadastrar equipamento")
      }
      const novo = await res.json()
      toast({ title: "Equipamento cadastrado", description: `Patrimônio ${novo.patrimonio}` })
      setModalCadastro(false)
      setCadastro({ nome: "", tipo: "", patrimonio: "", marca: "", modelo: "", numero_serie: "" })
      const r = await fetch(`http://localhost:8000/equipamentos/${userData.empresa.id}`)
      const data = await r.json()
      setEquipamentos(data)
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Erro ao cadastrar equipamento.", variant: "destructive" as any })
    } finally {
      setSaving(false)
    }
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
              <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v === "todos" ? "" : v)}>
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
              <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v === "todos" ? "" : v)}>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Carregando equipamentos...
                    </TableCell>
                  </TableRow>
                ) : equipamentosFiltrados.length > 0 ? (
                  equipamentosFiltrados.map((eq) => {
                    const Icon = tipoIcon[String(eq.tipo || "").toLowerCase() as keyof typeof tipoIcon] || Monitor
                    const config = statusConfig[String(eq.status || "").toLowerCase() as keyof typeof statusConfig]
                    return (
                      <TableRow key={eq.id}>
                        <TableCell className="font-mono text-sm">{eq.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Icon className="size-4 text-[#1a3a5c]" />
                            </div>
                            <span className="font-medium">{eq.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{eq.tipo}</TableCell>
                        <TableCell className="font-mono text-xs">{eq.patrimonio}</TableCell>
                        <TableCell>{eq.modelo}</TableCell>
                        <TableCell>
                          <Badge className={config?.cor || "bg-gray-100 text-gray-800"}>
                            {config?.label || eq.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {eq.chamados_count || eq.chamados || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" title="Visualizar" onClick={() => abrirDetalhes(eq)}>
                              <Eye className="size-4 text-[#3ba5d8]" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Abrir Chamado">
                              <ClipboardList className="size-4 text-[#7ac142]" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Pencil className="size-4 text-[#1a3a5c]" />
                            </Button>
                            {eq.status !== "inativo" && (
                              <Button variant="ghost" size="icon" title="Inativar">
                                <XCircle className="size-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum equipamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
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
                <TabsTrigger value="chamados">Histórico de Chamados ({equipamentoSelecionado.chamados_count || equipamentoSelecionado.chamados || 0})</TabsTrigger>
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
                    {Object.entries(equipamentoSelecionado.especificacoes || {}).map(([key, value]) => (
                      <div key={key} className="p-2 bg-gray-50 rounded">
                        <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="chamados" className="mt-4">
                {(equipamentoSelecionado.historicoChamados || []).length > 0 ? (
                  <div className="space-y-2">
                    {(equipamentoSelecionado.historicoChamados || []).map((chamado) => (
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
              <Input
                id="nome-eq"
                placeholder="Ex: Notebook Dell Latitude"
                value={cadastro.nome}
                onChange={(e) => setCadastro({ ...cadastro, nome: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={cadastro.tipo} onValueChange={(v) => setCadastro({ ...cadastro, tipo: v })}>
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
                <Input
                  id="patrimonio"
                  placeholder="Ex: NB-2024-006"
                  value={cadastro.patrimonio}
                  onChange={(e) => setCadastro({ ...cadastro, patrimonio: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  placeholder="Ex: Dell"
                  value={cadastro.marca}
                  onChange={(e) => setCadastro({ ...cadastro, marca: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  placeholder="Ex: Latitude 5520"
                  value={cadastro.modelo}
                  onChange={(e) => setCadastro({ ...cadastro, modelo: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Número de Série</Label>
              <Input
                placeholder="Ex: ABC123XYZ"
                value={cadastro.numero_serie}
                onChange={(e) => setCadastro({ ...cadastro, numero_serie: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCadastro(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button className="bg-[#7ac142] hover:bg-[#6ab035]" onClick={cadastrarEquipamento} disabled={saving}>
              {saving ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
