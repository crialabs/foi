import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  let db = null
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    db = await getDb()

    // Get all leads
    const leads = await db.all("SELECT * FROM users")

    // Convert to CSV
    const headers = ["id", "email", "whatsapp", "age", "supplements", "status", "created_at"]
    const csvRows = [headers.join(",")]

    for (const lead of leads) {
      const row = headers.map((header) => {
        let value = lead[header]

        // Handle special cases
        if (header === "supplements") {
          try {
            const supplements = JSON.parse(value)
            value = supplements.join("; ")
          } catch (e) {
            value = value || ""
          }
        }

        // Escape commas and quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`
        }

        return value || ""
      })

      csvRows.push(row.join(","))
    }

    const csv = csvRows.join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=leads.csv",
      },
    })
  } catch (error) {
    console.error("Error exporting leads:", error)
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 })
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}
