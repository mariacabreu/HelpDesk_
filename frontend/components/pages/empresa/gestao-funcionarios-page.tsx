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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDateShort } from "@/lib/utils"
import { toast } from "sonner"
import { Plus, Eye, Pencil, Trash2, Search, Filter, UserPlus, Mail, Phone, Shield, Calendar, Building2, CheckCircle2, Lock, UserCircle, XCircle, RotateCcw } from "lucide-react"

const statusConfig: Record<string, { label: string; cor: string }> = {
  ativo: { label: "Ativo", cor: "bg-green-100 text-green-800 border-green-200" },
  inativo: { label: "Inativo", cor: "bg-red-100 text-red-800 border-red-200" },
}

const permissaoConfig: Record<string, { label: string; cor: string }> = {
  admin: { label: "Administrador", cor: "bg-purple-100 text-purple-800 border-purple-200" },
  usuario: { label: "Usuário", cor: "bg-blue-100 text-blue-800 border-blue-200" },
}

const nivelConfig: Record<string, string> = {
  n1: "Júnior (N1)",
  n2: "Pleno (N2)",
  n3: "Sênior (N3)",
}

export function GestaoFuncionariosPage() {
  const [userData, setUserData] = useState<any>(null)
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busca, setBusca] = useState("")
  const [filtroDepartamento, setFiltroDepartamento] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<any | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)
  const [modalCadastro, setModalCadastro] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)

  // Estados do formulário
  const [novoFunc, setNovoFunc] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    setor: "",
    nivel: "n1",
    permissao: "usuario"
  })

  const [editFunc, setEditFunc] = useState<any>({
    id: null,
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    setor: "",
    nivel: "",
    permissao: "",
    status: ""
  })

  const fetchFuncionarios = async () => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      const empresaId = user.empresa?.id
      console.log("Buscando funcionários para empresaId:", empresaId)
      if (empresaId) {
        try {
          const res = await fetch(`/api/funcionarios/empresa/${empresaId}`)
          if (!res.ok) {
            throw new Error(`Erro ${res.status}: ${res.statusText}`)
          }
          const data = await res.json()
          setFuncionarios(data)
        } catch (err) {
          console.error("Erro ao buscar funcionários:", err)
          toast.error("Erro ao carregar funcionários", {
            description: "Não foi possível carregar a lista de funcionários do servidor."
          })
        } finally {
          setLoading(false)
        }
      }
    }
  }

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  const handleCadastrar = async () => {
    if (!novoFunc.nome || !novoFunc.email || !novoFunc.cpf) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha Nome, E-mail e CPF."
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        empresa_id: userData.empresa.id,
        nome: novoFunc.nome,
        cpf: novoFunc.cpf,
        email: novoFunc.email,
        telefone: novoFunc.telefone,
        cargo: novoFunc.setor, // O departamento agora é o cargo
        setor: novoFunc.setor,
        nivel: novoFunc.nivel,
        permissao: novoFunc.permissao
      }

      const response = await fetch("/api/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.detail || "Erro ao cadastrar funcionário")
        }

        // Notificação melhorada com Sonner
        toast.success("Funcionário Cadastrado!", {
          description: data.email_enviado 
            ? "Acesso enviado para o e-mail com sucesso." 
            : "Funcionário criado, mas houve um erro ao enviar o e-mail.",
          icon: <CheckCircle2 className="size-5 text-green-500" />,
          duration: 5000,
        })
      } else {
        const text = await response.text()
        console.error("Resposta do servidor não é JSON:", text)
        throw new Error("Erro interno do servidor. Por favor, tente novamente.")
      }

      setModalCadastro(false)
      setNovoFunc({
        nome: "", cpf: "", email: "", telefone: "", setor: "",
        nivel: "n1", permissao: "usuario"
      })
      fetchFuncionarios()
    } catch (err: any) {
      toast.error("Erro no cadastro", {
        description: err.message
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditar = async () => {
    if (!editFunc.nome || !editFunc.email || !editFunc.cpf) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha Nome, E-mail e CPF."
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...editFunc,
        cargo: editFunc.setor // O departamento agora é o cargo
      }
      
      const response = await fetch(`/api/funcionarios/${editFunc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Erro ao atualizar funcionário")
      }

      toast.success("Funcionário Atualizado!", {
        description: "As informações foram salvas com sucesso."
      })
      setModalEditar(false)
      fetchFuncionarios()
    } catch (err: any) {
      toast.error("Erro na atualização", {
        description: err.message
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este funcionário?")) return

    try {
      const response = await fetch(`/api/funcionarios/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Erro ao excluir funcionário")
      }

      toast.success("Funcionário Excluído", {
        description: "O registro foi removido permanentemente."
      })
      fetchFuncionarios()
    } catch (err: any) {
      toast.error("Erro na exclusão", {
        description: err.message
      })
    }
  }

  const funcionariosFiltrados = funcionarios.filter(func => {
    if (filtroDepartamento && filtroDepartamento !== "todos" && func.setor !== filtroDepartamento) return false
    if (filtroStatus && filtroStatus !== "todos" && func.status !== filtroStatus) return false
    if (busca && !func.nome.toLowerCase().includes(busca.toLowerCase()) && 
        !func.email.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Gestão de Funcionários</h1>
          <p className="page-description">Gerencie os colaboradores e seus níveis de acesso</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          onClick={() => setModalCadastro(true)}
        >
          <UserPlus className="size-4" />
          Novo Funcionário
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {funcionarios.length}
                </p>
                <p className="text-xs text-muted-foreground">Total de Funcionários</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserPlus className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {funcionarios.filter(f => f.status === "ativo").length}
                </p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Shield className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {funcionarios.filter(f => f.permissao === "admin").length}
                </p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {funcionarios.filter(f => f.status === "inativo").length}
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
          <CardTitle className="section-title flex items-center gap-2">
            <Filter className="size-5" />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Buscar funcionário</Label>
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
              <Label className="text-sm font-medium">Departamento</Label>
              <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Desenvolvedor Full Stack">Desenvolvedor Full Stack</SelectItem>
                  <SelectItem value="QA / Testes">QA / Testes</SelectItem>
                  <SelectItem value="Administrador de banco de dados">Administrador de banco de dados</SelectItem>
                  <SelectItem value="Backup">Backup</SelectItem>
                  <SelectItem value="Administrador de rede">Administrador de rede</SelectItem>
                  <SelectItem value="Manutenção de computadores">Manutenção de computadores</SelectItem>
                  <SelectItem value="Rede física / cabeamento">Rede física / cabeamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
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
            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => {
                  setBusca("")
                  setFiltroDepartamento("")
                  setFiltroStatus("")
                }}
              >
                <RotateCcw className="size-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Funcionários */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="data-table-header">
                  <TableHead className="text-primary font-semibold">Funcionário</TableHead>
                  <TableHead className="w-[200px] text-primary font-semibold">E-mail</TableHead>
                  <TableHead className="w-[180px] text-primary font-semibold">Departamento</TableHead>
                  <TableHead className="w-[120px] text-primary font-semibold">Permissão</TableHead>
                  <TableHead className="w-[100px] text-primary font-semibold">Status</TableHead>
                  <TableHead className="w-[140px] text-right text-primary font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando funcionários...
                    </TableCell>
                  </TableRow>
                ) : funcionariosFiltrados.length > 0 ? (
                  funcionariosFiltrados.map((funcionario) => (
                    <TableRow key={funcionario.id} className="data-table-row">
                      <TableCell className="border border-[#1a3a5c]/10">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-[#3ba5d8] text-white text-xs">
                              {getInitials(funcionario.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#1a3a5c]">{funcionario.nome}</span>
                            <span className="text-[10px] text-[#1a3a5c]/60 font-medium uppercase tracking-wider">
                              Nível: {funcionario.nivel || "N1"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground border border-[#1a3a5c]/10">{funcionario.email}</TableCell>
                      <TableCell className="border border-[#1a3a5c]/10">{funcionario.setor}</TableCell>
                      <TableCell className="border border-[#1a3a5c]/10">
                        <Badge className={permissaoConfig[funcionario.permissao as keyof typeof permissaoConfig]?.cor || "bg-blue-100 text-blue-800"}>
                          {permissaoConfig[funcionario.permissao as keyof typeof permissaoConfig]?.label || "Usuário"}
                        </Badge>
                      </TableCell>
                      <TableCell className="border border-[#1a3a5c]/10">
                        <Badge className={statusConfig[funcionario.status as keyof typeof statusConfig]?.cor || "bg-green-100 text-green-800"}>
                          {statusConfig[funcionario.status as keyof typeof statusConfig]?.label || "Ativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right border border-[#1a3a5c]/10">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="size-8 bg-white border-gray-200 shadow-sm hover:bg-blue-50 hover:border-[#3ba5d8]/50 transition-all hover:scale-110"
                            title="Visualizar"
                            onClick={() => {
                              setFuncionarioSelecionado(funcionario)
                              setModalDetalhes(true)
                            }}
                          >
                            <Eye className="size-4 text-[#3ba5d8]" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="size-8 bg-white border-gray-200 shadow-sm hover:bg-green-50 hover:border-[#7ac142]/50 transition-all hover:scale-110"
                            title="Editar"
                            onClick={() => {
                              setEditFunc({
                                id: funcionario.id,
                                nome: funcionario.nome,
                                cpf: funcionario.cpf,
                                email: funcionario.email,
                                telefone: funcionario.telefone,
                                setor: funcionario.setor,
                                nivel: funcionario.nivel,
                                permissao: funcionario.permissao,
                                status: funcionario.status
                              })
                              setModalEditar(true)
                            }}
                          >
                            <Pencil className="size-4 text-[#7ac142]" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="size-8 bg-white border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-300 transition-all hover:scale-110"
                            title="Excluir"
                            onClick={() => handleExcluir(funcionario.id)}
                          >
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum funcionário encontrado.
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
                  <p className="text-sm text-muted-foreground uppercase font-semibold">{funcionarioSelecionado.setor}</p>
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
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="size-4 text-[#3ba5d8]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Departamento</p>
                    <p className="text-sm font-medium uppercase">{funcionarioSelecionado.setor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="size-4 text-[#3ba5d8]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Cadastro</p>
                    <p className="text-sm font-medium">{formatDateShort(funcionarioSelecionado.dataCadastro)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Shield className="size-4 text-[#3ba5d8]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nível</p>
                    <p className="text-sm font-medium uppercase">{funcionarioSelecionado.nivel || "N1"}</p>
                  </div>
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

              <div className="pt-4 border-t space-y-3">
                <p className="text-sm font-semibold text-[#1a3a5c] flex items-center gap-2">
                  <Lock className="size-4" />
                  Credenciais de Acesso
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <UserCircle className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Login</p>
                      <p className="text-sm font-mono font-bold text-blue-700">{funcionarioSelecionado.login}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Lock className="size-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Senha Inicial</p>
                      <p className="text-sm font-mono font-bold text-blue-700">{funcionarioSelecionado.senha}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * A senha inicial corresponde aos 6 primeiros dígitos do CPF.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Editar Funcionário</DialogTitle>
            <DialogDescription>
              Atualize as informações do funcionário selecionado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-nome">Nome Completo</Label>
                <Input 
                  id="edit-nome" 
                  value={editFunc.nome}
                  onChange={(e) => setEditFunc({...editFunc, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cpf">CPF</Label>
                <Input 
                  id="edit-cpf" 
                  value={editFunc.cpf}
                  onChange={(e) => setEditFunc({...editFunc, cpf: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail Corporativo</Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  value={editFunc.email}
                  onChange={(e) => setEditFunc({...editFunc, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-telefone">Telefone</Label>
                <Input 
                  id="edit-telefone" 
                  value={editFunc.telefone}
                  onChange={(e) => setEditFunc({...editFunc, telefone: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select value={editFunc.setor} onValueChange={(val) => setEditFunc({...editFunc, setor: val})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desenvolvedor Full Stack">Desenvolvedor Full Stack</SelectItem>
                    <SelectItem value="QA / Testes">QA / Testes</SelectItem>
                    <SelectItem value="Administrador de banco de dados">Administrador de banco de dados</SelectItem>
                    <SelectItem value="Backup">Backup</SelectItem>
                    <SelectItem value="Administrador de rede">Administrador de rede</SelectItem>
                    <SelectItem value="Manutenção de computadores">Manutenção de computadores</SelectItem>
                    <SelectItem value="Rede física / cabeamento">Rede física / cabeamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nível</Label>
                  <Select value={editFunc.nivel} onValueChange={(val) => setEditFunc({...editFunc, nivel: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(nivelConfig).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editFunc.status} onValueChange={(val) => setEditFunc({...editFunc, status: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setModalEditar(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button 
              className="bg-[#7ac142] hover:bg-[#6ab035]" 
              onClick={handleEditar}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cadastro */}
      <Dialog open={modalCadastro} onOpenChange={setModalCadastro}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a5c]">Novo Funcionário</DialogTitle>
            <DialogDescription>
              Cadastre um novo usuário para sua empresa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nome-func">Nome Completo</Label>
                <Input 
                  id="nome-func" 
                  placeholder="Ex: João Silva" 
                  value={novoFunc.nome}
                  onChange={(e) => setNovoFunc({...novoFunc, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf-func">CPF</Label>
                <Input 
                  id="cpf-func" 
                  placeholder="000.000.000-00" 
                  value={novoFunc.cpf}
                  onChange={(e) => setNovoFunc({...novoFunc, cpf: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-func">E-mail Corporativo</Label>
                <Input 
                  id="email-func" 
                  type="email" 
                  placeholder="joao@empresa.com" 
                  value={novoFunc.email}
                  onChange={(e) => setNovoFunc({...novoFunc, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone-func">Telefone</Label>
                <Input 
                  id="telefone-func" 
                  placeholder="(11) 99999-9999" 
                  value={novoFunc.telefone}
                  onChange={(e) => setNovoFunc({...novoFunc, telefone: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select value={novoFunc.setor} onValueChange={(val) => setNovoFunc({...novoFunc, setor: val})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desenvolvedor Full Stack">Desenvolvedor Full Stack</SelectItem>
                    <SelectItem value="QA / Testes">QA / Testes</SelectItem>
                    <SelectItem value="Administrador de banco de dados">Administrador de banco de dados</SelectItem>
                    <SelectItem value="Backup">Backup</SelectItem>
                    <SelectItem value="Administrador de rede">Administrador de rede</SelectItem>
                    <SelectItem value="Manutenção de computadores">Manutenção de computadores</SelectItem>
                    <SelectItem value="Rede física / cabeamento">Rede física / cabeamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nível</Label>
                  <Select value={novoFunc.nivel} onValueChange={(val) => setNovoFunc({...novoFunc, nivel: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(nivelConfig).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Permissão</Label>
                  <Select value={novoFunc.permissao} onValueChange={(val) => setNovoFunc({...novoFunc, permissao: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a permissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuário Comum</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setModalCadastro(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button 
              className="bg-[#7ac142] hover:bg-[#6ab035]" 
              onClick={handleCadastrar}
              disabled={saving}
            >
              {saving ? "Cadastrando..." : "Cadastrar Funcionário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
