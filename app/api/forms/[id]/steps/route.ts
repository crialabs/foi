import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  let db = null
  try {
    const { id } = params

    db = await getDb()

    // Check if form exists
    const form = await db.get("SELECT id FROM forms WHERE id = ?", [id])

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Get form steps
    const steps = await db.all("SELECT * FROM form_steps WHERE form_id = ? ORDER BY order_index ASC", [id])

    // Parse content JSON
    steps.forEach((step: any) => {
      try {
        step.content = JSON.parse(step.content)
      } catch (e) {
        step.content = []
      }
    })

    return NextResponse.json({ success: true, data: steps })
  } catch (error) {
    console.error("Error fetching form steps:", error)
    return NextResponse.json({ error: "Failed to fetch form steps" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let db = null
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    db = await getDb()

    // Check if form exists
    const form = await db.get("SELECT id FROM forms WHERE id = ?", [id])

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Get current highest order index
    const maxOrderResult = await db.get("SELECT MAX(order_index) as maxOrder FROM form_steps WHERE form_id = ?", [id])

    const nextOrder = maxOrderResult.maxOrder !== null ? maxOrderResult.maxOrder + 1 : 0

    // Create new step
    const result = await db.run(
      `
      INSERT INTO form_steps (
        form_id,
        title,
        description,
        order_index,
        content,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        id,
        body.title || `Step ${nextOrder + 1}`,
        body.description || "",
        nextOrder,
        typeof body.content === "string" ? body.content : JSON.stringify(body.content || []),
      ],
    )

    // Update form's updated_at timestamp
    await db.run("UPDATE forms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      stepId: result.lastID,
      message: "Step created successfully",
    })
  } catch (error) {
    console.error("Error creating form step:", error)
    return NextResponse.json({ error: "Failed to create form step" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}
