import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone, message, submissionId } = await request.json()

    if (!phone || !message) {
      return NextResponse.json({ success: false, error: "Phone and message are required" }, { status: 400 })
    }

    // Log the message to the database if submissionId is provided
    if (submissionId) {
      const supabase = createServerSupabaseClient()
      await supabase.from('messages').insert({
        submission_id: submissionId,
        message,
        direction: 'outgoing'
      })
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp message logged successfully",
    })
  } catch (error) {
    console.error("Failed to log WhatsApp message:", error)
    return NextResponse.json({ success: false, error: "Failed to log WhatsApp message" }, { status: 500 })
  }
}
