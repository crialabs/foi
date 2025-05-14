import { isAdmin } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createServerSupabaseClient()

    // Check if form exists
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Get form steps
    const { data: steps, error: stepsError } = await supabase
      .from('form_steps')
      .select('*')
      .eq('form_id', id)
      .order('order_index', { ascending: true })

    if (stepsError) {
      console.error("Error fetching form steps:", stepsError)
      return NextResponse.json({ error: "Failed to fetch form steps" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: steps || [] })
  } catch (error) {
    console.error("Error fetching form steps:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // Check if form exists
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Insert new step
    const { error: insertError } = await supabase
      .from('form_steps')
      .insert({
        form_id: id,
        title: body.title || 'New Step',
        description: body.description || '',
        content: JSON.stringify(body.content || []),
        order_index: body.order_index || 0
      })

    if (insertError) {
      console.error("Error creating form step:", insertError)
      return NextResponse.json({ error: "Failed to create form step" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating form step:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
