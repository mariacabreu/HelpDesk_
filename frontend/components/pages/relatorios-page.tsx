"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Clock, 
  RefreshCw, 
  User, 
  Monitor, 
  Shield, 
  Download, 
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function RelatoriosPage() {
  const [periodo, setPeriodo] = useState({ inicio: "", fim: "" })

  // Dados mock para relatórios
  const estatisticasChamados = {
    total: 156,
    abertos: 23,
    emAndamento: 45,
    resolvidos: 88,
    porPrioridade: {
      baixa: 42,
      media: 58,
      alta: 36,
      critica: 20,
    }
  }

  const estatisticasSLA = {
    dentroSLA: 134,
    foraSLA: 22,
    tempoMedio: "2h 34min",
  }

  const estatisticasNiveis = [
    { nivel: "N1", chamados: 89, escalonados: 23, tempoMedio: "45min" },
    { nivel: "N2", chamados: 45, escalonados: 12, tempoMedio: "1h 30min" },
    { nivel: "N3", chamados: 22, escalonados: 0, tempoMedio: "3h 15min" },
  ]

  const estatisticasTecnicos = [
    { nome: "Joao Silva", atendidos: 45, resolvidos: 42, tempoMedio: "1h 15min" },
    { nome: "Maria Santos", atendidos: 38, resolvidos: 35, tempoMedio: "1h 30min" },
    { nome: "Pedro Costa", atendidos: 32, resolvidos: 28, tempoMedio: "2h 00min" },
    { nome: "Ana Oliveira", atendidos: 28, resolvidos: 26, tempoMedio: "1h 45min" },
  ]

  const equipamentosProblematicos = [
    { equipamento: "Servidor HP ProLiant", patrimonio: "PAT-002", chamados: 12 },
    { equipamento: "Impressora Epson L3150", patrimonio: "PAT-003", chamados: 8 },
    { equipamento: "Roteador Cisco ISR", patrimonio: "PAT-005", chamados: 6 },
    { equipamento: "Desktop Dell Optiplex", patrimonio: "PAT-001", chamados: 5 },
  ]

  const logsAuditoria = [
    { data: "2024-01-15 14:30", usuario: "admin", acao: "Login no sistema", ip: "192.168.1.100" },
    { data: "2024-01-15 14:25", usuario: "joao.silva", acao: "Edicao de chamado CHM-001", ip: "192.168.1.45" },
    { data: "2024-01-15 14:20", usuario: "maria.santos", acao: "Exclusao de equipamento PAT-010", ip: "192.168.1.78" },
    { data: "2024-01-15 14:15", usuario: "admin", acao: "Cadastro de novo funcionario", ip: "192.168.1.100" },
    { data: "2024-01-15 14:00", usuario: "pedro.costa", acao: "Login no sistema", ip: "192.168.1.55" },
  ]

  const exportarRelatorioGeral = () => {
    const doc = new jsPDF()
    let y = 15

    doc.setFontSize(18)
    doc.text("Relatório Geral de Gestão - HelpDesk", 14, y)
    y += 10
    doc.setFontSize(10)
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, y)
    y += 5
    doc.text(`Período: ${periodo.inicio || 'Início'} até ${periodo.fim || 'Fim'}`, 14, y)
    y += 15

    // Seção Chamados
    doc.setFontSize(14)
    doc.text("1. Resumo de Chamados", 14, y)
    y += 10
    autoTable(doc, {
      startY: y,
      head: [["Status", "Quantidade"]],
      body: [
        ["Total", estatisticasChamados.total.toString()],
        ["Abertos", estatisticasChamados.abertos.toString()],
        ["Em Andamento", estatisticasChamados.emAndamento.toString()],
        ["Resolvidos", estatisticasChamados.resolvidos.toString()]
      ],
      headStyles: { fillColor: [26, 58, 92] }
    })
    y = (doc as any).lastAutoTable.finalY + 15

    // Seção Prioridades
    doc.setFontSize(14)
    doc.text("2. Chamados por Prioridade", 14, y)
    y += 10
    autoTable(doc, {
      startY: y,
      head: [["Prioridade", "Quantidade"]],
      body: [
        ["Baixa", estatisticasChamados.porPrioridade.baixa.toString()],
        ["Média", estatisticasChamados.porPrioridade.media.toString()],
        ["Alta", estatisticasChamados.porPrioridade.alta.toString()],
        ["Crítica", estatisticasChamados.porPrioridade.critica.toString()]
      ],
      headStyles: { fillColor: [26, 58, 92] }
    })
    y = (doc as any).lastAutoTable.finalY + 15

    // Seção SLA
    doc.setFontSize(14)
    doc.text("3. Desempenho SLA", 14, y)
    y += 10
    autoTable(doc, {
      startY: y,
      head: [["Métrica", "Valor"]],
      body: [
        ["Dentro do SLA", estatisticasSLA.dentroSLA.toString()],
        ["Fora do SLA", estatisticasSLA.foraSLA.toString()],
        ["Tempo Médio de Atendimento", estatisticasSLA.tempoMedio]
      ],
      headStyles: { fillColor: [26, 58, 92] }
    })

    doc.save(`relatorio-geral-${new Date().getTime()}.pdf`)
  }

  const exportarLogsAuditoria = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Logs de Auditoria do Sistema", 14, 15)
    doc.setFontSize(10)
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 22)

    const tableData = logsAuditoria.map(log => [
      log.data,
      log.usuario,
      log.acao,
      log.ip
    ])

    autoTable(doc, {
      startY: 30,
      head: [["Data/Hora", "Usuário", "Ação", "IP"]],
      body: tableData,
      headStyles: { fillColor: [26, 58, 92] }
    })

    doc.save(`logs-auditoria-${new Date().getTime()}.pdf`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Relatorios</h1>
          <p className="text-muted-foreground">Visualize metricas e estatisticas do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportarRelatorioGeral}>
            <FileText className="size-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="size-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtro de Período */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtro de Periodo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dataInicio">Data Inicial</Label>
              <Input
                id="dataInicio"
                type="date"
                value={periodo.inicio}
                onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dataFim">Data Final</Label>
              <Input
                id="dataFim"
                type="date"
                value={periodo.fim}
                onChange={(e) => setPeriodo({ ...periodo, fim: e.target.value })}
              />
            </div>
            <Button className="bg-[#3ba5d8] hover:bg-[#2a8fc2]">Aplicar Filtro</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="chamados" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chamados" className="gap-2">
            <FileText className="size-4" />
            Chamados
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2">
            <Clock className="size-4" />
            SLA
          </TabsTrigger>
          <TabsTrigger value="niveis" className="gap-2">
            <RefreshCw className="size-4" />
            Niveis
          </TabsTrigger>
          <TabsTrigger value="tecnicos" className="gap-2">
            <User className="size-4" />
            Tecnicos
          </TabsTrigger>
          <TabsTrigger value="equipamentos" className="gap-2">
            <Monitor className="size-4" />
            Equipamentos
          </TabsTrigger>
        </TabsList>

        {/* Tab Chamados */}
        <TabsContent value="chamados" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Chamados</CardDescription>
                <CardTitle className="text-3xl text-[#1a3a5c]">{estatisticasChamados.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Abertos</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{estatisticasChamados.abertos}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Em Andamento</CardDescription>
                <CardTitle className="text-3xl text-amber-600">{estatisticasChamados.emAndamento}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Resolvidos</CardDescription>
                <CardTitle className="text-3xl text-green-600">{estatisticasChamados.resolvidos}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 font-medium">Baixa</span>
                  <span className="text-2xl font-bold text-emerald-700">{estatisticasChamados.porPrioridade.baixa}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-amber-700 font-medium">Media</span>
                  <span className="text-2xl font-bold text-amber-700">{estatisticasChamados.porPrioridade.media}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <span className="text-orange-700 font-medium">Alta</span>
                  <span className="text-2xl font-bold text-orange-700">{estatisticasChamados.porPrioridade.alta}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-red-700 font-medium">Critica</span>
                  <span className="text-2xl font-bold text-red-700">{estatisticasChamados.porPrioridade.critica}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab SLA */}
        <TabsContent value="sla" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Dentro do SLA
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">{estatisticasSLA.dentroSLA}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {((estatisticasSLA.dentroSLA / (estatisticasSLA.dentroSLA + estatisticasSLA.foraSLA)) * 100).toFixed(1)}% dos chamados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <XCircle className="size-4 text-red-600" />
                  Fora do SLA
                </CardDescription>
                <CardTitle className="text-3xl text-red-600">{estatisticasSLA.foraSLA}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {((estatisticasSLA.foraSLA / (estatisticasSLA.dentroSLA + estatisticasSLA.foraSLA)) * 100).toFixed(1)}% dos chamados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="size-4 text-blue-600" />
                  Tempo Medio de Atendimento
                </CardDescription>
                <CardTitle className="text-3xl text-blue-600">{estatisticasSLA.tempoMedio}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Níveis */}
        <TabsContent value="niveis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chamados por Nivel (N1, N2, N3)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1a3a5c]/5">
                    <TableHead className="font-semibold text-[#1a3a5c]">Nivel</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c]">Chamados</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c]">Escalonados</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c]">Tempo Medio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estatisticasNiveis.map((nivel) => (
                    <TableRow key={nivel.nivel}>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#3ba5d8]/10 text-[#3ba5d8] border-[#3ba5d8]/20">
                          {nivel.nivel}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{nivel.chamados}</TableCell>
                      <TableCell>{nivel.escalonados}</TableCell>
                      <TableCell>{nivel.tempoMedio}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Técnicos */}
        <TabsContent value="tecnicos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Tecnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1a3a5c]/5">
                    <TableHead className="font-semibold text-[#1a3a5c]">Tecnico</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c]">Chamados Atendidos</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c]">Chamados Resolvidos</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c]">Tempo Medio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estatisticasTecnicos.map((tecnico) => (
                    <TableRow key={tecnico.nome}>
                      <TableCell className="font-medium">{tecnico.nome}</TableCell>
                      <TableCell>{tecnico.atendidos}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{tecnico.resolvidos}</span>
                      </TableCell>
                      <TableCell>{tecnico.tempoMedio}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Equipamentos */}
        <TabsContent value="equipamentos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos com Mais Chamados</CardTitle>
              <CardDescription>Equipamentos que requerem mais atencao</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1a3a5c]/5">
                    <TableHead className="font-semibold text-[#1a3a5c]">Equipamento</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c]">Patrimonio</TableHead>
                    <TableHead className="font-semibold text-[#1a3a5c]">Chamados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipamentosProblematicos.map((eq, index) => (
                    <TableRow key={eq.patrimonio}>
                      <TableCell className="font-medium">{eq.equipamento}</TableCell>
                      <TableCell className="font-mono">{eq.patrimonio}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={index === 0 ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"}
                        >
                          {eq.chamados} chamados
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Auditoria */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-[#1a3a5c]" />
              <CardTitle>Auditoria</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-white border-gray-200 shadow-sm hover:bg-gray-50 transition-all" onClick={exportarLogsAuditoria}>
              <Download className="size-4" />
              Exportar Logs
            </Button>
          </div>
          <CardDescription>Acoes realizadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1a3a5c]/5">
                <TableHead className="font-semibold text-[#1a3a5c]">Data/Hora</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Usuario</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">Acao</TableHead>
                <TableHead className="font-semibold text-[#1a3a5c]">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsAuditoria.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="text-sm">{log.data}</TableCell>
                  <TableCell className="font-medium">{log.usuario}</TableCell>
                  <TableCell>{log.acao}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
