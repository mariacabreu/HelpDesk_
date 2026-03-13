"use client"

import { useState } from "react"
import Image from "next/image"
import { LoginForm } from "@/components/login-form"
import { EmployeeForm } from "@/components/employee-form"
import { CompanyForm } from "@/components/company-form"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

type View = "login" | "employee" | "company" | "forgot-password"

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<View>("login")

  const renderForm = () => {
    switch (currentView) {
      case "login":
        return (
          <LoginForm
            onForgotPassword={() => setCurrentView("forgot-password")}
            onRegisterCompany={() => setCurrentView("company")}
            onRegisterEmployee={() => setCurrentView("employee")}
          />
        )
      case "employee":
        return <EmployeeForm onBack={() => setCurrentView("login")} />
      case "company":
        return <CompanyForm onBack={() => setCurrentView("login")} />
      case "forgot-password":
        return <ForgotPasswordForm onBack={() => setCurrentView("login")} />
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Lado esquerdo - Logo */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#1a3a5c] to-[#2a5a8c] flex flex-col items-center justify-center p-8 lg:p-12 min-h-[200px] lg:min-h-screen">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EVV0mjLChmLZBH7wltzdfST7TBxYpQ.png"
              alt="SwiftDesk Logo"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center text-white">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">SwiftDesk</h1>
            <p className="text-lg lg:text-xl text-white/80 mt-2">Agile Support Solutions</p>
          </div>
          <p className="text-white/60 text-sm max-w-xs text-center hidden lg:block">
            A solução completa para gerenciamento de suporte e atendimento ao cliente
          </p>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#f0f7fc] to-[#e8f5e9] flex flex-col items-center justify-center p-4 lg:p-8 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          {renderForm()}
          
          <p className="text-sm text-muted-foreground">
            © 2024 SwiftDesk. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </main>
  )
}
