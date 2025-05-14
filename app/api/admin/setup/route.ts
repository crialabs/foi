import { createServerSupabaseClient } from "@/lib/supabase/server"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ error: "Admin with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create admin user
    const { error } = await supabase
      .from('admins')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in setup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
