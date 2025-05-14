import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"

import FormRenderer from "@/components/form-renderer"
import type { Database } from "@/lib/supabase/database.types"

export const dynamic = "force-dynamic"

interface FormPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: FormPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient<Database>({ cookies })

  try {
    const { data: form } = await supabase.from("forms").select("title, description").eq("id", params.id).single()

    if (!form) {
      return {
        title: "Formulário não encontrado",
        description: "O formulário solicitado não foi encontrado.",
      }
    }

    return {
      title: form.title || "Formulário",
      description: form.description || "Preencha o formulário para participar",
    }
  } catch (error) {
    console.error("Erro ao buscar metadados do formulário:", error)
    return {
      title: "Formulário",
      description: "Preencha o formulário para participar",
    }
  }
}

export default async function FormPage({ params }: FormPageProps) {
  const { id } = params
  const supabase = createServerComponentClient<Database>({ cookies })

  // Registrar visita
  try {
    await supabase.from("form_visits").insert({
      form_id: id,
      ip: "anonymous", // Em produção, você pode capturar o IP real
      user_agent: "web",
    })
  } catch (error) {
    console.error("Erro ao registrar visita:", error)
  }

  // Buscar dados do formulário
  const { data: form, error: formError } = await supabase.from("forms").select("*").eq("id", id).single()

  if (formError || !form) {
    console.error("Erro ao buscar formulário:", formError)
    notFound()
  }

  // Verificar se o formulário está publicado
  if (!form.published) {
    redirect("/")
  }

  // Buscar etapas do formulário
  const { data: steps, error: stepsError } = await supabase
    .from("form_steps")
    .select("*")
    .eq("form_id", id)
    .order("order_index", { ascending: true })

  if (stepsError) {
    console.error("Erro ao buscar etapas do formulário:", stepsError)
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar formulário</h1>
        <p>Ocorreu um erro ao carregar o formulário. Por favor, tente novamente mais tarde.</p>
      </div>
    )
  }

  // Buscar configurações de estilo
  const { data: settings } = await supabase.from("settings").select("*").single()

  // Buscar configurações de prêmios
  const { data: prizes } = await supabase.from("prize_configs").select("*").eq("active", true)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: settings?.primary_color ? `${settings.primary_color}15` : undefined,
      }}
    >
      <main className="flex-1 container mx-auto py-6 px-4">
        <FormRenderer form={form} steps={steps || []} settings={settings} prizes={prizes || []} />
      </main>
    </div>
  )
}
