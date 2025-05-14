import { NextResponse } from "next/server"
import { getDb, initializeDatabase } from "@/lib/db"

// Track a form visit
export async function POST(request: Request, { params }: { params: { id: string } }) {
  let db = null
  try {
    await initializeDatabase()
    const { id } = params

    db = await getDb()

    // Check if form exists and is published
    const form = await db.get("SELECT * FROM forms WHERE id = ? AND published = 1", [id])

    if (!form) {
      return NextResponse.json({ error: "Form not found or not published" }, { status: 404 })
    }

    // Update form visit count
    await db.run("UPDATE forms SET visits = visits + 1 WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking form visit:", error)
    return NextResponse.json({ success: false, error: "Failed to track form visit" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}
