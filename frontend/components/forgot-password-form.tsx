"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail } from "lucide-react"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    console.log("Recuperação de senha para:", email)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-[#1a3a5c] hover:bg-[#1a3a5c]/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="text-2xl font-bold text-[#1a3a5c]">Esqueci minha senha</CardTitle>
            <CardDescription>Informe seu e-mail para recuperar a senha</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#7ac142]/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-[#7ac142]" />
            </div>
            <h3 className="font-semibold text-lg text-[#1a3a5c]">E-mail enviado!</h3>
            <p className="text-muted-foreground">
              Se o e-mail informado estiver cadastrado, você receberá as instruções para recuperar sua senha.
            </p>
            <Button
              onClick={onBack}
              className="w-full bg-[#1a3a5c] hover:bg-[#2a4a6c] text-white"
            >
              Voltar ao login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailRecuperacao">E-mail</Label>
              <Input
                id="emailRecuperacao"
                type="email"
                placeholder="Digite seu e-mail cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-[#3ba5d8] hover:bg-[#2b95c8] text-white">
              Enviar instruções
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
