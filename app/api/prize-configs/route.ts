import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("prize_configs").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching prize configs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch prize configurations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
      .insert({
        name: body.name,
        description: body.description || null,
        probability: body.probability,
        active: body.active !== undefined ? body.active : true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error creating prize config:", error)
    return NextResponse.json({ success: false, error: "Failed to create prize configuration" }, { status: 500 })
  }
}
