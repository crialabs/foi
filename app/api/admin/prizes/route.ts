import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  let db = null
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    db = await getDb()

    // Insert new prize
    await db.run("INSERT INTO prize_config (name, description, probability, active) VALUES (?, ?, ?, ?)", [
      body.name,
      body.description,
      body.probability,
      body.active ? 1 : 0,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating prize:", error)
    return NextResponse.json({ error: "Failed to create prize" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}
