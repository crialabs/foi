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

    // Contar todas as visitas
    const { count: totalVisits, error: visitsError } = await supabase
      .from("form_visits")
      .select("*", { count: "exact", head: true })

    if (visitsError) {
      console.error("Erro ao contar visitas:", visitsError)
      return NextResponse.json({ error: "Falha ao buscar estatísticas" }, { status: 500 })
    }

    // Contar todos os envios
    const { count: totalSubmissions, error: submissionsError } = await supabase
      .from("form_submissions")
      .select("*", { count: "exact", head: true })

    if (submissionsError) {
      console.error("Erro ao contar envios:", submissionsError)
      return NextResponse.json({ error: "Falha ao buscar estatísticas" }, { status: 500 })
    }

    // Calcular taxas
    const submissionRate = totalVisits > 0 ? Math.round((totalSubmissions / totalVisits) * 100) : 0
    const bounceRate = totalVisits > 0 ? Math.round(((totalVisits - totalSubmissions) / totalVisits) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        visits: totalVisits || 0,
        submissions: totalSubmissions || 0,
        submissionRate,
        bounceRate,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Falha ao buscar estatísticas" }, { status: 500 })
  }
}
