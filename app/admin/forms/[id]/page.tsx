"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Eye, Edit, Download, Share2 } from "lucide-react"
import { StatsCard } from "@/components/admin/stats-card"
import { format, formatDistance } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

interface Form {
  id: string
  title: string
  description: string
  content: any
  published: boolean
  share_url: string
  visits?: number
  submissions?: number
  created_at: string
}

interface FormSubmission {
  id: string
  form_id: string
  data: Record<string, any>
  created_at: string
}

export default function FormDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [visitCount, setVisitCount] = useState(0)
  const [submissionCount, setSubmissionCount] = useState(0)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Verificar se o ID é válido
        if (!id || id === "create") {
          throw new Error("ID de formulário inválido")
        }

        // Buscar formulário
        const { data: formData, error: formError } = await supabase.from("forms").select("*").eq("id", id).single()

        if (formError) {
          console.error("Erro ao buscar formulário:", formError)
          throw new Error("Formulário não encontrado")
        }

        if (!formData) {
          throw new Error("Formulário não encontrado")
        }

        // Normalizar o conteúdo do formulário
        let normalizedContent = []
        try {
          // Se o conteúdo for uma string, tente analisá-lo como JSON
          if (typeof formData.content === "string") {
            normalizedContent = JSON.parse(formData.content)
          }
          // Se o conteúdo for um objeto, verifique se é um array
          else if (typeof formData.content === "object") {
            if (Array.isArray(formData.content)) {
              normalizedContent = formData.content
            } else {
              // Se for um objeto mas não um array, coloque-o em um array
              normalizedContent = [formData.content]
            }
          }
        } catch (e) {
          console.error("Erro ao analisar conteúdo do formulário:", e)
          normalizedContent = []
        }

        // Atualizar o conteúdo do formulário para garantir que seja um array válido
        const { error: updateError } = await supabase
          .from("forms")
          .update({ content: JSON.stringify(normalizedContent) })
          .eq("id", id)

        if (updateError) {
          console.error("Erro ao atualizar conteúdo do formulário:", updateError)
        }

        // Atualizar o objeto formData com o conteúdo normalizado
        formData.content = normalizedContent

        // Buscar envios
        const { data: submissionsData, error: submissionsError } = await supabase
          .from("form_submissions")
          .select("*")
          .eq("form_id", id)
          .order("created_at", { ascending: false })

        if (submissionsError) {
          console.error("Erro ao buscar envios:", submissionsError)
        }

        // Contar visitas
        const { count: visitCountData, error: visitCountError } = await supabase
          .from("form_visits")
          .select("*", { count: "exact", head: true })
          .eq("form_id", id)

        if (visitCountError) {
          console.error("Erro ao contar visitas:", visitCountError)
        }

        // Contar envios
        const { count: submissionCountData, error: submissionCountError } = await supabase
          .from("form_submissions")
          .select("*", { count: "exact", head: true })
          .eq("form_id", id)

        if (submissionCountError) {
          console.error("Erro ao contar envios:", submissionCountError)
        }

        setForm(formData as Form)
        setSubmissions(submissionsData || [])
        setVisitCount(visitCountData || 0)
        setSubmissionCount(submissionCountData || 0)
      } catch (err) {
        console.error("Erro ao buscar dados do formulário:", err)
        setError(err instanceof Error ? err.message : "Ocorreu um erro")

        // Se o erro for "Formulário não encontrado", redirecionar para a lista de formulários
        if (err instanceof Error && err.message === "Formulário não encontrado") {
          toast({
            title: "Erro",
            description: "Formulário não encontrado. Redirecionando para a lista de formulários.",
            variant: "destructive",
          })

          // Usar setTimeout para garantir que o toast seja exibido antes do redirecionamento
          setTimeout(() => {
            router.push("/admin/forms")
          }, 1500)
        } else {
          toast({
            title: "Erro",
            description: err instanceof Error ? err.message : "Falha ao buscar dados do formulário",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchFormData()
  }, [id, toast, router, supabase])

  const copyShareLink = () => {
    if (!form) return

    const fullUrl = `${window.location.origin}${form.share_url}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportSubmissions = () => {
    if (!form || !submissions.length) return

    try {
      // Criar conteúdo CSV
      let formElements: any[] = []
      try {
        // Garantir que o conteúdo seja um array válido
        formElements = Array.isArray(form.content) ? form.content : []
      } catch (e) {
        console.error("Erro ao analisar conteúdo do formulário:", e)
        formElements = []
        toast({
          title: "Aviso",
          description: "Não foi possível analisar o conteúdo do formulário. Exportando apenas dados básicos.",
          variant: "default",
        })
      }

      const columns = formElements
        .filter((element: any) => ["text", "textarea", "select", "checkbox", "date", "number"].includes(element.type))
        .map((element: any) => ({
          id: element.id,
          label: element.attributes?.label || element.id,
        }))

      // Se não houver colunas definidas, usar as chaves do primeiro envio
      if (columns.length === 0 && submissions.length > 0) {
        const firstSubmission = submissions[0]
        const keys = Object.keys(firstSubmission.data || {})
        columns.push(...keys.map((key) => ({ id: key, label: key })))
      }

      // Adicionar cabeçalhos
      let csvContent = columns.map((col) => `"${col.label}"`).join(",") + ",Data de Envio\n"

      // Adicionar linhas
      submissions.forEach((submission) => {
        try {
          const content = submission.data || {}
          const row = columns.map((col) => {
            const value = content[col.id] || ""
            return `"${value.toString().replace(/"/g, '""')}"`
          })
          row.push(`"${format(new Date(submission.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}"`)
          csvContent += row.join(",") + "\n"
        } catch (e) {
          console.error("Erro ao analisar envio:", e)
        }
      })

      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${form.title.replace(/\s+/g, "_")}_envios.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Erro ao exportar envios:", err)
      toast({
        title: "Erro",
        description: "Falha ao exportar envios",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error || "Formulário não encontrado"}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/admin/forms")}>
          Voltar para Formulários
        </Button>
      </div>
    )
  }

  // Calcular taxa de envio e taxa de abandono
  let submissionRate = 0
  let bounceRate = 0

  if (visitCount > 0) {
    submissionRate = Math.round((submissionCount / visitCount) * 100)
    bounceRate = 100 - submissionRate
  }

  // Analisar elementos do formulário para obter colunas para a tabela de envios
  let columns: { id: string; label: string; type: string }[] = []
  try {
    // Garantir que o conteúdo seja um array válido
    const formElements = Array.isArray(form.content) ? form.content : []
    columns = formElements
      .filter((element: any) => ["text", "textarea", "select", "checkbox", "date", "number"].includes(element.type))
      .map((element: any) => ({
        id: element.id,
        label: element.attributes?.label || element.id,
        type: element.type,
      }))
  } catch (e) {
    console.error("Erro ao analisar conteúdo do formulário:", e)
    // Não mostrar erro na interface, apenas usar um array vazio
    columns = []
  }

  // Se não houver colunas definidas, usar as chaves do primeiro envio
  if (columns.length === 0 && submissions.length > 0) {
    try {
      const firstSubmission = submissions[0]
      const data = firstSubmission.data || {}
      columns = Object.keys(data).map((key) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        type: typeof data[key] === "boolean" ? "checkbox" : "text",
      }))
    } catch (e) {
      console.error("Erro ao criar colunas a partir dos dados:", e)
    }
  }

  // Analisar envios para obter linhas para a tabela
  const rows = submissions.map((submission) => {
    try {
      return {
        ...submission.data,
        submittedAt: submission.created_at,
      }
    } catch (e) {
      console.error("Erro ao analisar conteúdo do envio:", e)
      return { submittedAt: submission.created_at }
    }
  })

  return (
    <div className="space-y-6">
      <div className="py-4 border-b border-muted">
        <div className="container flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold truncate">{form.title}</h1>
            <p className="text-muted-foreground">{form.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/forms/builder/${id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Formulário
            </Button>
            <Button variant="outline" onClick={exportSubmissions} disabled={!submissions.length}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="container">
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container py-4 flex gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">URL de Compartilhamento:</span>
          <code className="bg-muted px-2 py-1 rounded text-sm">
            {window.location.origin}
            {form.share_url}
          </code>
          <Button variant="ghost" size="icon" onClick={copyShareLink}>
            <Share2 className="h-4 w-4" />
          </Button>
          {copied && <span className="text-xs text-green-600">Copiado!</span>}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`${window.location.origin}${form.share_url}`, "_blank")}
        >
          <Eye className="mr-2 h-4 w-4" />
          Visualizar Formulário
        </Button>
      </div>

      <div className="container w-full pt-4 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de visitas"
          icon={<Eye className="text-blue-600 h-4 w-4" />}
          helperText="Todas as visitas ao formulário"
          value={visitCount.toLocaleString()}
          loading={false}
          className="shadow-md shadow-blue-600"
        />

        <StatsCard
          title="Total de envios"
          icon={<Edit className="text-yellow-600 h-4 w-4" />}
          helperText="Todos os envios do formulário"
          value={submissionCount.toLocaleString()}
          loading={false}
          className="shadow-md shadow-yellow-600"
        />

        <StatsCard
          title="Taxa de conversão"
          icon={<Eye className="text-green-600 h-4 w-4" />}
          helperText="Visitas que resultam em envio"
          value={submissionRate.toLocaleString() + "%"}
          loading={false}
          className="shadow-md shadow-green-600"
        />

        <StatsCard
          title="Taxa de abandono"
          icon={<Info className="text-red-600 h-4 w-4" />}
          helperText="Visitas que saem sem interagir"
          value={bounceRate.toLocaleString() + "%"}
          loading={false}
          className="shadow-md shadow-red-600"
        />
      </div>

      <div className="container pt-10">
        <h2 className="text-2xl font-bold mb-4">Envios</h2>
        {submissions.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">Nenhum envio ainda.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.id} className="uppercase">
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-muted-foreground text-right uppercase">Enviado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {column.type === "checkbox"
                          ? row[column.id] === "true" || row[column.id] === true
                            ? "Sim"
                            : "Não"
                          : column.type === "date"
                            ? row[column.id]
                              ? format(new Date(row[column.id]), "dd/MM/yyyy", { locale: ptBR })
                              : ""
                            : row[column.id] || ""}
                      </TableCell>
                    ))}

                    <TableCell className="text-muted-foreground text-right">
                      {formatDistance(new Date(row.submittedAt), new Date(), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
