"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, ArrowLeft, Building2, User, MapPin, Lock, FileText } from "lucide-react"

interface CompanyFormProps {
  onBack: () => void
}

export function CompanyForm({ onBack }: CompanyFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Formulário de empresa enviado")
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
            <CardTitle className="text-2xl font-bold text-[#1a3a5c]">Cadastrar Empresa</CardTitle>
            <CardDescription>Preencha os dados da empresa</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Empresa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#7ac142]">
              <Building2 className="h-5 w-5" />
              <h3 className="font-semibold">Dados da Empresa</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="razaoSocial">Razão Social</Label>
                <Input id="razaoSocial" placeholder="Digite a razão social" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input id="nomeFantasia" placeholder="Digite o nome fantasia" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" placeholder="00.000.000/0000-00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inscricaoEstadual">Inscrição Estadual (opcional)</Label>
                <Input id="inscricaoEstadual" placeholder="Digite a inscrição estadual" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segmento">Segmento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industria">Indústria</SelectItem>
                    <SelectItem value="comercio">Comércio</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dados de Contato */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#7ac142]">
              <User className="h-5 w-5" />
              <h3 className="font-semibold">Dados de Contato</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
                <Input id="nomeResponsavel" placeholder="Digite o nome" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargoResponsavel">Cargo</Label>
                <Input id="cargoResponsavel" placeholder="Digite o cargo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailContato">E-mail</Label>
                <Input id="emailContato" type="email" placeholder="email@empresa.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefoneContato">Telefone</Label>
                <Input id="telefoneContato" placeholder="(00) 0000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="celular">Celular</Label>
                <Input id="celular" placeholder="(00) 00000-0000" />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#7ac142]">
              <MapPin className="h-5 w-5" />
              <h3 className="font-semibold">Endereço</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" placeholder="00000-000" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rua">Rua</Label>
                <Input id="rua" placeholder="Digite a rua" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" placeholder="Nº" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input id="complemento" placeholder="Apto, Sala, etc" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" placeholder="Digite o bairro" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" placeholder="Digite a cidade" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="AL">AL</SelectItem>
                    <SelectItem value="AP">AP</SelectItem>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="BA">BA</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="DF">DF</SelectItem>
                    <SelectItem value="ES">ES</SelectItem>
                    <SelectItem value="GO">GO</SelectItem>
                    <SelectItem value="MA">MA</SelectItem>
                    <SelectItem value="MT">MT</SelectItem>
                    <SelectItem value="MS">MS</SelectItem>
                    <SelectItem value="MG">MG</SelectItem>
                    <SelectItem value="PA">PA</SelectItem>
                    <SelectItem value="PB">PB</SelectItem>
                    <SelectItem value="PR">PR</SelectItem>
                    <SelectItem value="PE">PE</SelectItem>
                    <SelectItem value="PI">PI</SelectItem>
                    <SelectItem value="RJ">RJ</SelectItem>
                    <SelectItem value="RN">RN</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                    <SelectItem value="RO">RO</SelectItem>
                    <SelectItem value="RR">RR</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="SP">SP</SelectItem>
                    <SelectItem value="SE">SE</SelectItem>
                    <SelectItem value="TO">TO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dados de Acesso */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#7ac142]">
              <Lock className="h-5 w-5" />
              <h3 className="font-semibold">Dados de Acesso</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailLogin">E-mail de login</Label>
                <Input id="emailLogin" type="email" placeholder="email@empresa.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusEmpresa">Status</Label>
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
                <Label htmlFor="senhaEmpresa">Senha</Label>
                <div className="relative">
                  <Input
                    id="senhaEmpresa"
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
                <Label htmlFor="confirmarSenhaEmpresa">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenhaEmpresa"
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

          {/* Informações Técnicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#7ac142]">
              <FileText className="h-5 w-5" />
              <h3 className="font-semibold">Informações Técnicas (Opcional)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plano">Plano contratado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla">SLA contratado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o SLA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4h">4 horas</SelectItem>
                    <SelectItem value="8h">8 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="48h">48 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de início do contrato</Label>
                <Input id="dataInicio" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de vencimento</Label>
                <Input id="dataVencimento" type="date" />
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
