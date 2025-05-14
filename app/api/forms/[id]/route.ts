import type { Database } from "@/lib/supabase/database.types"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verificar autenticação para estatísticas detalhadas
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const isAdmin = session?.user?.email?.endsWith("@atena.com") || false

    // Buscar detalhes do formulário
    const { data: form, error: formError } = await supabase.from("forms").select("*").eq("id", id).single()

    if (formError || !form) {
      console.error("Erro ao buscar formulário:", formError)
      return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 })
    }

    // Normalizar o conteúdo do formulário
    let normalizedContent = []
    try {
      // Se o conteúdo for uma string, tente analisá-lo como JSON
      if (typeof form.content === "string") {
        normalizedContent = JSON.parse(form.content)
      }
      // Se o conteúdo for um objeto, verifique se é um array
      else if (typeof form.content === "object") {
        if (Array.isArray(form.content)) {
          normalizedContent = form.content
        } else {
          // Se for um objeto mas não um array, coloque-o em um array
          normalizedContent = [form.content]
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

    // Buscar etapas do formulário
    const { data: steps, error: stepsError } = await supabase
      .from("form_steps")
      .select("*")
      .eq("form_id", id)
      .order("order_index", { ascending: true })

    if (stepsError) {
      console.error("Erro ao buscar etapas do formulário:", stepsError)
    }

    // Buscar contagem de envios
    const { count: submissionCount, error: submissionError } = await supabase
      .from("form_submissions")
      .select("*", { count: "exact", head: true })
      .eq("form_id", id)

    if (submissionError) {
      console.error("Erro ao contar envios:", submissionError)
    }

    // Buscar contagem de visitas
    const { count: visitCount, error: visitError } = await supabase
      .from("form_visits")
      .select("*", { count: "exact", head: true })
      .eq("form_id", id)

    if (visitError) {
      console.error("Erro ao contar visitas:", visitError)
    }

    // Calcular taxa de conversão
    const conversionRate = visitCount && visitCount > 0 ? Math.round(((submissionCount || 0) / visitCount) * 100) : 0

    // Processar etapas para garantir que o conteúdo seja JSON
    const processedSteps =
      steps?.map((step) => {
        try {
          // Se o conteúdo for uma string, tente analisá-lo como JSON
          let stepContent = []
          if (typeof step.content === "string") {
            stepContent = JSON.parse(step.content)
          } else if (typeof step.content === "object") {
            if (Array.isArray(step.content)) {
              stepContent = step.content
            } else {
              stepContent = [step.content]
            }
          }

          return {
            ...step,
            content: stepContent,
          }
        } catch (e) {
          // Se falhar ao analisar, retorne um array vazio
          return {
            ...step,
            content: [],
          }
        }
      }) || []

    return NextResponse.json({
      success: true,
      data: {
        ...form,
        content: normalizedContent,
        steps: processedSteps,
        stats: {
          submissions: submissionCount || 0,
          visits: visitCount || 0,
          conversionRate,
        },
      },
    })
  } catch (error) {
    console.error("Erro ao buscar formulário:", error)
    return NextResponse.json({ error: "Falha ao buscar formulário" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o formulário existe
    const { data: existingForm, error: formError } = await supabase.from("forms").select("id").eq("id", id).single()

    if (formError || !existingForm) {
      return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 })
    }

    // Construir objeto de atualização
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.content !== undefined) {
      // Normalizar o conteúdo
      let normalizedContent = []
      try {
        if (typeof body.content === "string") {
          normalizedContent = JSON.parse(body.content)
        } else if (typeof body.content === "object") {
          if (Array.isArray(body.content)) {
            normalizedContent = body.content
          } else {
            normalizedContent = [body.content]
          }
        }
      } catch (e) {
        console.error("Erro ao analisar conteúdo do formulário:", e)
        normalizedContent = []
      }
      updateData.content = JSON.stringify(normalizedContent)
    }
    if (body.published !== undefined) updateData.published = body.published
    if (body.submit_button_text !== undefined) updateData.submit_button_text = body.submit_button_text
    if (body.success_message !== undefined) updateData.success_message = body.success_message
    if (body.redirect_url !== undefined) updateData.redirect_url = body.redirect_url
    if (body.share_url !== undefined) updateData.share_url = body.share_url

    // Sempre atualizar o timestamp
    updateData.updated_at = new Date().toISOString()

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 })
    }

    // Atualizar formulário
    const { error: updateError } = await supabase.from("forms").update(updateData).eq("id", id)

    if (updateError) {
      console.error("Erro ao atualizar formulário:", updateError)
      return NextResponse.json({ error: "Falha ao atualizar formulário" }, { status: 500 })
    }

    // Atualizar etapas se fornecidas
    if (body.steps && Array.isArray(body.steps)) {
      // Primeiro, excluir etapas existentes
      const { error: deleteError } = await supabase.from("form_steps").delete().eq("form_id", id)

      if (deleteError) {
        console.error("Erro ao excluir etapas existentes:", deleteError)
        return NextResponse.json({ error: "Falha ao atualizar etapas do formulário" }, { status: 500 })
      }

      // Depois, inserir novas etapas
      for (let i = 0; i < body.steps.length; i++) {
        const step = body.steps[i]

        // Normalizar o conteúdo da etapa
        let stepContent = []
        try {
          if (typeof step.content === "string") {
            stepContent = JSON.parse(step.content)
          } else if (typeof step.content === "object") {
            if (Array.isArray(step.content)) {
              stepContent = step.content
            } else {
              stepContent = [step.content]
            }
          }
        } catch (e) {
          console.error(`Erro ao analisar conteúdo da etapa ${i}:`, e)
          stepContent = []
        }

        const { error: insertError } = await supabase.from("form_steps").insert({
          form_id: id,
          title: step.title || `Etapa ${i + 1}`,
          description: step.description || "",
          order_index: i,
          content: JSON.stringify(stepContent),
        })

        if (insertError) {
          console.error(`Erro ao inserir etapa ${i}:`, insertError)
          return NextResponse.json({ error: `Falha ao inserir etapa ${i + 1}` }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true, message: "Formulário atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error)
    return NextResponse.json({ error: "Falha ao atualizar formulário" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o formulário existe
    const { data: existingForm, error: formError } = await supabase.from("forms").select("id").eq("id", id).single()

    if (formError || !existingForm) {
      return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 })
    }

    // Excluir formulário (a exclusão em cascata deve ser configurada no banco de dados)
    const { error: deleteError } = await supabase.from("forms").delete().eq("id", id)

    if (deleteError) {
      console.error("Erro ao excluir formulário:", deleteError)
      return NextResponse.json({ error: "Falha ao excluir formulário" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Formulário excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir formulário:", error)
    return NextResponse.json({ error: "Falha ao excluir formulário" }, { status: 500 })
  }
}
