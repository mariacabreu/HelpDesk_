"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CompanySidebar } from "@/components/company-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { ChamadosPage } from "@/components/pages/chamados-page"
import { EquipamentosPage } from "@/components/pages/equipamentos-page"
import { RelatoriosPage } from "@/components/pages/relatorios-page"
import { EscalonadosPage } from "@/components/pages/escalonados-page"
import { DashboardSuportePage } from "@/components/pages/dashboard-suporte-page"
import { DashboardEmpresaPage } from "@/components/pages/dashboard-empresa-page"
import { NovoChamadoPage } from "@/components/pages/empresa/novo-chamado-page"
import { MeusChamadosPage } from "@/components/pages/empresa/meus-chamados-page"
import { MeusEquipamentosPage } from "@/components/pages/empresa/meus-equipamentos-page"
import { GestaoFuncionariosPage } from "@/components/pages/empresa/gestao-funcionarios-page"
import { LogsPage } from "@/components/pages/empresa/logs-page"
import { BackupPage } from "@/components/pages/empresa/backup-page"
import { AuditoriaPage } from "@/components/pages/empresa/auditoria-page"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard-suporte")
  const [userRole, setUserRole] = useState<"suporte" | "empresa">("suporte")
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Carregar dados do usuário do localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      setUserRole(user.role)
      setActiveTab(user.role === "suporte" ? "dashboard-suporte" : "dashboard-empresa")
    }
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      // Suporte Tabs
      case "dashboard-suporte":
        return <DashboardSuportePage />
      case "chamados":
        return <ChamadosPage />
      case "equipamentos":
        return <EquipamentosPage />
      case "relatorios":
        return <RelatoriosPage />
      case "escalonados":
        return <EscalonadosPage />
      
      // Empresa Tabs
      case "dashboard-empresa":
        return <DashboardEmpresaPage />
      case "novo-chamado":
        return <NovoChamadoPage onTicketCreated={() => setActiveTab("meus-chamados")} />
      case "meus-chamados":
        return <MeusChamadosPage />
      case "meus-equipamentos":
        return <MeusEquipamentosPage />
      case "gestao-funcionarios":
        return <GestaoFuncionariosPage />
      case "logs":
        return <LogsPage />
      case "backup":
        return <BackupPage />
      case "auditoria":
        return <AuditoriaPage />
        
      default:
        return userRole === "suporte" ? <DashboardSuportePage /> : <DashboardEmpresaPage />
    }
  }

  const handleRoleChange = (role: "suporte" | "empresa") => {
    setUserRole(role)
    setActiveTab(role === "suporte" ? "dashboard-suporte" : "dashboard-empresa")
  }

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      {userRole === "suporte" ? (
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      ) : (
        <CompanySidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <DashboardHeader 
          userRole={userRole} 
          onRoleChange={handleRoleChange} 
          userName={userRole === "empresa" ? userData?.empresa?.nome_fantasia : userData?.nome}
          userEmail={userRole === "empresa" ? userData?.empresa?.email : userData?.email}
          userCargo={userRole === "empresa" ? "Administrador Empresa" : userData?.cargo}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-50/50">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}
