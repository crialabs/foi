import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

// Define schema for validation
const PrizeSchema = z.object({
  email: z.string().email("Invalid email address"),
  prize: z.string().min(1, "Prize is required"),
})

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json()
    const validatedData = PrizeSchema.parse(body)

    const supabase = createServerSupabaseClient()

    // Update the user record with the prize
    const { data, error } = await supabase
      .from("quiz_submissions")
      .update({ prize: validatedData.prize })
      .eq("email", validatedData.email)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error recording prize:", error)
    return NextResponse.json({ success: false, error: "Failed to record prize" }, { status: 500 })
  }
}
