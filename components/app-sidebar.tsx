"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  Monitor,
  BarChart3,
  RefreshCw,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard-suporte",
  },
  {
    title: "Listar Chamados",
    icon: ClipboardList,
    id: "chamados",
  },
  {
    title: "Equipamentos",
    icon: Monitor,
    id: "equipamentos",
  },
  {
    title: "Relatórios",
    icon: BarChart3,
    id: "relatorios",
  },
  {
    title: "Chamados Escalonados",
    icon: RefreshCw,
    id: "escalonados",
  },
]

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <Sidebar className="border-r border-[#1a3a5c]/10">
      <SidebarHeader className="border-b border-[#1a3a5c]/10 p-4">
        <div className="flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EVV0mjLChmLZBH7wltzdfST7TBxYpQ.png"
            alt="SwiftDesk Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-[#1a3a5c]">SwiftDesk</span>
            <span className="text-xs text-[#7ac142]">Agile Support</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#1a3a5c]/70">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    data-active={activeTab === item.id}
                    className="hover:bg-[#3ba5d8]/10 data-[active=true]:bg-[#3ba5d8]/20 data-[active=true]:text-[#1a3a5c] cursor-pointer"
                  >
                    <item.icon className="size-5 text-[#3ba5d8]" />
                    <span className="text-[#1a3a5c]">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="size-5" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#1a3a5c]/10 p-4">
        <p className="text-xs text-[#1a3a5c]/60 text-center">
          SwiftDesk v1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
