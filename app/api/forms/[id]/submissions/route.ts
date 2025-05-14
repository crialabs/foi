import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    // Buscar envios do formulário
    const { data, error } = await supabase
      .from("form_submissions")
      .select("*")
      .eq("form_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar envios:", error)
      return NextResponse.json({ error: "Falha ao buscar envios" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Erro ao buscar envios:", error)
    return NextResponse.json({ error: "Falha ao buscar envios" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verificar se o formulário existe
    const { data: form, error: formError } = await supabase.from("forms").select("id, published").eq("id", id).single()

    if (formError || !form) {
      return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 })
    }

    if (!form.published) {
      return NextResponse.json({ error: "Este formulário não está publicado" }, { status: 400 })
    }

    // Inserir envio
    const { data, error } = await supabase
      .from("form_submissions")
      .insert({
        form_id: id,
        data: body.data || {},
        prize: body.prize,
        status: "new",
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao salvar envio:", error)
      return NextResponse.json({ error: "Falha ao salvar envio" }, { status: 500 })
    }

    // Atualizar contador de envios
    await supabase.rpc("increment_form_submissions", { form_id: id })

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Erro ao processar envio:", error)
    return NextResponse.json({ error: "Falha ao processar envio" }, { status: 500 })
  }
}
