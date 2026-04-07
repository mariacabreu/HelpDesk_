"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { formatDateShort, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { 
  Database, Download, Upload, Clock, CheckCircle, AlertCircle, 
  HardDrive, RefreshCw, Calendar, Settings 
} from "lucide-react"

const statusConfig = {
  concluido: { label: "Concluído", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  erro: { label: "Erro", cor: "bg-red-100 text-red-800", icon: AlertCircle },
  em_andamento: { label: "Em Andamento", cor: "bg-blue-100 text-blue-800", icon: RefreshCw },
}

export function BackupPage() {
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [backupAutomatico, setBackupAutomatico] = useState(true)
  const [horarioBackup, setHorarioBackup] = useState("02:00")
  const [retencao, setRetencao] = useState("30")
  const [executandoBackup, setExecutandoBackup] = useState(false)
  const [progressoBackup, setProgressoBackup] = useState(0)

  useEffect(() => {
    // Carregar histórico de backups (simulado por enquanto)
    setBackups([
      { 
        id: "BKP-005",
        data: "2024-04-03 02:00:00",
        tipo: "automatico",
        tamanho: "2.8 GB",
        status: "concluido",
        duracao: "12 min"
      },
      { 
        id: "BKP-004",
        data: "2024-04-02 02:00:00",
        tipo: "automatico",
        tamanho: "2.8 GB",
        status: "concluido",
        duracao: "11 min"
      },
      { 
        id: "BKP-003",
        data: "2024-04-01 02:00:00",
        tipo: "automatico",
        tamanho: "2.7 GB",
        status: "concluido",
        duracao: "14 min"
      },
      { 
        id: "BKP-002",
        data: "2024-03-31 02:00:00",
        tipo: "automatico",
        tamanho: "2.7 GB",
        status: "erro",
        duracao: "2 min"
      },
      { 
        id: "BKP-001",
        data: "2024-03-30 02:00:00",
        tipo: "automatico",
        tamanho: "2.6 GB",
        status: "concluido",
        duracao: "15 min"
      }
    ])
    setLoading(false)
  }, [])

  const iniciarBackup = () => {
    setExecutandoBackup(true)
    setProgressoBackup(0)
    const interval = setInterval(() => {
      setProgressoBackup(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setExecutandoBackup(false)
          
          // Adicionar novo backup à lista
          const novoBkp = {
            id: `BKP-00${backups.length + 1}`,
            data: new Date().toISOString().replace('T', ' ').split('.')[0],
            tipo: "manual" as const,
            tamanho: "2.5 GB",
            status: "concluido" as const,
            duracao: "2 min"
          }
          setBackups([novoBkp, ...backups])
          toast.success("Backup manual concluído com sucesso!")
          
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const salvarConfiguracoes = () => {
    toast.success("Configurações de backup salvas com sucesso!")
  }

  const totalBackups = backups.filter(b => b.status === "concluido").length
  const ultimoBackup = backups.find(b => b.status === "concluido")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Backup</h1>
          <p className="page-description">Gerencie os backups do sistema</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" 
          onClick={iniciarBackup}
          disabled={executandoBackup}
        >
          {executandoBackup ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Database className="size-4" />
              Backup Manual
            </>
          )}
        </Button>
      </div>

      {/* Progresso do Backup */}
      {executandoBackup && (
        <Card className="border-primary">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-5 text-primary animate-spin" />
                  <span className="font-medium text-primary">Executando backup...</span>
                </div>
                <span className="text-sm text-muted-foreground">{progressoBackup}%</span>
              </div>
              <Progress value={progressoBackup} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{totalBackups}</p>
                <p className="text-xs text-muted-foreground">Backups Realizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">{formatDateShort(ultimoBackup?.data)}</p>
                <p className="text-xs text-muted-foreground">Último Backup</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <HardDrive className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{ultimoBackup?.tamanho}</p>
                <p className="text-xs text-muted-foreground">Tamanho do Backup</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{horarioBackup}</p>
                <p className="text-xs text-muted-foreground">Horário Programado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <Settings className="size-5" />
            Configurações de Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Backup Automático</Label>
              <p className="text-sm text-muted-foreground">
                Realizar backup diário automaticamente
              </p>
            </div>
            <Switch 
              checked={backupAutomatico} 
              onCheckedChange={setBackupAutomatico}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Horário do Backup Automático</Label>
              <Select value={horarioBackup} onValueChange={setHorarioBackup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="00:00">00:00</SelectItem>
                  <SelectItem value="01:00">01:00</SelectItem>
                  <SelectItem value="02:00">02:00</SelectItem>
                  <SelectItem value="03:00">03:00</SelectItem>
                  <SelectItem value="04:00">04:00</SelectItem>
                  <SelectItem value="05:00">05:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Retenção (dias)</Label>
              <Select value={retencao} onValueChange={setRetencao}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="15">15 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={salvarConfiguracoes}>
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Backups */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <Database className="size-5" />
            Histórico de Backups
          </CardTitle>
          <CardDescription>Últimos backups realizados</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="data-table-header">
                  <TableHead className="w-[100px] text-primary font-semibold">ID</TableHead>
                  <TableHead className="w-[180px] text-primary font-semibold">Data/Hora</TableHead>
                  <TableHead className="w-[100px] text-primary font-semibold">Tipo</TableHead>
                  <TableHead className="w-[100px] text-primary font-semibold">Tamanho</TableHead>
                  <TableHead className="w-[100px] text-primary font-semibold">Duração</TableHead>
                  <TableHead className="w-[120px] text-primary font-semibold">Status</TableHead>
                  <TableHead className="w-[150px] text-right text-primary font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando histórico...
                    </TableCell>
                  </TableRow>
                ) : backups.length > 0 ? (
                  backups.map((backup) => {
                    const config = statusConfig[backup.status as keyof typeof statusConfig]
                    const IconStatus = config.icon
                    return (
                      <TableRow key={backup.id} className="data-table-row">
                        <TableCell className="font-mono text-sm font-medium text-primary">{backup.id}</TableCell>
                        <TableCell className="font-mono text-sm">{formatDate(backup.data)}</TableCell>
                        <TableCell className="capitalize">{backup.tipo}</TableCell>
                        <TableCell>{backup.tamanho}</TableCell>
                        <TableCell>{backup.duracao}</TableCell>
                        <TableCell>
                          <Badge className={config.cor}>
                            <IconStatus className="size-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {backup.status === "concluido" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  title="Download"
                                  className="size-8 bg-white dark:bg-background border-gray-200 shadow-sm hover:bg-blue-50 hover:border-primary/50 transition-all hover:scale-110"
                                >
                                  <Download className="size-4 text-primary" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  title="Restaurar"
                                  className="size-8 bg-white dark:bg-background border-gray-200 shadow-sm hover:bg-green-50 hover:border-green-500/50 transition-all hover:scale-110"
                                >
                                  <Upload className="size-4 text-green-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum backup encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
