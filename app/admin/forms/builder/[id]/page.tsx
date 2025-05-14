"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Info,
  Trash,
  Plus,
  MoveVertical,
  Type,
  Hash,
  CalendarIcon,
  ListFilter,
  CheckSquare,
  AlignLeft,
  Save,
  Eye,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { FormElementType, FormElement } from "@/components/admin/form-elements"

// Available form elements
const availableElements: FormElementType[] = [
  { type: "text", icon: <Type className="h-5 w-5" />, label: "Campo de Texto" },
  { type: "number", icon: <Hash className="h-5 w-5" />, label: "Campo Numérico" },
  { type: "textarea", icon: <AlignLeft className="h-5 w-5" />, label: "Área de Texto" },
  { type: "date", icon: <CalendarIcon className="h-5 w-5" />, label: "Data" },
  { type: "select", icon: <ListFilter className="h-5 w-5" />, label: "Seleção" },
  { type: "checkbox", icon: <CheckSquare className="h-5 w-5" />, label: "Checkbox" },
]

interface Form {
  id: string
  name: string
  description: string
  content: string | any[] | null
  published: number | boolean
  submitButtonText: string
  successMessage: string
  redirectUrl: string
  shareURL: string
}

export default function FormBuilderPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("editor")
  const [formElements, setFormElements] = useState<FormElement[]>([])
  const [formSettings, setFormSettings] = useState({
    name: "",
    description: "",
    published: false,
    submitButtonText: "Enviar",
    successMessage: "Obrigado pela sua participação!",
    redirectUrl: "",
  })
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/forms/${id}`)
        if (!response.ok) {
          throw new Error("Falha ao buscar formulário")
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || "Falha ao buscar formulário")
        }

        const form = data.data as Form

        setFormSettings({
          name: form.name || "Novo Formulário",
          description: form.description || "",
          published: form.published === 1 || form.published === true,
          submitButtonText: form.submitButtonText || "Enviar",
          successMessage: form.successMessage || "Obrigado pela sua participação!",
          redirectUrl: form.redirectUrl || "",
        })

        // Normalizar o conteúdo do formulário
        try {
          let parsedContent: any[] = []

          // Se o conteúdo for uma string, tente analisá-lo como JSON
          if (typeof form.content === "string") {
            // Verificar se a string está vazia
            if (!form.content.trim()) {
              parsedContent = []
            } else {
              try {
                parsedContent = JSON.parse(form.content)
              } catch (e) {
                console.error("Erro ao analisar conteúdo do formulário:", e)
                parsedContent = []
              }
            }
          }
          // Se o conteúdo for um array, use-o diretamente
          else if (Array.isArray(form.content)) {
            parsedContent = form.content
          }
          // Se o conteúdo for um objeto, coloque-o em um array
          else if (form.content && typeof form.content === "object") {
            parsedContent = [form.content]
          }
          // Se o conteúdo for nulo ou indefinido, use um array vazio
          else {
            parsedContent = []
          }

          // Garantir que o conteúdo seja um array
          if (!Array.isArray(parsedContent)) {
            parsedContent = []
          }

          setFormElements(parsedContent)

          // Atualizar o conteúdo no banco de dados se estiver vazio ou inválido
          if (!form.content || form.content === "" || form.content === "null" || form.content === "undefined") {
            await fetch(`/api/forms/${id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: JSON.stringify([]),
              }),
            })
          }
        } catch (e) {
          console.error("Erro ao processar conteúdo do formulário:", e)
          setFormElements([])
          setError("Erro ao processar conteúdo do formulário. Um array vazio foi usado como fallback.")
        }
      } catch (err) {
        console.error("Erro ao buscar formulário:", err)
        setError(err instanceof Error ? err.message : "Ocorreu um erro")
        toast({
          title: "Erro",
          description: err instanceof Error ? err.message : "Falha ao buscar formulário",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [id, toast])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(formElements)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFormElements(items)
  }

  const addElement = (type: string) => {
    const newElement: FormElement = {
      id: `element-${Date.now()}`,
      type,
      attributes: {
        label: `Novo campo ${type}`,
        placeholder: `Digite ${type}...`,
        required: false,
      },
    }

    if (type === "select") {
      newElement.attributes.options = ["Opção 1", "Opção 2", "Opção 3"]
    }

    setFormElements([...formElements, newElement])
  }

  const removeElement = (id: string) => {
    setFormElements(formElements.filter((element) => element.id !== id))
  }

  const updateElement = (id: string, attributes: any) => {
    setFormElements(
      formElements.map((element) =>
        element.id === id ? { ...element, attributes: { ...element.attributes, ...attributes } } : element,
      ),
    )
  }

  const handleSettingsChange = (field: string, value: any) => {
    setFormSettings((prev) => ({ ...prev, [field]: value }))
  }

  const saveForm = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formSettings.name,
          description: formSettings.description,
          content: JSON.stringify(formElements),
          submitButtonText: formSettings.submitButtonText,
          successMessage: formSettings.successMessage,
          redirectUrl: formSettings.redirectUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Falha ao salvar formulário")
      }

      toast({
        title: "Formulário salvo",
        description: "Seu formulário foi salvo com sucesso.",
      })
    } catch (err) {
      console.error("Erro ao salvar formulário:", err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao salvar formulário",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const publishForm = async () => {
    setPublishing(true)
    try {
      // Primeiro salvar o formulário
      await saveForm()

      const response = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Falha ao publicar formulário")
      }

      setFormSettings((prev) => ({ ...prev, published: true }))

      toast({
        title: "Formulário publicado",
        description: "Seu formulário foi publicado com sucesso.",
      })

      // Redirecionar para a visualização do formulário
      router.push(`/admin/forms/${id}`)
    } catch (err) {
      console.error("Erro ao publicar formulário:", err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao publicar formulário",
        variant: "destructive",
      })
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <div className="w-1/3 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="md:col-span-3 h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{formSettings.name}</h1>
          <p className="text-muted-foreground">{formSettings.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/forms")}>
            Voltar
          </Button>
          <Button variant="outline" onClick={saveForm} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button onClick={publishForm} disabled={publishing || formElements.length === 0}>
            <Eye className="mr-2 h-4 w-4" />
            {publishing ? "Publicando..." : "Publicar Formulário"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor de Formulário</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Elementos do Formulário</CardTitle>
                <CardDescription>Arraste e solte elementos para construir seu formulário</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {availableElements.map((element) => (
                    <Button
                      key={element.type}
                      variant="outline"
                      className="h-24 flex flex-col gap-2 justify-center"
                      onClick={() => addElement(element.type)}
                    >
                      {element.icon}
                      <span>{element.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Visualização do Formulário</CardTitle>
                <CardDescription>
                  {formElements.length === 0
                    ? "Adicione elementos do painel à esquerda para começar a construir seu formulário"
                    : "Arraste para reordenar elementos"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="form-elements">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {formElements.length === 0 ? (
                          <div className="border-2 border-dashed rounded-md p-8 text-center">
                            <p className="text-muted-foreground">
                              Seu formulário está vazio. Adicione elementos para começar.
                            </p>
                            <Button variant="outline" className="mt-4" onClick={() => addElement("text")}>
                              <Plus className="mr-2 h-4 w-4" /> Adicionar Campo de Texto
                            </Button>
                          </div>
                        ) : (
                          formElements.map((element, index) => (
                            <Draggable key={element.id} draggableId={element.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border rounded-md p-4"
                                >
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps}>
                                        <MoveVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                      </div>
                                      <h3 className="font-medium">{element.attributes.label}</h3>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeElement(element.id)}
                                      className="h-8 w-8"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor={`${element.id}-label`}>Rótulo do Campo</Label>
                                      <Input
                                        id={`${element.id}-label`}
                                        value={element.attributes.label || ""}
                                        onChange={(e) => updateElement(element.id, { label: e.target.value })}
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor={`${element.id}-placeholder`}>Placeholder</Label>
                                      <Input
                                        id={`${element.id}-placeholder`}
                                        value={element.attributes.placeholder || ""}
                                        onChange={(e) => updateElement(element.id, { placeholder: e.target.value })}
                                      />
                                    </div>

                                    {element.type === "select" && (
                                      <div>
                                        <Label htmlFor={`${element.id}-options`}>Opções (uma por linha)</Label>
                                        <Textarea
                                          id={`${element.id}-options`}
                                          value={(element.attributes.options || []).join("\n")}
                                          onChange={(e) =>
                                            updateElement(element.id, {
                                              options: e.target.value.split("\n").filter((opt) => opt.trim()),
                                            })
                                          }
                                          rows={3}
                                        />
                                      </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={`${element.id}-required`}
                                        checked={element.attributes.required || false}
                                        onCheckedChange={(checked) => updateElement(element.id, { required: checked })}
                                      />
                                      <Label htmlFor={`${element.id}-required`}>Campo obrigatório</Label>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {formElements.length > 0 && (
                  <div className="mt-6">
                    <Button className="w-full">{formSettings.submitButtonText}</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Formulário</CardTitle>
              <CardDescription>Configure as opções do seu formulário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="form-name">Nome do Formulário</Label>
                <Input
                  id="form-name"
                  value={formSettings.name}
                  onChange={(e) => handleSettingsChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-description">Descrição</Label>
                <Textarea
                  id="form-description"
                  value={formSettings.description}
                  onChange={(e) => handleSettingsChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="submit-button-text">Texto do Botão de Envio</Label>
                <Input
                  id="submit-button-text"
                  value={formSettings.submitButtonText}
                  onChange={(e) => handleSettingsChange("submitButtonText", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="success-message">Mensagem de Sucesso</Label>
                <Textarea
                  id="success-message"
                  value={formSettings.successMessage}
                  onChange={(e) => handleSettingsChange("successMessage", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="redirect-url">URL de Redirecionamento (opcional)</Label>
                <Input
                  id="redirect-url"
                  placeholder="https://exemplo.com/obrigado"
                  value={formSettings.redirectUrl}
                  onChange={(e) => handleSettingsChange("redirectUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Se fornecido, os usuários serão redirecionados para esta URL após o envio do formulário
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("editor")}>
                Voltar para o Editor
              </Button>
              <Button onClick={saveForm} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
