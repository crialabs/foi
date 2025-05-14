import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const settings = await db.get("SELECT * FROM settings LIMIT 1")

    return NextResponse.json({
      success: true,
      settings: settings || {},
    })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    const requiredFields = ["primaryColor", "secondaryColor", "accentColor", "fontFamily"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if settings already exist
    const existingSettings = await db.get("SELECT * FROM settings LIMIT 1")

    if (existingSettings) {
      // Update existing settings
      await db.run(
        `UPDATE settings SET 
         primaryColor = ?, 
         secondaryColor = ?, 
         accentColor = ?, 
         fontFamily = ?, 
         logoUrl = ?,
         updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          data.primaryColor,
          data.secondaryColor,
          data.accentColor,
          data.fontFamily,
          data.logoUrl || null,
          existingSettings.id,
        ],
      )
    } else {
      // Insert new settings
      await db.run(
        `INSERT INTO settings (
          primaryColor, 
          secondaryColor, 
          accentColor, 
          fontFamily, 
          logoUrl,
          createdAt,
          updatedAt
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [data.primaryColor, data.secondaryColor, data.accentColor, data.fontFamily, data.logoUrl || null],
      )
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
