"use client"

import { useEffect, useState } from "react"

export function DashboardFooter() {
  const [clientIp, setClientIp] = useState<string>("Carregando...")

  useEffect(() => {
    // Simula a obtenção do IP local
    // Em produção, isso viria do backend ou de um serviço externo
    const fetchIp = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json")
        const data = await response.json()
        setClientIp(data.ip)
      } catch {
        setClientIp("Não disponível")
      }
    }
    fetchIp()
  }, [])

  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#1a3a5c]/10 bg-white px-4 py-3 text-xs text-[#1a3a5c]/60">
      <p>
        &copy; {new Date().getFullYear()} SwiftDesk - Agile Support Solutions. Todos os direitos reservados.
      </p>
      <p className="flex items-center gap-1">
        <span>IP da Máquina:</span>
        <span className="font-mono bg-[#1a3a5c]/5 px-2 py-0.5 rounded">{clientIp}</span>
      </p>
    </footer>
  )
}
