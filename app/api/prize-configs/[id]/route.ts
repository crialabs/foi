import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("prize_configs").select("*").eq("id", params.id).single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching prize config:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch prize configuration" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name || body.probability === undefined) {
      return NextResponse.json({ success: false, error: "Name and probability are required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("prize_configs")
      .update({
        name: body.name,
        description: body.description || null,
        probability: body.probability,
        active: body.active !== undefined ? body.active : true,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error updating prize config:", error)
    return NextResponse.json({ success: false, error: "Failed to update prize configuration" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("prize_configs").delete().eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prize config:", error)
    return NextResponse.json({ success: false, error: "Failed to delete prize configuration" }, { status: 500 })
  }
}
