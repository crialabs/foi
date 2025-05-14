import { isAdmin } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // Update lead status
    const { error } = await supabase
      .from('leads')
      .update({ status: body.status })
      .eq('id', id)

    if (error) {
      console.error("Error updating lead:", error)
      return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const supabase = createServerSupabaseClient()

    // Get lead details
    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        *,
        form_submissions(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error("Error fetching lead:", error)
      return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
    }

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
