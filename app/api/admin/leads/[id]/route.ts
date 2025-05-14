import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let db = null
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    db = await getDb()

    // Update lead status
    await db.run("UPDATE users SET status = ? WHERE id = ?", [body.status, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  let db = null
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    db = await getDb()

    // Delete lead
    await db.run("DELETE FROM users WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}
