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

    // Update prize config
    const { error } = await supabase
      .from('prize_configs')
      .update({
        name: body.name,
        description: body.description,
        probability: body.probability,
        active: body.active
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating prize:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const supabase = createServerSupabaseClient()

    // Delete prize config
    const { error } = await supabase
      .from('prize_configs')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prize:", error)
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

    // Get prize config
    const { data: prize, error } = await supabase
      .from('prize_configs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!prize) {
      return NextResponse.json({ error: "Prize not found" }, { status: 404 })
    }

    return NextResponse.json(prize)
  } catch (error) {
    console.error("Error fetching prize:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
