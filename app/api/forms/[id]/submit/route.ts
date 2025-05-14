import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let db = null
  try {
    const { id } = params
    const body = await request.json()

    db = await getDb()

    // Check if form exists and is published
    const form = await db.get("SELECT id, published FROM forms WHERE id = ?", [id])

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    if (!form.published) {
      return NextResponse.json({ error: "Form is not published" }, { status: 400 })
    }

    // Save submission
    await db.run("INSERT INTO form_submissions (form_id, data) VALUES (?, ?)", [id, JSON.stringify(body)])

    // If this is a quiz submission with prize wheel, also save to users table
    if (body.name && body.email && body.whatsapp) {
      try {
        await db.run("INSERT INTO users (name, age, supplements, email, whatsapp) VALUES (?, ?, ?, ?, ?)", [
          body.name,
          body.age || "",
          Array.isArray(body.supplements) ? body.supplements.join(",") : body.supplements || "",
          body.email,
          body.whatsapp,
        ])
      } catch (e) {
        // Ignore duplicate email errors
        console.log("User may already exist:", e)
      }
    }

    return NextResponse.json({ success: true, message: "Form submitted successfully" })
  } catch (error) {
    console.error("Error submitting form:", error)
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}
