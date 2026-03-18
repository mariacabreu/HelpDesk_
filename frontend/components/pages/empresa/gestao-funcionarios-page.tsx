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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Eye, Pencil, XCircle, Search, Filter, UserPlus, Mail, Phone, Shield } from "lucide-react"

const funcionariosMock = [
  { 
    id: "FUNC-001",
    nome: "João Silva",
    email: "joao@techsolutions.com",
    telefone: "(11) 99999-0001",
    cargo: "Analista de Sistemas",
    departamento: "TI",
    status: "ativo",
    permissao: "admin",
    dataCadastro: "2023-06-15"
  },
  { 
    id: "FUNC-002",
    nome: "Maria Santos",
    email: "maria@techsolutions.com",
    telefone: "(11) 99999-0002",
    cargo: "Gerente Comercial",
    departamento: "Comercial",
    status: "ativo",
    permissao: "usuario",
    dataCadastro: "2023-07-20"
  },
  { 
    id: "FUNC-003",
    nome: "Pedro Oliveira",
    email: "pedro@techsolutions.com",
    telefone: "(11) 99999-0003",
    cargo: "Desenvolvedor",
    departamento: "TI",
    status: "ativo",
    permissao: "usuario",
    dataCadastro: "2023-08-10"
  },
  { 
    id: "FUNC-004",
    nome: "Ana Costa",
    email: "ana@techsolutions.com",
    telefone: "(11) 99999-0004",
    cargo: "Analista Financeiro",
    departamento: "Financeiro",
    status: "inativo",
    permissao: "usuario",
    dataCadastro: "2023-05-01"
  },
  { 
    id: "FUNC-005",
    nome: "Carlos Souza",
    email: "carlos@techsolutions.com",
    telefone: "(11) 99999-0005",
    cargo: "Diretor",
    departamento: "Diretoria",
    status: "ativo",
    permissao: "admin",
    dataCadastro: "2023-01-10"
  },
]

const statusConfig = {
  ativo: { label: "Ativo", cor: "bg-green-100 text-green-800" },
  inativo: { label: "Inativo", cor: "bg-red-100 text-red-800" },
}

const permissaoConfig = {
  admin: { label: "Administrador", cor: "bg-purple-100 text-purple-800" },
  usuario: { label: "Usuário", cor: "bg-blue-100 text-blue-800" },
}

export function GestaoFuncionariosPage() {
  const [busca, setBusca] = useState("")
  const [filtroDepartamento, setFiltroDepartamento] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<typeof funcionariosMock[0] | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)
  const [modalCadastro, setModalCadastro] = useState(false)

  const funcionariosFiltrados = funcionariosMock.filter(func => {
    if (filtroDepartamento && func.departamento !== filtroDepartamento) return false
    if (filtroStatus && func.status !== filtroStatus) return false
    if (busca && !func.nome.toLowerCase().includes(busca.toLowerCase()) && 
        !func.email.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Gestão de Funcionários</h1>
          <p className="text-muted-foreground">Gerencie os usuários da sua empresa</p>
        </div>
        <Button className="bg-[#7ac142] hover:bg-[#6ab035]" onClick={() => setModalCadastro(true)}>
          <UserPlus className="size-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">{funcionariosMock.length}</p>
                <p className="text-xs text-muted-foreground">Total de Funcionários</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
                  {funcionariosMock.filter(f => f.status === "ativo").length}
                </p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
                  {funcionariosMock.filter(f => f.permissao === "admin").length}
                </p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a3a5c]">
                  {funcionariosMock.filter(f => f.status === "inativo").length}
                </p>
                <p className="text-xs text-muted-foreground">Inativos</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar funcionário</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Nome ou e-mail..." 
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="TI">TI</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Diretoria">Diretoria</SelectItem>
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

      {/* Lista de Funcionários */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1a3a5c]">Lista de Funcionários</CardTitle>
          <CardDescription>{funcionariosFiltrados.length} funcionários encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead className="w-[200px]">E-mail</TableHead>
                  <TableHead className="w-[150px]">Cargo</TableHead>
                  <TableHead className="w-[120px]">Departamento</TableHead>
                  <TableHead className="w-[120px]">Permissão</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[140px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionariosFiltrados.map((funcionario) => (
                  <TableRow key={funcionario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-[#3ba5d8] text-white text-xs">
                            {getInitials(funcionario.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{funcionario.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{funcionario.email}</TableCell>
                    <TableCell>{funcionario.cargo}</TableCell>
                    <TableCell>{funcionario.departamento}</TableCell>
                    <TableCell>
                      <Badge className={permissaoConfig[funcionario.permissao as keyof typeof permissaoConfig].cor}>
                        {permissaoConfig[funcionario.permissao as keyof typeof permissaoConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[funcionario.status as keyof typeof statusConfig].cor}>
                        {statusConfig[funcionario.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Visualizar"
                          onClick={() => {
                            setFuncionarioSelecionado(funcionario)
                            setModalDetalhes(true)
                          }}
                        >
                          <Eye className="size-4 text-[#3ba5d8]" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Editar">
                          <Pencil className="size-4 text-[#7ac142]" />
                        </Button>
                        {funcionario.status !== "inativo" && (
                          <Button variant="ghost" size="icon" title="Inativar">
                            <XCircle className="size-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Detalhes */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Detalhes do Funcionário</DialogTitle>
          </DialogHeader>
          
          {funcionarioSelecionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-[#3ba5d8] text-white text-xl">
                    {getInitials(funcionarioSelecionado.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-bold text-[#1a3a5c]">{funcionarioSelecionado.nome}</p>
                  <p className="text-sm text-muted-foreground">{funcionarioSelecionado.cargo}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="size-4 text-[#3ba5d8]" />
                  <div>
                    <p className="text-xs text-muted-foreground">E-mail</p>
                    <p className="text-sm font-medium">{funcionarioSelecionado.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="size-4 text-[#3ba5d8]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium">{funcionarioSelecionado.telefone}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Departamento</p>
                  <p className="text-sm font-medium">{funcionarioSelecionado.departamento}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Data de Cadastro</p>
                  <p className="text-sm font-medium">{funcionarioSelecionado.dataCadastro}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Permissão</p>
                  <Badge className={permissaoConfig[funcionarioSelecionado.permissao as keyof typeof permissaoConfig].cor}>
                    {permissaoConfig[funcionarioSelecionado.permissao as keyof typeof permissaoConfig].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={statusConfig[funcionarioSelecionado.status as keyof typeof statusConfig].cor}>
                    {statusConfig[funcionarioSelecionado.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Cadastro */}
      <Dialog open={modalCadastro} onOpenChange={setModalCadastro}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Novo Funcionário</DialogTitle>
            <DialogDescription>
              Cadastre um novo usuário para sua empresa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome-func">Nome Completo</Label>
              <Input id="nome-func" placeholder="Ex: João da Silva" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-func">E-mail</Label>
                <Input id="email-func" type="email" placeholder="email@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone-func">Telefone</Label>
                <Input id="telefone-func" placeholder="(11) 99999-9999" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo-func">Cargo</Label>
                <Input id="cargo-func" placeholder="Ex: Analista" />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ti">TI</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="rh">RH</SelectItem>
                    <SelectItem value="diretoria">Diretoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Permissão</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
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
