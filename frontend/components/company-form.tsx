"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, ArrowLeft, Building2, User, MapPin, Lock, FileText, CheckCircle2 } from "lucide-react"

interface CompanyFormProps {
  onBack: () => void
}

export function CompanyForm({ onBack }: CompanyFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    razaoSocial: "",
    cnpj: "",
    inscricaoEstadual: "",
    segmento: "",
    nomeResponsavel: "",
    cargoResponsavel: "",
    emailContato: "",
    telefoneContato: "",
    celular: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    emailLogin: "",
    statusEmpresa: "ativo",
    senhaEmpresa: "",
    confirmarSenhaEmpresa: "",
    plano: "",
    sla: "",
    dataInicio: "",
    dataVencimento: "",
  })

  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18)
  }

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 14)
  }

  const maskCelular = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{1})(\d{4})(\d)/, "$1 $2-$3")
      .substring(0, 16)
  }

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .substring(0, 9)
  }

  const handleChange = async (id: string, value: string) => {
    let maskedValue = value

    if (id === "cnpj") maskedValue = maskCNPJ(value)
    if (id === "telefoneContato") maskedValue = maskPhone(value)
    if (id === "celular") maskedValue = maskCelular(value)
    if (id === "cep") {
      maskedValue = maskCEP(value)
      // Preenchimento automático ao digitar 8 dígitos
      if (maskedValue.replace(/\D/g, "").length === 8) {
        const cepLimpo = maskedValue.replace(/\D/g, "")
        try {
          const response = await fetch(`/api/cep/${cepLimpo}`)
          const data = await response.json()
          if (!data.erro) {
            setFormData((prev) => ({
              ...prev,
              rua: data.logradouro || prev.rua,
              bairro: data.bairro || prev.bairro,
              cidade: data.localidade || prev.cidade,
              estado: data.uf || prev.estado,
              cep: maskedValue
            }))
          }
        } catch (e) {}
      }
    }

    setFormData((prev) => ({ ...prev, [id]: maskedValue }))
    // Limpar erro do campo quando o usuário digita
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    const requiredFields = [
      "razaoSocial",
      "cnpj",
      "cep",
      "rua",
      "numero",
      "bairro",
      "cidade",
      "emailLogin",
      "senhaEmpresa",
      "confirmarSenhaEmpresa",
    ]

    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = "Falta preencher este campo"
      }
    })

    if (formData.senhaEmpresa !== formData.confirmarSenhaEmpresa) {
      newErrors.confirmarSenhaEmpresa = "As senhas não coincidem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/empresas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razao_social: formData.razaoSocial,
          nome_fantasia: formData.razaoSocial,
          cnpj: formData.cnpj,
          inscricao_estadual: "",
          segmento: formData.segmento,
          nome_responsavel: formData.razaoSocial, // Usando a Razão Social como responsável na falta do Nome
          cargo_responsavel: "Administrador",
          email: formData.emailLogin,
          telefone: formData.telefoneContato || formData.celular,
          cep: formData.cep,
          endereco: `${formData.rua}, ${formData.numero}${formData.complemento ? " - " + formData.complemento : ""}, ${formData.bairro}`,
          cidade: formData.cidade,
          estado: formData.estado,
          login: formData.emailLogin,
          senha: formData.senhaEmpresa,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.detail || "Erro ao cadastrar empresa")
        return
      }

      setSuccess(true)
      // Redirecionar após 3 segundos
      setTimeout(() => {
        onBack()
      }, 3000)
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl animate-in fade-in zoom-in duration-300">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-75"></div>
            <div className="relative bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="h-16 w-16 text-[#7ac142]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[#1a3a5c]">Empresa Cadastrada!</h2>
            <p className="text-muted-foreground text-lg">
              O cadastro da empresa <strong>{formData.razaoSocial}</strong> foi concluído com sucesso.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 max-w-sm w-full">
            <p className="text-sm text-blue-700">
              Agora você já pode realizar o login utilizando o e-mail e a senha que foram cadastrados.
            </p>
          </div>
          <div className="pt-4 w-full max-w-xs">
            <Button 
              className="w-full bg-[#1a3a5c] hover:bg-[#2a4a6c] text-white"
              onClick={onBack}
            >
              Ir para o Login
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Você será redirecionado automaticamente em instantes...
            </p>
          </div>
        </CardContent>
      </Card>
    )
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
                <Label htmlFor="razaoSocial" className={errors.razaoSocial ? "text-red-500" : ""}>Razão Social</Label>
                <Input 
                  id="razaoSocial" 
                  placeholder="Digite a razão social" 
                  value={formData.razaoSocial}
                  onChange={(e) => handleChange("razaoSocial", e.target.value)}
                  className={errors.razaoSocial ? "border-red-500" : ""}
                />
                {errors.razaoSocial && <p className="text-xs text-red-500">{errors.razaoSocial}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cnpj" className={errors.cnpj ? "text-red-500" : ""}>CNPJ</Label>
                <Input 
                  id="cnpj" 
                  placeholder="00.000.000/0000-00" 
                  value={formData.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  className={errors.cnpj ? "border-red-500" : ""}
                />
                {errors.cnpj && <p className="text-xs text-red-500">{errors.cnpj}</p>}
              </div>
            </div>
          </div>

          {/* Dados de Contato */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefoneContato">Telefone</Label>
                <Input 
                  id="telefoneContato" 
                  placeholder="(00) 0000-0000" 
                  value={formData.telefoneContato}
                  onChange={(e) => handleChange("telefoneContato", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="celular">Celular</Label>
                <Input 
                  id="celular" 
                  placeholder="(00) 00000-0000" 
                  value={formData.celular}
                  onChange={(e) => handleChange("celular", e.target.value)}
                />
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cep" className={errors.cep ? "text-red-500" : ""}>CEP</Label>
                <Input 
                  id="cep" 
                  placeholder="00000-000" 
                  value={formData.cep}
                  onChange={(e) => handleChange("cep", e.target.value)}
                  className={errors.cep ? "border-red-500" : ""}
                />
                {errors.cep && <p className="text-xs text-red-500">{errors.cep}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rua" className={errors.rua ? "text-red-500" : ""}>Rua</Label>
                <Input 
                  id="rua" 
                  placeholder="Digite a rua" 
                  value={formData.rua}
                  onChange={(e) => handleChange("rua", e.target.value)}
                  className={errors.rua ? "border-red-500" : ""}
                />
                {errors.rua && <p className="text-xs text-red-500">{errors.rua}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero" className={errors.numero ? "text-red-500" : ""}>Número</Label>
                <Input 
                  id="numero" 
                  placeholder="Nº" 
                  value={formData.numero}
                  onChange={(e) => handleChange("numero", e.target.value)}
                  className={errors.numero ? "border-red-500" : ""}
                />
                {errors.numero && <p className="text-xs text-red-500">{errors.numero}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input 
                  id="complemento" 
                  placeholder="Apto, Sala, etc" 
                  value={formData.complemento}
                  onChange={(e) => handleChange("complemento", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro" className={errors.bairro ? "text-red-500" : ""}>Bairro</Label>
                <Input 
                  id="bairro" 
                  placeholder="Digite o bairro" 
                  value={formData.bairro}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                  className={errors.bairro ? "border-red-500" : ""}
                />
                {errors.bairro && <p className="text-xs text-red-500">{errors.bairro}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade" className={errors.cidade ? "text-red-500" : ""}>Cidade</Label>
                <Input 
                  id="cidade" 
                  placeholder="Digite a cidade" 
                  value={formData.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                  className={errors.cidade ? "border-red-500" : ""}
                />
                {errors.cidade && <p className="text-xs text-red-500">{errors.cidade}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(val) => handleChange("estado", val)}>
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
                <Label htmlFor="emailLogin" className={errors.emailLogin ? "text-red-500" : ""}>E-mail de login</Label>
                <Input 
                  id="emailLogin" 
                  type="email" 
                  placeholder="email@empresa.com" 
                  value={formData.emailLogin}
                  onChange={(e) => handleChange("emailLogin", e.target.value)}
                  className={errors.emailLogin ? "border-red-500" : ""}
                />
                {errors.emailLogin && <p className="text-xs text-red-500">{errors.emailLogin}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusEmpresa">Status</Label>
                <Select value={formData.statusEmpresa} onValueChange={(val) => handleChange("statusEmpresa", val)}>
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
                <Label htmlFor="senhaEmpresa" className={errors.senhaEmpresa ? "text-red-500" : ""}>Senha</Label>
                <div className="relative">
                  <Input
                    id="senhaEmpresa"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a senha"
                    value={formData.senhaEmpresa}
                    onChange={(e) => handleChange("senhaEmpresa", e.target.value)}
                    className={errors.senhaEmpresa ? "border-red-500" : ""}
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
                {errors.senhaEmpresa && <p className="text-xs text-red-500">{errors.senhaEmpresa}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenhaEmpresa" className={errors.confirmarSenhaEmpresa ? "text-red-500" : ""}>Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenhaEmpresa"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme a senha"
                    value={formData.confirmarSenhaEmpresa}
                    onChange={(e) => handleChange("confirmarSenhaEmpresa", e.target.value)}
                    className={errors.confirmarSenhaEmpresa ? "border-red-500" : ""}
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
                {errors.confirmarSenhaEmpresa && <p className="text-xs text-red-500">{errors.confirmarSenhaEmpresa}</p>}
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
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-[#7ac142] hover:bg-[#6ab132] text-white"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Empresa"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

