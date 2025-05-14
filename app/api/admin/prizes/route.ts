import { isAdmin } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // Insert new prize
    const { error } = await supabase
      .from('prize_configs')
      .insert({
        name: body.name,
        description: body.description,
        probability: body.probability,
        active: body.active
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating prize:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
