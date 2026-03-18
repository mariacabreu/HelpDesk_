"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Building2, User, Mail, Upload, Clock, AlertTriangle, X } from "lucide-react"

const equipamentos = [
  { id: "1", nome: "Notebook Dell Latitude", patrimonio: "NB-001" },
  { id: "2", nome: "Desktop HP ProDesk", patrimonio: "DT-002" },
  { id: "3", nome: "Impressora Epson L3150", patrimonio: "IMP-003" },
  { id: "4", nome: "Monitor LG 24\"", patrimonio: "MON-004" },
]

const slaInfo = {
  baixa: { tempo: "48 horas", cor: "bg-green-100 text-green-800" },
  media: { tempo: "24 horas", cor: "bg-yellow-100 text-yellow-800" },
  alta: { tempo: "8 horas", cor: "bg-red-100 text-red-800" },
}

export function NovoChamadoPage() {
  const [tipoChamado, setTipoChamado] = useState("")
  const [prioridade, setPrioridade] = useState("")
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [equipamento, setEquipamento] = useState("")
  const [arquivos, setArquivos] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArquivos(Array.from(e.target.files))
    }
  }

  const removerArquivo = (index: number) => {
    setArquivos(arquivos.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ tipoChamado, prioridade, titulo, descricao, equipamento, arquivos })
  }

  const limparFormulario = () => {
    setTipoChamado("")
    setPrioridade("")
    setTitulo("")
    setDescricao("")
    setEquipamento("")
    setArquivos([])
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
            <CardTitle className="text-lg text-[#1a3a5c]">Dados da Empresa</CardTitle>
            <CardDescription>Informações preenchidas automaticamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Building2 className="size-5 text-[#3ba5d8]" />
                <div>
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="font-medium text-[#1a3a5c]">Tech Solutions Ltda</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <User className="size-5 text-[#3ba5d8]" />
                <div>
                  <p className="text-xs text-muted-foreground">Solicitante</p>
                  <p className="font-medium text-[#1a3a5c]">João Silva</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="size-5 text-[#3ba5d8]" />
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium text-[#1a3a5c]">joao@techsolutions.com</p>
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
              <RadioGroup value={prioridade} onValueChange={setPrioridade} className="flex gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Chamado</Label>
              <Input 
                id="titulo" 
                placeholder="Ex: Sistema não inicia" 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
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
              <Select value={equipamento} onValueChange={setEquipamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao-aplica">Não se aplica</SelectItem>
                  {equipamentos.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
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

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={limparFormulario}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-[#7ac142] hover:bg-[#6ab035] text-white">
            Abrir Chamado
          </Button>
        </div>
      </form>
    </div>
  )
}
