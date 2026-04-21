"use client"

import { useState, useEffect } from "react"
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
import { safeJson } from "@/lib/utils"
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
  XCircle,
  Loader2
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function RelatoriosPage() {
  const [periodo, setPeriodo] = useState({ inicio: "", fim: "" })
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [logsAuditoria, setLogsAuditoria] = useState<any[]>([])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stats/relatorios")
      if (res.ok) {
        const data = await safeJson<any>(res)
        setStats(data)
      }
      
      const resLogs = await fetch("/api/logs")
      if (resLogs.ok) {
        const dataLogs = await safeJson<any[]>(resLogs)
        setLogsAuditoria(dataLogs || [])
      }
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    }
    fetchStats()
  }, [])

  const exportarRelatorioGeral = () => {
    if (!stats) return
    const doc = new jsPDF()
    let y = 15

    doc.setFontSize(18)
    doc.text("Relatório Geral de Gestão - SwiftDesk", 14, y)
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
        ["Total", stats.resumo.total.toString()],
        ["Abertos", stats.resumo.abertos.toString()],
        ["Em Andamento", stats.resumo.emAndamento.toString()],
        ["Resolvidos", stats.resumo.resolvidos.toString()]
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
        ["Baixa", stats.prioridades.baixa.toString()],
        ["Média", stats.prioridades.media.toString()],
        ["Alta", stats.prioridades.alta.toString()]
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
        ["Dentro do SLA", stats.sla.dentroSLA.toString()],
        ["Fora do SLA", stats.sla.foraSLA.toString()],
        ["Tempo Médio de Atendimento", stats.sla.tempoMedio]
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
      formatDate(log.timestamp),
      log.usuario_nome || "Sistema",
      log.acao,
      log.ip || "N/A"
    ])

    autoTable(doc, {
      startY: 30,
      head: [["Data/Hora", "Usuário", "Ação", "IP"]],
      body: tableData,
      headStyles: { fillColor: [26, 58, 92] }
    })

    doc.save(`logs-auditoria-${new Date().getTime()}.pdf`)
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Relatórios</h1>
          <p className="text-muted-foreground">Visualize métricas e estatísticas do sistema</p>
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
          <CardTitle className="text-lg">Filtro de Período</CardTitle>
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
            <Button className="bg-[#3ba5d8] hover:bg-[#2a8fc2]" onClick={fetchStats}>Aplicar Filtro</Button>
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
            Níveis
          </TabsTrigger>
          <TabsTrigger value="tecnicos" className="gap-2">
            <User className="size-4" />
            Técnicos
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
                <CardTitle className="text-3xl text-[#1a3a5c]">{stats.resumo.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Abertos</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{stats.resumo.abertos}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Em Andamento</CardDescription>
                <CardTitle className="text-3xl text-amber-600">{stats.resumo.emAndamento}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Resolvidos</CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.resumo.resolvidos}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 font-medium">Baixa</span>
                  <span className="text-2xl font-bold text-emerald-700">{stats.prioridades.baixa}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-amber-700 font-medium">Média</span>
                  <span className="text-2xl font-bold text-amber-700">{stats.prioridades.media}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <span className="text-orange-700 font-medium">Alta</span>
                  <span className="text-2xl font-bold text-orange-700">{stats.prioridades.alta}</span>
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
                <CardTitle className="text-3xl text-green-600">{stats.sla.dentroSLA}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stats.sla.dentroSLA + stats.sla.foraSLA > 0 ? ((stats.sla.dentroSLA / (stats.sla.dentroSLA + stats.sla.foraSLA)) * 100).toFixed(1) : 0}% dos chamados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <XCircle className="size-4 text-red-600" />
                  Fora do SLA
                </CardDescription>
                <CardTitle className="text-3xl text-red-600">{stats.sla.foraSLA}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stats.sla.dentroSLA + stats.sla.foraSLA > 0 ? ((stats.sla.foraSLA / (stats.sla.dentroSLA + stats.sla.foraSLA)) * 100).toFixed(1) : 0}% dos chamados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="size-4 text-blue-600" />
                  Tempo Médio de Atendimento
                </CardDescription>
                <CardTitle className="text-3xl text-blue-600">{stats.sla.tempoMedio}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Níveis */}
        <TabsContent value="niveis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chamados por Nível (N1, N2, N3)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1a3a5c] hover:bg-[#1a3a5c]">
                    <TableHead className="text-center text-white font-semibold py-4">Nível</TableHead>
                    <TableHead className="text-center text-white font-semibold py-4">Chamados</TableHead>
                    <TableHead className="text-center text-white font-semibold py-4">Escalonados</TableHead>
                    <TableHead className="text-center text-white font-semibold py-4">Tempo Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.niveis.map((nivel: any) => (
                    <TableRow key={nivel.nivel}>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-[#3ba5d8]/10 text-[#3ba5d8] border-[#3ba5d8]/20">
                          {nivel.nivel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{nivel.chamados}</TableCell>
                      <TableCell className="text-center">{nivel.escalonados}</TableCell>
                      <TableCell className="text-center">{nivel.tempoMedio}</TableCell>
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
              <CardTitle>Desempenho dos Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1a3a5c] hover:bg-[#1a3a5c]">
                    <TableHead className="text-center text-white font-semibold py-4">Técnico</TableHead>
                    <TableHead className="text-center text-white font-semibold py-4">Chamados Atendidos</TableHead>
                    <TableHead className="text-center text-white font-semibold py-4">Chamados Resolvidos</TableHead>
                    <TableHead className="text-center text-white font-semibold py-4">Tempo Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.tecnicos.map((tecnico: any) => (
                    <TableRow key={tecnico.nome}>
                      <TableCell className="text-center font-medium">{tecnico.nome}</TableCell>
                      <TableCell className="text-center">{tecnico.atendidos}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">{tecnico.resolvidos}</span>
                      </TableCell>
                      <TableCell className="text-center">{tecnico.tempoMedio}</TableCell>
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
              <CardDescription>Equipamentos que requerem mais atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1a3a5c] hover:bg-[#1a3a5c]">
                    <TableHead className="text-center text-white font-semibold py-4">Equipamento</TableHead>
                    <TableHead className="text-center text-white font-semibold py-4">Patrimônio</TableHead>
                    <TableHead className="text-center text-white font-semibold py-4">Chamados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.equipamentos.map((eq: any, index: number) => (
                    <TableRow key={eq.patrimonio}>
                      <TableCell className="text-center font-medium">{eq.equipamento}</TableCell>
                      <TableCell className="text-center font-mono">{eq.patrimonio}</TableCell>
                      <TableCell className="text-center">
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
          <CardDescription>Ações realizadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1a3a5c] hover:bg-[#1a3a5c]">
                <TableHead className="text-center text-white font-semibold py-4">Data/Hora</TableHead>
                <TableHead className="text-center text-white font-semibold py-4">Usuário</TableHead>
                <TableHead className="text-center text-white font-semibold py-4">Ação</TableHead>
                <TableHead className="text-center text-white font-semibold py-4">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsAuditoria.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center text-sm">{formatDate(log.timestamp)}</TableCell>
                  <TableCell className="text-center font-medium">{log.usuario_nome || "Sistema"}</TableCell>
                  <TableCell className="text-center">{log.acao}</TableCell>
                  <TableCell className="text-center font-mono text-sm">{log.ip || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
