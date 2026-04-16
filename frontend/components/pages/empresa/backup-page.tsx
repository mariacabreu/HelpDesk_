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
  sucesso: { label: "Concluído", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  falha: { label: "Erro", cor: "bg-red-100 text-red-800", icon: AlertCircle },
  em_progresso: { label: "Em Andamento", cor: "bg-blue-100 text-blue-800", icon: RefreshCw },
}

export function BackupPage() {
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [backupAutomatico, setBackupAutomatico] = useState(true)
  const [horarioBackup, setHorarioBackup] = useState("02:00")
  const [retencao, setRetencao] = useState("30")
  const [executandoBackup, setExecutandoBackup] = useState(false)
  const [progressoBackup, setProgressoBackup] = useState(0)

  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      if (user.empresa?.id) {
        fetchBackups(user.empresa.id)
      } else {
        setLoading(false)
      }
    }
  }, [])

  const fetchBackups = async (empresaId: number) => {
    setLoading(true)
    try {
      const bkpRes = await fetch(`/api/empresas/${empresaId}/backups`)
      if (bkpRes.ok) {
        const data = await bkpRes.json()
        setBackups(data.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime()))
      }
    } catch (err) {
      console.error("Erro ao buscar backups:", err)
    } finally {
      setLoading(false)
    }
  }

  const iniciarBackup = async () => {
    console.log("DEBUG: Iniciar backup. UserData:", userData)
    if (!userData?.empresa?.id) {
      console.error("DEBUG: empresa_id não encontrado em userData")
      return
    }

    toast.info("Iniciando backup completo do sistema...")
    setExecutandoBackup(true)
    setProgressoBackup(10)

    try {
      // Simular progresso visual enquanto aguarda o backend
      const timer = setInterval(() => {
        setProgressoBackup(prev => (prev < 90 ? prev + 10 : prev))
      }, 500)

      const bkpRes = await fetch(`/api/empresas/${userData.empresa.id}/backup`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      })
      
      clearInterval(timer)
      setProgressoBackup(100)

      if (bkpRes.ok) {
        toast.success("Backup do sistema concluído com sucesso!")
        fetchBackups(userData.empresa.id)
      } else {
        throw new Error("Erro no servidor")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erro ao realizar backup do sistema")
    } finally {
      setTimeout(() => {
        setExecutandoBackup(false)
        setProgressoBackup(0)
      }, 1000)
    }
  }

  const salvarConfiguracoes = () => {
    toast.success("Configurações de backup salvas com sucesso!")
  }

  const totalBackups = backups.filter(b => b.status === "sucesso").length
  const ultimoBackup = backups.find(b => b.status === "sucesso")

  const formatSize = (kb: number | undefined) => {
    if (kb === undefined) return ""
    if (kb < 1024) return `${kb} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

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
                <p className="text-sm font-bold text-primary">{ultimoBackup ? formatDateShort(ultimoBackup.data) : "N/A"}</p>
                <p className="text-xs text-muted-foreground">Data do Último Backup</p>
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
                <p className="text-2xl font-bold text-primary">{formatSize(ultimoBackup?.tamanho)}</p>
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
                <TableRow className="bg-[#1a3a5c] hover:bg-[#1a3a5c]">
                  <TableHead className="w-[80px] text-center text-white font-semibold py-4">ID</TableHead>
                  <TableHead className="w-[120px] text-center text-white font-semibold py-4">Data/Hora</TableHead>
                  <TableHead className="w-[100px] text-center text-white font-semibold py-4">Tipo</TableHead>
                  <TableHead className="w-[100px] text-center text-white font-semibold py-4">Tamanho</TableHead>
                  <TableHead className="w-[100px] text-center text-white font-semibold py-4">Duração</TableHead>
                  <TableHead className="w-[120px] text-center text-white font-semibold py-4">Status</TableHead>
                  <TableHead className="w-[150px] text-center text-white font-semibold py-4">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground border-border">
                      Carregando histórico...
                    </TableCell>
                  </TableRow>
                ) : backups.length > 0 ? (
                  backups.map((backup) => {
                    const config = statusConfig[backup.status as keyof typeof statusConfig]
                    const IconStatus = config.icon
                    return (
                      <TableRow key={backup.id} className="data-table-row group">
                        <TableCell className="py-4 text-left">
                          <span className="text-xs font-bold text-[#3ba5d8] bg-[#3ba5d8]/5 px-2 py-1 rounded-md">
                            {backup.id}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-left">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-[#1a3a5c] tracking-tight">{formatDate(backup.data).split(' ')[0]}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/70">{formatDate(backup.data).split(' ')[1]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-left text-sm text-gray-600">{backup.tipo || "Manual"}</TableCell>
                        <TableCell className="text-left text-sm font-medium text-gray-700">{formatSize(backup.tamanho)}</TableCell>
                        <TableCell className="text-left text-sm text-gray-500">{backup.duracao || "N/A"}</TableCell>
                        <TableCell className="text-left">
                          <Badge className={`${config.cor} rounded-full px-3 text-[10px] shadow-none border-none`}>
                            <IconStatus className="size-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-left">
                          <div className="flex justify-start gap-2">
                            {backup.status === "sucesso" && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-[#3ba5d8] hover:text-[#3ba5d8] hover:bg-[#3ba5d8]/10 h-8 px-2"
                                >
                                  <Download className="size-4 mr-1.5" />
                                  Baixar
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-600 hover:text-green-600 hover:bg-green-50 h-8 px-2"
                                >
                                  <Upload className="size-4 mr-1.5" />
                                  Restaurar
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
