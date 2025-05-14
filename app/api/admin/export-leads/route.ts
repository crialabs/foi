import { isAdmin } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get all leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .order('created_at')

    if (!leads) {
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
    }

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
  }
}
