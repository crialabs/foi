import { isAdmin } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { message } = await request.json()
    const supabase = createServerSupabaseClient()

    // Record the message
    const { error } = await supabase
      .from('messages')
      .insert({
        submission_id: id,
        message,
        direction: 'outgoing',
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error("Error creating message:", error)
      return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating message:", error)
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

    // Get messages for this submission
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('submission_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: messages || [] })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
