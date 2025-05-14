import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Track a form visit
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createServerSupabaseClient()

    // Check if form exists and is published
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found or not published" }, { status: 404 })
    }

    // Record form visit
    const { error: visitError } = await supabase
      .from('form_visits')
      .insert({
        form_id: id,
        visited_at: new Date().toISOString()
      })

    if (visitError) {
      console.error("Error recording visit:", visitError)
      return NextResponse.json({ error: "Failed to record visit" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording form visit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
