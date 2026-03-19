"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { 
  Search, Filter, Shield, Download, Eye, User, FileText, 
  Clock, ArrowRight, Database, Settings, Lock
} from "lucide-react"



export function AuditoriaPage() {
  const [userData, setUserData] = useState<any>(null)
  const [auditoria, setAuditoria] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")
  const [filtroAcao, setFiltroAcao] = useState("")
  const [filtroUsuario, setFiltroUsuario] = useState("")
  const [registroSelecionado, setRegistroSelecionado] = useState<any | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      
      // Simulação de busca de auditoria (não há endpoint real para isso ainda)
      setAuditoria(auditoriaMock)
      setLoading(false)
    }
  }, [])

  const registrosFiltrados = auditoria.filter(item => {
    if (filtroModulo && item.modulo !== filtroModulo) return false
    if (filtroAcao && item.acao !== filtroAcao) return false
    if (filtroUsuario && item.usuario !== filtroUsuario) return false
    if (busca && !item.descricao.toLowerCase().includes(busca.toLowerCase()) && 
        !item.usuario.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const usuarios = [...new Set(auditoriaMock.map(r => r.usuario))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Auditoria</h1>
          <p className="text-muted-foreground">Rastreie todas as alterações realizadas no sistema</p>
        </div>
        <Button variant="outline">
          <Download className="size-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">{auditoriaMock.length}</p>
                <p className="text-xs text-muted-foreground">Total de Registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
                  {auditoriaMock.filter(r => r.acao === "Criar").length}
                </p>
                <p className="text-xs text-muted-foreground">Criações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Settings className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
                  {auditoriaMock.filter(r => r.acao === "Atualizar").length}
                </p>
                <p className="text-xs text-muted-foreground">Atualizações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">{usuarios.length}</p>
                <p className="text-xs text-muted-foreground">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Descrição..." 
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Módulo</Label>
              <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Chamados">Chamados</SelectItem>
                  <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="Funcionários">Funcionários</SelectItem>
                  <SelectItem value="Backup">Backup</SelectItem>
                  <SelectItem value="Configurações">Configurações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ação</Label>
              <Select value={filtroAcao} onValueChange={setFiltroAcao}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Criar">Criar</SelectItem>
                  <SelectItem value="Atualizar">Atualizar</SelectItem>
                  <SelectItem value="Excluir">Excluir</SelectItem>
                  <SelectItem value="Executar">Executar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {usuarios.map(usuario => (
                    <SelectItem key={usuario} value={usuario}>{usuario}</SelectItem>
                  ))}
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

      {/* Lista de Registros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1a3a5c] flex items-center gap-2">
            <Shield className="size-5" />
            Registros de Auditoria
          </CardTitle>
          <CardDescription>{registrosFiltrados.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Data/Hora</TableHead>
                  <TableHead className="w-[120px]">Usuário</TableHead>
                  <TableHead className="w-[120px]">Módulo</TableHead>
                  <TableHead className="w-[100px]">Ação</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[100px]">IP</TableHead>
                  <TableHead className="w-[80px] text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrosFiltrados.map((registro) => {
                  const ModuloIcon = moduloIcons[registro.modulo as keyof typeof moduloIcons] || FileText
                  return (
                    <TableRow key={registro.id}>
                      <TableCell className="font-mono text-xs">{formatDate(registro.timestamp)}</TableCell>
                      <TableCell>{registro.usuario}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ModuloIcon className="size-4 text-[#3ba5d8]" />
                          {registro.modulo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={acaoConfig[registro.acao as keyof typeof acaoConfig]?.cor}>
                          {registro.acao}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{registro.descricao}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{registro.ip}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setRegistroSelecionado(registro)
                            setModalDetalhes(true)
                          }}
                        >
                          <Eye className="size-4 text-[#3ba5d8]" />
                        </Button>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Detalhes da Auditoria</DialogTitle>
            <DialogDescription>{registroSelecionado?.id}</DialogDescription>
          </DialogHeader>
          
          {registroSelecionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="size-4 text-[#3ba5d8]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data/Hora</p>
                    <p className="text-sm font-medium">{registroSelecionado.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <User className="size-4 text-[#3ba5d8]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Usuário</p>
                    <p className="text-sm font-medium">{registroSelecionado.usuario}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Descrição da Ação</p>
                <p className="text-sm font-medium">{registroSelecionado.descricao}</p>
              </div>

              <Tabs defaultValue="depois">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="antes">Antes</TabsTrigger>
                  <TabsTrigger value="depois">Depois</TabsTrigger>
                </TabsList>
                <TabsContent value="antes" className="mt-4">
                  {registroSelecionado.detalhes.antes ? (
                    <pre className="p-4 bg-red-50 rounded-lg text-sm overflow-auto">
                      {JSON.stringify(registroSelecionado.detalhes.antes, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum valor anterior (registro criado)
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="depois" className="mt-4">
                  {registroSelecionado.detalhes.depois ? (
                    <pre className="p-4 bg-green-50 rounded-lg text-sm overflow-auto">
                      {JSON.stringify(registroSelecionado.detalhes.depois, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum valor posterior (registro excluído)
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
