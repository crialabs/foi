import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { phone, message, submissionId } = await request.json()

    if (!phone || !message) {
      return NextResponse.json({ success: false, error: "Phone and message are required" }, { status: 400 })
    }

    // Log the message to the database if submissionId is provided
    if (submissionId) {
      await db.run(`INSERT INTO messages (submissionId, message, direction) VALUES (?, ?, ?)`, [
        submissionId,
        message,
        "outgoing",
      ])
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
