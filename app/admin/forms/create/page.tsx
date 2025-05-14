"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

export default function CreateFormPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    submit_button_text: "Enviar",
    success_message: "Obrigado pela sua participação!",
  })

  const supabase = createClientComponentClient<Database>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar dados
      if (!formData.title.trim()) {
        setError("O título do formulário é obrigatório")
        return
      }

      // Gerar URL de compartilhamento única
      const uniqueId = crypto.randomUUID()
      const shareUrl = `/forms/${uniqueId}`

      // Criar formulário
      const { data: form, error: insertError } = await supabase
        .from("forms")
        .insert({
          title: formData.title,
          description: formData.description,
          content: JSON.stringify([]),
          published: false,
          submit_button_text: formData.submit_button_text,
          success_message: formData.success_message,
          share_url: shareUrl,
          active: true,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Erro ao inserir formulário:", insertError)
        throw new Error(insertError.message)
      }

      if (!form) {
        throw new Error("Falha ao criar formulário: nenhum dado retornado")
      }

      // Redirecionar para o construtor de formulários
      toast({
        title: "Sucesso",
        description: "Formulário criado com sucesso",
      })

      // Usar setTimeout para garantir que o toast seja exibido antes do redirecionamento
      setTimeout(() => {
        router.push(`/admin/forms/builder/${form.id}`)
      }, 500)
    } catch (err) {
      console.error("Erro ao criar formulário:", err)
      setError(err instanceof Error ? err.message : "Falha ao criar formulário")
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao criar formulário",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Criar novo formulário</h1>
        <p className="text-muted-foreground">Comece preenchendo as informações básicas sobre seu formulário</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Formulário</CardTitle>
            <CardDescription>Informações básicas sobre seu formulário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nome do Formulário</Label>
              <Input
                id="title"
                name="title"
                placeholder="ex: Pesquisa de Satisfação"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descreva o propósito deste formulário"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submit_button_text">Texto do Botão de Envio</Label>
              <Input
                id="submit_button_text"
                name="submit_button_text"
                placeholder="ex: Enviar Respostas"
                value={formData.submit_button_text}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="success_message">Mensagem de Sucesso</Label>
              <Input
                id="success_message"
                name="success_message"
                placeholder="ex: Obrigado pela sua participação!"
                value={formData.success_message}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/forms")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? "Criando..." : "Continuar para o Construtor"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
