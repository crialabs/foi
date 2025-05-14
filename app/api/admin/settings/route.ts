import { isAdmin } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error
    }

    return NextResponse.json({
      success: true,
      settings: settings || {},
    })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const supabase = createServerSupabaseClient()

    // Delete existing settings and insert new ones
    await supabase.from('settings').delete().neq('id', 0) // Clear existing settings
    const { error } = await supabase.from('settings').insert({
      ...data,
      updated_at: new Date().toISOString()
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
