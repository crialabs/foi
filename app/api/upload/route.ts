import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 })
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size exceeds 2MB limit" }, { status: 400 })
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only images are allowed." },
        { status: 400 },
      )
    }

    // Create unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get file extension
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Ensure public/uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads")

    try {
      // Write file to disk
      await writeFile(path.join(uploadDir, fileName), buffer)

      // Return the URL to the uploaded file
      const fileUrl = `/uploads/${fileName}`

      return NextResponse.json({
        success: true,
        url: fileUrl,
        message: "File uploaded successfully",
      })
    } catch (error) {
      console.error("Error saving file:", error)
      return NextResponse.json({ success: false, error: "Failed to save file" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json({ success: false, error: "Failed to process upload" }, { status: 500 })
  }
}
