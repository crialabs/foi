"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Plus, Edit, Eye, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

interface Form {
  id: string
  title: string
  description: string
  published: boolean
  created_at: string
  updated_at: string
  visits: number
  submissions: number
}

export default function FormsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClientComponentClient<Database>()

  const fetchForms = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar formulários
      const { data, error: formsError } = await supabase
        .from("forms")
        .select("*")
        .order("created_at", { ascending: false })

      if (formsError) {
        throw new Error("Falha ao buscar formulários")
      }

      setForms(data || [])

      // Se houver apenas um formulário, redirecionar para ele
      if (data && data.length === 1) {
        router.push(`/admin/forms/${data[0].id}`)
      }
    } catch (err) {
      console.error("Erro ao buscar formulários:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro")
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao buscar formulários",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForms()
  }, [toast])

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)

      // Excluir formulário
      const { error: deleteError } = await supabase.from("forms").delete().eq("id", id)

      if (deleteError) {
        throw new Error("Falha ao excluir formulário")
      }

      // Atualizar lista de formulários
      setForms((prev) => prev.filter((form) => form.id !== id))
      toast({
        title: "Sucesso",
        description: "Formulário excluído com sucesso",
      })
    } catch (err) {
      console.error("Erro ao excluir formulário:", err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao excluir formulário",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      // Atualizar status de publicação
      const { error: updateError } = await supabase.from("forms").update({ published: !currentStatus }).eq("id", id)

      if (updateError) {
        throw new Error("Falha ao atualizar status de publicação")
      }

      // Atualizar lista de formulários
      setForms((prev) => prev.map((form) => (form.id === id ? { ...form, published: !currentStatus } : form)))
      toast({
        title: "Sucesso",
        description: `Formulário ${!currentStatus ? "publicado" : "despublicado"} com sucesso`,
      })
    } catch (err) {
      console.error("Erro ao atualizar status de publicação:", err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao atualizar status de publicação",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Formulários</h1>
        <Button onClick={() => router.push("/admin/forms/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Formulário
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {forms.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Nenhum formulário encontrado</h2>
          <p className="text-muted-foreground mb-6">Comece criando seu primeiro formulário</p>
          <Button onClick={() => router.push("/admin/forms/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Formulário
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="truncate">{form.title}</CardTitle>
                <CardDescription className="truncate">{form.description || "Sem descrição"}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Visitas: {form.visits}</span>
                  <span>Envios: {form.submissions}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Criado: {format(new Date(form.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                  <span className={form.published ? "text-green-600" : "text-amber-600"}>
                    {form.published ? "Publicado" : "Rascunho"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/admin/forms/${form.id}`)}
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/admin/forms/builder/${form.id}`)}
                    title="Editar formulário"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(form.id)}
                    disabled={deletingId === form.id}
                    title="Excluir formulário"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <Button
                  variant={form.published ? "default" : "secondary"}
                  size="sm"
                  onClick={() => handleTogglePublish(form.id, form.published)}
                >
                  {form.published ? "Despublicar" : "Publicar"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
