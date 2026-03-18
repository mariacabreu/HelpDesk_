"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

interface LoginFormProps {
  onForgotPassword: () => void
  onRegisterCompany: () => void
  onRegisterEmployee: () => void
}

export function LoginForm({ onForgotPassword, onRegisterCompany, onRegisterEmployee }: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao fazer login")
      }
      
      const userData = await response.json()
      
      // Armazenar dados do usuário no localStorage para persistência simples
      localStorage.setItem("user", JSON.stringify(userData))
      
      // Redirecionar para o dashboard após o login
      router.push("/dashboard")
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.")
      } else {
        setError(err.message || "Ocorreu um erro ao tentar entrar. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#1a3a5c]">Entrar</CardTitle>
        <CardDescription>Acesse sua conta SwiftDesk</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center font-medium">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="login">Login</Label>
            <Input
              id="login"
              type="text"
              placeholder="Digite seu login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#1a3a5c] hover:bg-[#2a4a6c] text-white"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <button
            type="button"
            onClick={onForgotPassword}
            className="w-full text-sm text-[#3ba5d8] hover:text-[#2b95c8] hover:underline"
          >
            Esqueci minha senha
          </button>

          <div className="flex flex-col gap-2 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">Ainda não tem conta?</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-[#7ac142] text-[#7ac142] hover:bg-[#7ac142] hover:text-white"
                onClick={onRegisterCompany}
              >
                Cadastrar Empresa
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-[#3ba5d8] text-[#3ba5d8] hover:bg-[#3ba5d8] hover:text-white"
                onClick={onRegisterEmployee}
              >
                Cadastrar Funcionário
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
