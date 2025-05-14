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

    // Build update query
    const updateFields = []
    const updateValues = []

    if (body.name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(body.name)
    }

    if (body.description !== undefined) {
      updateFields.push("description = ?")
      updateValues.push(body.description)
    }

    if (body.probability !== undefined) {
      updateFields.push("probability = ?")
      updateValues.push(body.probability)
    }

    if (body.active !== undefined) {
      updateFields.push("active = ?")
      updateValues.push(body.active ? 1 : 0)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Update prize
    await db.run(`UPDATE prize_config SET ${updateFields.join(", ")} WHERE id = ?`, [...updateValues, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating prize:", error)
    return NextResponse.json({ error: "Failed to update prize" }, { status: 500 })
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

    // Delete prize
    await db.run("DELETE FROM prize_config WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prize:", error)
    return NextResponse.json({ error: "Failed to delete prize" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}
