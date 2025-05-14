"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import StepIndicator from "@/components/step-indicator"
import ContactStep from "@/components/steps/contact-step"
import AgeStep from "@/components/steps/age-step"
import SupplementStep from "@/components/steps/supplement-step"
import { PrizeWheel } from "@/components/steps/prize-wheel"
import { Confetti } from "@/components/magicui/confetti"
import type { Database } from "@/lib/supabase/database.types"
import { useToast } from "@/components/ui/use-toast"

interface FormRendererProps {
  form: any
  steps: any[]
  settings: any
  prizes: any[]
}

export default function FormRenderer({ form, steps, settings, prizes }: FormRendererProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  // Determinar o número total de etapas (incluindo a roleta de prêmios)
  const totalSteps = steps.length + 1 // +1 para a roleta de prêmios

  // Função para verificar se a etapa atual está completa
  const isStepComplete = () => {
    if (currentStep === steps.length) {
      // Etapa da roleta de prêmios
      return true
    }

    // Verificar os campos obrigatórios com base no tipo de etapa
    const step = steps[currentStep]

    if (!step) return false

    // Verificar campos obrigatórios com base no conteúdo da etapa
    try {
      const content = typeof step.content === "string" ? JSON.parse(step.content) : step.content

      // Verificar se todos os campos obrigatórios estão preenchidos
      if (Array.isArray(content)) {
        for (const field of content) {
          if (field.required && !formData[field.id]) {
            return false
          }
        }
      }

      return true
    } catch (error) {
      console.error("Erro ao analisar conteúdo da etapa:", error)
      return false
    }
  }

  // Função para avançar para a próxima etapa
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  // Função para voltar para a etapa anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Função para atualizar os dados do formulário
  const updateFormData = (data: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  // Função para enviar o formulário
  const submitForm = async () => {
    try {
      setIsSubmitting(true)

      // Enviar dados para o Supabase
      const { data, error } = await supabase
        .from("form_submissions")
        .insert({
          form_id: form.id,
          data: formData,
          prize: selectedPrize,
          status: "new",
        })
        .select()

      if (error) {
        throw error
      }

      // Mostrar confete e marcar como concluído
      setShowConfetti(true)
      setIsComplete(true)

      // Redirecionar após alguns segundos se houver URL de redirecionamento
      if (form.redirect_url) {
        setTimeout(() => {
          window.location.href = form.redirect_url
        }, 5000)
      }

      toast({
        title: "Formulário enviado com sucesso!",
        description: "Obrigado por participar. Seu prêmio foi registrado.",
      })
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      toast({
        variant: "destructive",
        title: "Erro ao enviar formulário",
        description: "Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para lidar com a seleção de prêmio
  const handlePrizeSelected = (prize: string) => {
    setSelectedPrize(prize)

    // Enviar o formulário após selecionar o prêmio
    submitForm()
  }

  // Renderizar a etapa atual
  const renderStep = () => {
    // Se todas as etapas foram concluídas, mostrar a roleta de prêmios
    if (currentStep === steps.length) {
      return <PrizeWheel email={formData.email || ""} onPrizeSelected={handlePrizeSelected} />
    }

    // Renderizar a etapa atual com base no tipo
    const step = steps[currentStep]

    if (!step) {
      return <div>Etapa não encontrada</div>
    }

    // Renderizar etapa personalizada com base no conteúdo
    try {
      const content = typeof step.content === "string" ? JSON.parse(step.content) : step.content

      // Renderizar campos personalizados
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium">{step.title}</h3>
            {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
          </div>

          {Array.isArray(content) &&
            content.map((field, index) => {
              // Renderizar campo com base no tipo
              switch (field.type) {
                case "contact":
                  return (
                    <ContactStep
                      key={index}
                      name={formData.name || ""}
                      email={formData.email || ""}
                      whatsapp={formData.whatsapp || ""}
                      onChange={updateFormData}
                    />
                  )
                case "age":
                  return <AgeStep key={index} age={formData.age || ""} onChange={(age) => updateFormData({ age })} />
                case "supplement":
                  return (
                    <SupplementStep
                      key={index}
                      supplements={formData.supplements || []}
                      onChange={(supplements) => updateFormData({ supplements })}
                    />
                  )
                default:
                  return <div key={index}>Tipo de campo não suportado: {field.type}</div>
              }
            })}
        </div>
      )
    } catch (error) {
      console.error("Erro ao renderizar etapa:", error)
      return <div>Erro ao renderizar etapa</div>
    }
  }

  return (
    <>
      {showConfetti && <Confetti />}

      <Card className="max-w-md mx-auto shadow-lg">
        <CardContent className="p-6">
          {!isComplete ? (
            <>
              <StepIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
                primaryColor={settings?.primary_color || "#6d28d9"}
              />

              <div className="mt-6">{renderStep()}</div>

              <div className="mt-8 flex justify-between">
                {currentStep > 0 && (
                  <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                    Voltar
                  </Button>
                )}

                {currentStep < steps.length ? (
                  <Button
                    onClick={nextStep}
                    disabled={!isStepComplete() || isSubmitting}
                    className="ml-auto"
                    style={{
                      backgroundColor: settings?.primary_color || undefined,
                    }}
                  >
                    Próximo
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">{form.success_message || "Obrigado pela sua participação!"}</h2>
              <p className="mb-6">
                Seu prêmio: <span className="font-bold">{selectedPrize}</span>
              </p>

              {form.redirect_url ? (
                <p className="text-sm text-muted-foreground">Você será redirecionado em alguns segundos...</p>
              ) : (
                <Button
                  onClick={() => router.push("/")}
                  style={{
                    backgroundColor: settings?.primary_color || undefined,
                  }}
                >
                  Voltar para o início
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
