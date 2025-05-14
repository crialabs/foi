"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Info, Trash, Save, Eye, ArrowLeft, ArrowRight, Settings, Layers, PlusCircle } from "lucide-react"
import { FormElementEditor } from "./form-element-editor"
import type { FormElement } from "./form-elements"

interface Step {
  id: number
  title: string
  description: string
  content: FormElement[]
  order_index: number
}

interface FormData {
  id: number
  name: string
  description: string
  published: number
  submitButtonText: string
  successMessage: string
  redirectUrl: string
  steps: Step[]
}

interface MultistepFormBuilderProps {
  formId: string
  isNew?: boolean
}

export function MultistepFormBuilder({ formId, isNew = false }: MultistepFormBuilderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("steps")
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    id: Number.parseInt(formId),
    name: "",
    description: "",
    published: 0,
    submitButtonText: "Submit",
    successMessage: "Thank you for your submission!",
    redirectUrl: "",
    steps: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      if (isNew) {
        setFormData({
          id: Number.parseInt(formId),
          name: "New Multistep Form",
          description: "A multistep form with prize wheel",
          published: 0,
          submitButtonText: "Submit",
          successMessage: "Thank you for your submission!",
          redirectUrl: "",
          steps: [
            {
              id: 0,
              title: "Step 1",
              description: "First step of your form",
              content: [],
              order_index: 0,
            },
          ],
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/forms/${formId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch form")
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch form")
        }

        const form = data.data

        // Ensure steps are sorted by order_index
        const steps = form.steps.sort((a: Step, b: Step) => a.order_index - b.order_index)

        setFormData({
          id: form.id,
          name: form.name,
          description: form.description || "",
          published: form.published,
          submitButtonText: form.submitButtonText || "Submit",
          successMessage: form.successMessage || "Thank you for your submission!",
          redirectUrl: form.redirectUrl || "",
          steps: steps,
        })
      } catch (err) {
        console.error("Error fetching form:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch form",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [formId, isNew, toast])

  const handleSettingsChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStepChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updatedSteps = [...prev.steps]
      updatedSteps[index] = { ...updatedSteps[index], [field]: value }
      return { ...prev, steps: updatedSteps }
    })
  }

  const addStep = () => {
    setFormData((prev) => {
      const newStepIndex = prev.steps.length
      return {
        ...prev,
        steps: [
          ...prev.steps,
          {
            id: -1 * (newStepIndex + 1), // Temporary negative ID for new steps
            title: `Step ${newStepIndex + 1}`,
            description: "",
            content: [],
            order_index: newStepIndex,
          },
        ],
      }
    })

    // Switch to the new step
    setCurrentStepIndex(formData.steps.length)
  }

  const removeStep = (index: number) => {
    if (formData.steps.length <= 1) {
      toast({
        title: "Cannot remove step",
        description: "A form must have at least one step",
        variant: "destructive",
      })
      return
    }

    setFormData((prev) => {
      const updatedSteps = prev.steps.filter((_, i) => i !== index)

      // Reorder steps
      updatedSteps.forEach((step, i) => {
        step.order_index = i
      })

      return { ...prev, steps: updatedSteps }
    })

    // Adjust current step index if needed
    if (currentStepIndex >= index && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    // Reorder steps
    if (result.type === "STEPS") {
      const steps = Array.from(formData.steps)
      const [removed] = steps.splice(source.index, 1)
      steps.splice(destination.index, 0, removed)

      // Update order_index values
      steps.forEach((step, index) => {
        step.order_index = index
      })

      setFormData((prev) => ({ ...prev, steps }))

      // Update current step index if the current step was moved
      if (currentStepIndex === source.index) {
        setCurrentStepIndex(destination.index)
      } else if (currentStepIndex > source.index && currentStepIndex <= destination.index) {
        setCurrentStepIndex(currentStepIndex - 1)
      } else if (currentStepIndex < source.index && currentStepIndex >= destination.index) {
        setCurrentStepIndex(currentStepIndex + 1)
      }

      return
    }

    // Reorder elements within a step
    if (result.type === "ELEMENTS") {
      const stepIndex = Number.parseInt(result.source.droppableId.split("-")[1])
      const elements = Array.from(formData.steps[stepIndex].content)
      const [removed] = elements.splice(source.index, 1)
      elements.splice(destination.index, 0, removed)

      setFormData((prev) => {
        const updatedSteps = [...prev.steps]
        updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], content: elements }
        return { ...prev, steps: updatedSteps }
      })
    }
  }

  const addElement = (stepIndex: number, element: FormElement) => {
    setFormData((prev) => {
      const updatedSteps = [...prev.steps]
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        content: [...updatedSteps[stepIndex].content, element],
      }
      return { ...prev, steps: updatedSteps }
    })
  }

  const updateElement = (stepIndex: number, elementIndex: number, updatedElement: FormElement) => {
    setFormData((prev) => {
      const updatedSteps = [...prev.steps]
      const stepContent = [...updatedSteps[stepIndex].content]
      stepContent[elementIndex] = updatedElement
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], content: stepContent }
      return { ...prev, steps: updatedSteps }
    })
  }

  const removeElement = (stepIndex: number, elementIndex: number) => {
    setFormData((prev) => {
      const updatedSteps = [...prev.steps]
      const stepContent = [...updatedSteps[stepIndex].content]
      stepContent.splice(elementIndex, 1)
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], content: stepContent }
      return { ...prev, steps: updatedSteps }
    })
  }

  const saveForm = async () => {
    setSaving(true)
    try {
      const method = isNew ? "POST" : "PATCH"
      const url = isNew ? "/api/forms" : `/api/forms/${formId}`

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          submitButtonText: formData.submitButtonText,
          successMessage: formData.successMessage,
          redirectUrl: formData.redirectUrl,
          steps: formData.steps.map((step) => ({
            id: step.id > 0 ? step.id : undefined, // Only include ID if it's a positive number
            title: step.title,
            description: step.description,
            content: step.content,
            order_index: step.order_index,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save form")
      }

      const data = await response.json()

      if (isNew && data.formId) {
        // Redirect to the edit page for the new form
        router.push(`/admin/forms/builder/${data.formId}`)
      } else {
        toast({
          title: "Form saved",
          description: "Your form has been saved successfully.",
        })
      }
    } catch (err) {
      console.error("Error saving form:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save form",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const publishForm = async () => {
    setPublishing(true)
    try {
      // First save the form
      await saveForm()

      // Then publish it
      const response = await fetch(`/api/forms/${formId}`, {
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
        throw new Error(data.error || "Failed to publish form")
      }

      setFormData((prev) => ({ ...prev, published: 1 }))

      toast({
        title: "Form published",
        description: "Your form has been published successfully.",
      })

      // Redirect to form view
      router.push(`/admin/forms/${formId}`)
    } catch (err) {
      console.error("Error publishing form:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to publish form",
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
        <div className="grid grid-cols-1 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  const currentStep = formData.steps[currentStepIndex] || formData.steps[0]

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{formData.name}</h1>
          <p className="text-muted-foreground">{formData.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/forms")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Button>
          <Button variant="outline" onClick={saveForm} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button onClick={publishForm} disabled={publishing || formData.steps.length === 0}>
            <Eye className="mr-2 h-4 w-4" />
            {publishing ? "Publishing..." : "Publish Form"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="steps">
            <Layers className="mr-2 h-4 w-4" />
            Form Steps
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Form Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Step Navigation */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Form Steps</CardTitle>
                  <Button variant="outline" size="sm" onClick={addStep}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Step
                  </Button>
                </div>
                <CardDescription>Drag to reorder steps. Click on a step to edit its content.</CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="steps" type="STEPS" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex gap-2 pb-2 overflow-x-auto"
                      >
                        {formData.steps.map((step, index) => (
                          <Draggable
                            key={`step-${step.id}-${index}`}
                            draggableId={`step-${step.id}-${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex-shrink-0 w-48 p-3 border rounded-md cursor-pointer ${
                                  currentStepIndex === index ? "border-primary bg-primary/5" : "border-border"
                                }`}
                                onClick={() => setCurrentStepIndex(index)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium truncate">{step.title}</span>
                                  {formData.steps.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeStep(index)
                                      }}
                                    >
                                      <Trash className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {step.description || "No description"}
                                </p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {step.content.length} element{step.content.length !== 1 ? "s" : ""}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>

            {/* Current Step Editor */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Editing: {currentStep.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentStepIndex === 0}
                      onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentStepIndex === formData.steps.length - 1}
                      onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Configure this step and add form elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="step-title">Step Title</Label>
                    <Input
                      id="step-title"
                      value={currentStep.title}
                      onChange={(e) => handleStepChange(currentStepIndex, "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-description">Step Description</Label>
                    <Input
                      id="step-description"
                      value={currentStep.description}
                      onChange={(e) => handleStepChange(currentStepIndex, "description", e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <FormElementEditor
                  elements={currentStep.content}
                  onAddElement={(element) => addElement(currentStepIndex, element)}
                  onUpdateElement={(index, element) => updateElement(currentStepIndex, index, element)}
                  onRemoveElement={(index) => removeElement(currentStepIndex, index)}
                  onDragEnd={handleDragEnd}
                  stepIndex={currentStepIndex}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
              <CardDescription>Configure your form settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="form-name">Form Name</Label>
                <Input
                  id="form-name"
                  value={formData.name}
                  onChange={(e) => handleSettingsChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  value={formData.description}
                  onChange={(e) => handleSettingsChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="submit-button-text">Submit Button Text</Label>
                <Input
                  id="submit-button-text"
                  value={formData.submitButtonText}
                  onChange={(e) => handleSettingsChange("submitButtonText", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="success-message">Success Message</Label>
                <Textarea
                  id="success-message"
                  value={formData.successMessage}
                  onChange={(e) => handleSettingsChange("successMessage", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="redirect-url">Redirect URL (optional)</Label>
                <Input
                  id="redirect-url"
                  placeholder="https://example.com/thank-you"
                  value={formData.redirectUrl}
                  onChange={(e) => handleSettingsChange("redirectUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If provided, users will be redirected to this URL after form submission
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="include-prize-wheel" checked={true} disabled />
                <Label htmlFor="include-prize-wheel">Include Prize Wheel at the end</Label>
                <p className="text-xs text-muted-foreground ml-2">(Always included in this version)</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("steps")}>
                Back to Steps
              </Button>
              <Button onClick={saveForm} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
