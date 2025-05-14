import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string; stepId: string } }) {
  let db = null
  try {
    const { id, stepId } = params

    db = await getDb()

    // Get step details
    const step = await db.get("SELECT * FROM form_steps WHERE form_id = ? AND id = ?", [id, stepId])

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 })
    }

    // Parse content JSON
    try {
      step.content = JSON.parse(step.content)
    } catch (e) {
      step.content = []
    }

    return NextResponse.json({ success: true, data: step })
  } catch (error) {
    console.error("Error fetching form step:", error)
    return NextResponse.json({ error: "Failed to fetch form step" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string; stepId: string } }) {
  let db = null
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, stepId } = params
    const body = await request.json()

    db = await getDb()

    // Check if step exists
    const step = await db.get("SELECT id FROM form_steps WHERE form_id = ? AND id = ?", [id, stepId])

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 })
    }

    // Build update query
    const updateFields = []
    const updateValues = []

    if (body.title !== undefined) {
      updateFields.push("title = ?")
      updateValues.push(body.title)
    }

    if (body.description !== undefined) {
      updateFields.push("description = ?")
      updateValues.push(body.description)
    }

    if (body.content !== undefined) {
      updateFields.push("content = ?")
      updateValues.push(typeof body.content === "string" ? body.content : JSON.stringify(body.content))
    }

    if (body.order_index !== undefined) {
      updateFields.push("order_index = ?")
      updateValues.push(body.order_index)
    }

    // Always update the updated_at timestamp
    updateFields.push("updated_at = CURRENT_TIMESTAMP")

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Update step
    await db.run(`UPDATE form_steps SET ${updateFields.join(", ")} WHERE id = ? AND form_id = ?`, [
      ...updateValues,
      stepId,
      id,
    ])

    // Update form's updated_at timestamp
    await db.run("UPDATE forms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id])

    return NextResponse.json({ success: true, message: "Step updated successfully" })
  } catch (error) {
    console.error("Error updating form step:", error)
    return NextResponse.json({ error: "Failed to update form step" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; stepId: string } }) {
  let db = null
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, stepId } = params

    db = await getDb()

    // Check if step exists
    const step = await db.get("SELECT id, order_index FROM form_steps WHERE form_id = ? AND id = ?", [id, stepId])

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 })
    }

    // Delete step
    await db.run("DELETE FROM form_steps WHERE id = ?", [stepId])

    // Reorder remaining steps
    await db.run("UPDATE form_steps SET order_index = order_index - 1 WHERE form_id = ? AND order_index > ?", [
      id,
      step.order_index,
    ])

    // Update form's updated_at timestamp
    await db.run("UPDATE forms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id])

    return NextResponse.json({ success: true, message: "Step deleted successfully" })
  } catch (error) {
    console.error("Error deleting form step:", error)
    return NextResponse.json({ error: "Failed to delete form step" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}
