"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Key, Lock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<"email" | "code" | "reset" | "success">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/recovery/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      if (!res.ok) throw new Error("Erro ao solicitar código")
      setStep("code")
      toast.success("Código enviado!", { description: "Verifique sua caixa de entrada." })
    } catch (err: any) {
      toast.error("Erro", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/recovery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.toUpperCase() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Código inválido")
      setStep("reset")
    } catch (err: any) {
      toast.error("Erro", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Erro", { description: "As senhas não coincidem." })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/recovery/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.toUpperCase(), new_password: newPassword })
      })
      if (!res.ok) throw new Error("Erro ao atualizar senha")
      setStep("success")
    } catch (err: any) {
      toast.error("Erro", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          {step !== "success" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={step === "email" ? onBack : () => setStep("email")}
              className="text-[#1a3a5c] hover:bg-[#1a3a5c]/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <CardTitle className="text-2xl font-bold text-[#1a3a5c]">
              {step === "email" && "Esqueci minha senha"}
              {step === "code" && "Verificar código"}
              {step === "reset" && "Nova senha"}
              {step === "success" && "Senha alterada!"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "Informe seu e-mail para recuperar a senha"}
              {step === "code" && "Digite o código de 5 caracteres enviado ao seu e-mail"}
              {step === "reset" && "Crie uma nova senha de acesso"}
              {step === "success" && "Sua senha foi atualizada com sucesso"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {step === "email" && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button disabled={loading} type="submit" className="w-full bg-[#3ba5d8] hover:bg-[#2b95c8] text-white">
              {loading ? "Enviando..." : "Enviar código"}
            </Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  placeholder="EX: A1B2C"
                  className="pl-10 uppercase font-mono tracking-widest"
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button disabled={loading} type="submit" className="w-full bg-[#7ac142] hover:bg-[#6ab035] text-white">
              {loading ? "Verificando..." : "Verificar código"}
            </Button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pass">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pass"
                  type="password"
                  placeholder="********"
                  className="pl-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  placeholder="********"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button disabled={loading} type="submit" className="w-full bg-[#1a3a5c] hover:bg-[#2a4a6c] text-white">
              {loading ? "Salvando..." : "Alterar Senha"}
            </Button>
          </form>
        )}

        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-muted-foreground">
              Você já pode fazer login com sua nova senha.
            </p>
            <Button
              onClick={onBack}
              className="w-full bg-[#1a3a5c] hover:bg-[#2a4a6c] text-white"
            >
              Ir para o login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
