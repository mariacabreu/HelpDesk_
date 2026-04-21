"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Building2, User, Mail, Upload, Clock, AlertTriangle, X, Loader2, Shuffle, UserCog } from "lucide-react"
import { safeJson } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const slaInfo = {
  baixa: { tempo: "48 horas", cor: "bg-green-100 text-green-800" },
  media: { tempo: "24 horas", cor: "bg-yellow-100 text-yellow-800" },
  alta: { tempo: "8 horas", cor: "bg-red-100 text-red-800" },
}

interface NovoChamadoPageProps {
  onTicketCreated?: () => void
}

export function NovoChamadoPage({ onTicketCreated }: NovoChamadoPageProps) {
  const [userData, setUserData] = useState<any>(null)
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [tipoChamado, setTipoChamado] = useState("")
  const [prioridade, setPrioridade] = useState("")
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [equipamentoId, setEquipamentoId] = useState("")
  const [arquivos, setArquivos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [novoChamadoId, setNovoChamadoId] = useState<number | null>(null)
  const [funcionariosNivel, setFuncionariosNivel] = useState<any[]>([])
  const [funcionarioSelecionadoId, setFuncionarioSelecionadoId] = useState("-1")
  const [nomeSolicitante, setNomeSolicitante] = useState("")
  const [emailSolicitante, setEmailSolicitante] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      // Removido o preenchimento automático para que os campos iniciem vazios conforme solicitado
      setNomeSolicitante("")
      setEmailSolicitante("")
      
      // Buscar equipamentos da empresa
      if (user.empresa?.id) {
        fetch(`/api/equipamentos/${user.empresa.id}`)
          .then(res => safeJson<any[]>(res))
          .then(data => setEquipamentos(data || []))
          .catch(err => console.error("Erro ao buscar equipamentos:", err))
        
        // Buscar todos os funcionários da empresa para filtrar por nível depois
        fetch(`/api/funcionarios/empresa/${user.empresa.id}`)
          .then(res => safeJson<any[]>(res))
          .then(data => setFuncionariosNivel(data || []))
          .catch(err => console.error("Erro ao buscar funcionários:", err))

        // Verificar se há um equipamento pendente para seleção automática
        const pendingEqId = localStorage.getItem("pendingEquipmentId")
        if (pendingEqId) {
          setEquipamentoId(pendingEqId)
          localStorage.removeItem("pendingEquipmentId") // Limpar após usar
        }
      }
    }
  }, [])

  // Filtrar funcionários baseados na prioridade (N1, N2, N3)
  const suportesFiltrados = funcionariosNivel.filter(f => {
    if (!prioridade) return false
    const nivelMap: Record<string, string> = { baixa: "n1", media: "n2", alta: "n3" }
    return f.nivel === nivelMap[prioridade] && f.status === "ativo"
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArquivos(Array.from(e.target.files))
    }
  }

  const removerArquivo = (index: number) => {
    setArquivos(arquivos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tipoChamado || !prioridade || !titulo || !descricao) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (!userData || !userData.id || !userData.empresa?.id) {
      alert("Erro ao identificar usuário ou empresa. Tente fazer login novamente.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        empresa_id: parseInt(userData.empresa.id),
        solicitante_id: parseInt(userData.id),
        nome_solicitante: nomeSolicitante || null,
        email_solicitante: emailSolicitante || null,
        equipamento_id: equipamentoId === "nao-aplica" || !equipamentoId ? null : (parseInt(equipamentoId) || null),
        atribuido_a_id: parseInt(funcionarioSelecionadoId) || -1,
        titulo,
        descricao,
        tipo: tipoChamado,
        prioridade,
      }
      
      console.log("Enviando payload do chamado:", payload)

      const response = await fetch("/api/chamados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await safeJson<any>(response)
        console.error("Erro detalhado do backend:", errorData)
        
        let errorMessage = `Erro no servidor (${response.status})`
        if (errorData) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n')
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          }
        }
        
        throw new Error(errorMessage)
      }

      const data = await safeJson<any>(response)
      if (!data) {
        throw new Error("Resposta inválida do servidor")
      }
      const criadoId = data?.id
      
      // Fazer upload dos anexos se houver
      if (criadoId && arquivos.length > 0) {
        console.log(`Fazendo upload de ${arquivos.length} anexos para o chamado ${criadoId}`)
        for (const arquivo of arquivos) {
          const formData = new FormData()
          formData.append("file", arquivo)
          
          try {
            await fetch(`/api/chamados/${criadoId}/anexos`, {
              method: "POST",
              body: formData,
            })
          } catch (uploadErr) {
            console.error(`Erro ao subir arquivo ${arquivo.name}:`, uploadErr)
          }
        }
      }

      setNovoChamadoId(criadoId ?? null)
      setSuccessOpen(true)
      limparFormulario()
    } catch (err: any) {
      console.error("Erro:", err)
      alert(err.message || "Ocorreu um erro ao tentar abrir o chamado.")
    } finally {
      setLoading(false)
    }
  }

  const limparFormulario = () => {
    setTipoChamado("")
    setPrioridade("")
    setTitulo("")
    setDescricao("")
    setEquipamentoId("")
    setArquivos([])
    setNomeSolicitante("")
    setEmailSolicitante("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Novo Chamado</h1>
        <p className="text-muted-foreground">Abertura de solicitação ou incidente técnico</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados da Empresa */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#1a3a5c]">Dados do Solicitante</CardTitle>
            <CardDescription>Confirme ou altere os dados de quem está abrindo o chamado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Building2 className="size-5 text-[#3ba5d8]" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="font-medium text-[#1a3a5c]">{userData?.empresa?.nome_fantasia || userData?.empresa?.razao_social || "Empresa não identificada"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <User className="size-5 text-[#3ba5d8]" />
                <div className="flex-1">
                  <Label htmlFor="nomeSolicitante" className="text-xs text-muted-foreground font-normal">Solicitante</Label>
                  <Input 
                    id="nomeSolicitante"
                    className="h-7 bg-transparent border-none p-0 focus-visible:ring-0 font-medium text-[#1a3a5c]" 
                    value={nomeSolicitante}
                    onChange={(e) => setNomeSolicitante(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="size-5 text-[#3ba5d8]" />
                <div className="flex-1 overflow-hidden">
                  <Label htmlFor="emailSolicitante" className="text-xs text-muted-foreground font-normal">E-mail</Label>
                  <Input 
                    id="emailSolicitante"
                    className="h-7 bg-transparent border-none p-0 focus-visible:ring-0 font-medium text-[#1a3a5c]" 
                    value={emailSolicitante}
                    onChange={(e) => setEmailSolicitante(e.target.value)}
                    placeholder="seuemail@empresa.com"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Chamado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#1a3a5c]">Informações do Chamado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Chamado</Label>
              <RadioGroup value={tipoChamado} onValueChange={setTipoChamado} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="incidente" id="incidente" />
                  <Label htmlFor="incidente" className="font-normal cursor-pointer">Incidente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solicitacao" id="solicitacao" />
                  <Label htmlFor="solicitacao" className="font-normal cursor-pointer">Solicitação</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <RadioGroup 
                value={prioridade} 
                onValueChange={(val) => {
                  setPrioridade(val)
                  setFuncionarioSelecionadoId("-1") // Resetar para automático ao mudar prioridade
                }} 
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baixa" id="baixa" />
                  <Label htmlFor="baixa" className="font-normal cursor-pointer">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Baixa (N1)</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="media" id="media" />
                  <Label htmlFor="media" className="font-normal cursor-pointer">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Média (N2)</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alta" id="alta" />
                  <Label htmlFor="alta" className="font-normal cursor-pointer">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Alta (N3)</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Atribuição Simplificada como Botão Funcional */}
            {prioridade && (
              <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Select 
                  value={funcionarioSelecionadoId} 
                  onValueChange={setFuncionarioSelecionadoId}
                >
                  <SelectTrigger className="w-full h-12 border-[#3ba5d8]/30 focus:ring-[#3ba5d8]/20 bg-white hover:bg-gray-50 flex items-center gap-3 shadow-sm transition-all border-l-4 border-l-[#3ba5d8]">
                    <User className="size-5 text-[#3ba5d8] shrink-0" />
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                      <span className="font-bold text-[#1a3a5c] whitespace-nowrap">Responsável:</span>
                      <SelectValue placeholder="Escolha um técnico ou automático" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1" className="cursor-pointer py-3 border-b border-gray-100 font-semibold text-[#3ba5d8]">
                      <div className="flex items-center gap-2">
                        <Shuffle className="size-4" />
                        Escolha Automática Aleatória (Sistema)
                      </div>
                    </SelectItem>
                    {suportesFiltrados.length > 0 ? (
                      suportesFiltrados.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()} className="cursor-pointer py-3 border-b last:border-0 border-gray-100">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1a3a5c]">{f.nome}</span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-[#3ba5d8]/5 text-[#3ba5d8] border-[#3ba5d8]/20">
                                {f.setor || "Suporte"}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">Nível {f.nivel?.toUpperCase()} • {f.email || "E-mail não cadastrado"}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="nenhum" disabled className="py-4 text-center text-muted-foreground">
                        Nenhum técnico {prioridade.toUpperCase()} disponível no momento
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                {/* Informações detalhadas do técnico selecionado (gerar informações) */}
                {funcionarioSelecionadoId !== "-1" && funcionarioSelecionadoId !== "nenhum" && (
                  <div className="p-3 bg-green-50/50 border border-green-100 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                    {(() => {
                      const f = suportesFiltrados.find(s => s.id.toString() === funcionarioSelecionadoId)
                      if (!f) return null
                      return (
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <UserCog className="size-4 text-green-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Técnico Selecionado</p>
                            <div className="text-sm text-[#1a3a5c]">
                              <span className="font-bold">{f.nome}</span> está pronto para atender seu chamado nível {f.nivel?.toUpperCase()}.
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="size-3" /> {f.email || "Sem e-mail"}
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Chamado</Label>
              <Input 
                id="titulo" 
                placeholder="Ex: Sistema não inicia" 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição detalhada</Label>
              <Textarea 
                id="descricao" 
                placeholder="Descreva o problema ou solicitação com o máximo de detalhes possível..."
                rows={4}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações do Equipamento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#1a3a5c]">Informações do Equipamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Equipamento</Label>
              <Select value={equipamentoId} onValueChange={setEquipamentoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao-aplica">Não se aplica</SelectItem>
                  {equipamentos.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id.toString()}>
                      {eq.nome} ({eq.patrimonio})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Anexos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#1a3a5c]">Anexos (Evidências)</CardTitle>
            <CardDescription>Adicione fotos ou prints de erro para ajudar no diagnóstico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#3ba5d8] transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="size-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar ou arraste os arquivos aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: imagens, PDF, DOC (máx. 10MB cada)
                </p>
              </label>
            </div>

            {arquivos.length > 0 && (
              <div className="space-y-2">
                {arquivos.map((arquivo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm truncate">{arquivo.name}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removerArquivo(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SLA Informativo */}
        {prioridade && (
          <Card className="border-[#3ba5d8]/30 bg-[#3ba5d8]/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-[#3ba5d8]" />
                <div>
                  <p className="text-sm font-medium text-[#1a3a5c]">Prazo estimado de atendimento (SLA)</p>
                  <Badge className={slaInfo[prioridade as keyof typeof slaInfo]?.cor}>
                    {slaInfo[prioridade as keyof typeof slaInfo]?.tempo}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <AlertTriangle className="size-3" />
                O prazo pode variar conforme a complexidade do problema
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={limparFormulario} disabled={loading}>
            Limpar
          </Button>
          <Button type="submit" className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 min-w-[150px]" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Abrir Chamado"
            )}
          </Button>
        </div>
      </form>
      
      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1a3a5c]">Chamado aberto com sucesso</AlertDialogTitle>
            <AlertDialogDescription>
              Seu chamado foi registrado e já está na fila de atendimento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSuccessOpen(false)}>Fechar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSuccessOpen(false)
                if (onTicketCreated) onTicketCreated()
              }}
            >
              Ver meus chamados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

