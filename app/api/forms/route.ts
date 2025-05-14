import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Verificar se o usuário é administrador
    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Buscar todos os formulários com informações básicas
    const { data: forms, error } = await supabase
      .from("forms")
      .select(`
        id, 
        title, 
        description, 
        published, 
        created_at, 
        updated_at,
        share_url
      `)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar formulários:", error)
      return NextResponse.json({ error: "Falha ao buscar formulários" }, { status: 500 })
    }

    // Buscar contagens de visitas e envios para cada formulário
    const enhancedForms = await Promise.all(
      forms.map(async (form) => {
        // Contar visitas
        const { count: visitCount, error: visitError } = await supabase
          .from("form_visits")
          .select("*", { count: "exact", head: true })
          .eq("form_id", form.id)

        // Contar envios
        const { count: submissionCount, error: submissionError } = await supabase
          .from("form_submissions")
          .select("*", { count: "exact", head: true })
          .eq("form_id", form.id)

        return {
          ...form,
          visits: visitCount || 0,
          submissions: submissionCount || 0,
        }
      }),
    )

    return NextResponse.json({ success: true, data: enhancedForms })
  } catch (error) {
    console.error("Erro ao buscar formulários:", error)
    return NextResponse.json({ error: "Falha ao buscar formulários" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar se o usuário é administrador
    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // Criar novo formulário
    const { data: form, error: formError } = await supabase
      .from("forms")
      .insert({
        title: body.title,
        description: body.description || "",
        content: body.content || [],
        published: body.published || false,
        submit_button_text: body.submitButtonText || "Enviar",
        success_message: body.successMessage || "Obrigado pelo envio!",
        redirect_url: body.redirectUrl || "",
      })
      .select()
      .single()

    if (formError) {
      console.error("Erro ao criar formulário:", formError)
      return NextResponse.json({ error: "Falha ao criar formulário" }, { status: 500 })
    }

    // Criar etapas iniciais, se fornecidas
    if (body.steps && Array.isArray(body.steps)) {
      const stepsToInsert = body.steps.map((step, index) => ({
        form_id: form.id,
        title: step.title || `Etapa ${index + 1}`,
        description: step.description || "",
        order_index: index,
        content: step.content || [],
      }))

      const { error: stepsError } = await supabase.from("form_steps").insert(stepsToInsert)

      if (stepsError) {
        console.error("Erro ao criar etapas do formulário:", stepsError)
        // Não falharemos a operação inteira se as etapas falharem
      }
    } else {
      // Criar uma etapa padrão
      const { error: stepError } = await supabase.from("form_steps").insert({
        form_id: form.id,
        title: "Etapa 1",
        description: "",
        order_index: 0,
        content: [],
      })

      if (stepError) {
        console.error("Erro ao criar etapa padrão:", stepError)
        // Não falharemos a operação inteira se a etapa padrão falhar
      }
    }

    return NextResponse.json({
      success: true,
      formId: form.id,
      message: "Formulário criado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao criar formulário:", error)
    return NextResponse.json({ error: "Falha ao criar formulário" }, { status: 500 })
  }
}
