import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

// Define schema for validation
const QuizSchema = z.object({
  age: z.string().min(1, "Age is required"),
  supplements: z.array(z.string()),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  whatsapp: z.string().min(1, "WhatsApp number is required"),
})

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json()

    try {
      const validatedData = QuizSchema.parse(body)

      const supabase = createServerSupabaseClient()

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("quiz_submissions")
        .select("id")
        .eq("email", validatedData.email)
        .maybeSingle()

      if (existingUser) {
        return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
      }

      // Insert data
      const { data, error } = await supabase
        .from("quiz_submissions")
        .insert({
          name: validatedData.name,
          age: validatedData.age,
          supplements: validatedData.supplements,
          email: validatedData.email,
          whatsapp: validatedData.whatsapp,
          status: "new",
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({ success: true, data })
    } catch (validationError) {
      console.error("Validation error:", validationError)
      return NextResponse.json(
        { success: false, error: "Invalid data format", details: validationError },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error submitting quiz data:", error)
    return NextResponse.json({ success: false, error: "Failed to submit quiz data" }, { status: 500 })
  }
}
