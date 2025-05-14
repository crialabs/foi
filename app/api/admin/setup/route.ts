import { NextResponse } from "next/server"
import { createAdmin } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // Initialize database
    await initializeDatabase()

    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Create admin user
    await createAdmin(name, email, password, "admin")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting up admin:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to set up admin user"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
