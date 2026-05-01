"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Eye, EyeOff, ArrowLeft, User, Phone, Lock, Settings } from "lucide-react"

interface EmployeeFormProps {
  onBack: () => void
}

export function EmployeeForm({ onBack }: EmployeeFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Formulário de funcionário enviado")
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-[#1a3a5c] hover:bg-[#1a3a5c]/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="text-2xl font-bold text-[#1a3a5c]">Cadastrar Funcionário</CardTitle>
            <CardDescription>Preencha os dados do novo funcionário</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#3ba5d8]">
              <User className="h-5 w-5" />
              <h3 className="font-semibold">Dados Pessoais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" placeholder="Digite o nome completo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" placeholder="Digite o cargo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivel">Nível de suporte</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="n1">N1 - Primeiro Nível</SelectItem>
                    <SelectItem value="n2">N2 - Segundo Nível</SelectItem>
                    <SelectItem value="n3">N3 - Terceiro Nível</SelectItem>
                    <SelectItem value="none">Não atribuído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desenvolvedor Full Stack">Desenvolvedor Full Stack</SelectItem>
                    <SelectItem value="Desenvolvedor Frontend">Desenvolvedor Frontend</SelectItem>
                    <SelectItem value="Desenvolvedor Backend">Desenvolvedor Backend</SelectItem>
                    <SelectItem value="QA / Testes">QA / Testes</SelectItem>
                    <SelectItem value="Administrador de banco de dados">Administrador de banco de dados</SelectItem>
                    <SelectItem value="Backup">Backup</SelectItem>
                    <SelectItem value="Administrador de rede">Administrador de rede</SelectItem>
                    <SelectItem value="Manutenção de computadores">Manutenção de computadores</SelectItem>
                    <SelectItem value="Rede física / cabeamento">Rede física / cabeamento</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dados de Contato */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#3ba5d8]">
              <Phone className="h-5 w-5" />
              <h3 className="font-semibold">Dados de Contato</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input id="email" type="email" placeholder="email@empresa.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" placeholder="(00) 0000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ramal">Ramal</Label>
                <Input id="ramal" placeholder="0000" />
              </div>
            </div>
          </div>

          {/* Dados de Acesso */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#3ba5d8]">
              <Lock className="h-5 w-5" />
              <h3 className="font-semibold">Dados de Acesso</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário (login)</Label>
                <Input id="usuario" placeholder="Digite o usuário" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="ativo">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme a senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações de Atendimento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#3ba5d8]">
              <Settings className="h-5 w-5" />
              <h3 className="font-semibold">Configurações de Atendimento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rede">Rede</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="sistema">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jornada">Jornada de trabalho</Label>
                <Input id="jornada" placeholder="Ex: 08:00 - 18:00" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Pode receber chamados automaticamente?</Label>
                <RadioGroup defaultValue="sim" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="sim" />
                    <Label htmlFor="sim" className="font-normal">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="nao" />
                    <Label htmlFor="nao" className="font-normal">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onBack}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#7ac142] hover:bg-[#6ab132] text-white">
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
