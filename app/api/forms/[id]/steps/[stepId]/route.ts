import { isAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string; stepId: string } }) {
  try {
    const { id, stepId } = params
    const supabase = createServerSupabaseClient()

    // Get step details
    const { data: step, error } = await supabase
      .from('form_steps')
      .select('*')
      .eq('form_id', id)
      .eq('id', stepId)
      .single()

    if (error || !step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 })
    }

    // Parse content if it's a string
    try {
      step.content = typeof step.content === 'string' ? JSON.parse(step.content) : step.content
    } catch (e) {
      console.error("Error parsing step content:", e)
      step.content = []
    }

    return NextResponse.json({ success: true, data: step })
  } catch (error) {
    console.error("Error fetching form step:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string; stepId: string } }) {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, stepId } = params
    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // Build update data
    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.content !== undefined) {
      updateData.content = typeof body.content === 'string'
        ? body.content
        : JSON.stringify(body.content)
    }
    if (body.order_index !== undefined) updateData.order_index = body.order_index

    // Update step
    const { error } = await supabase
      .from('form_steps')
      .update(updateData)
      .eq('form_id', id)
      .eq('id', stepId)

    if (error) {
      console.error("Error updating form step:", error)
      return NextResponse.json({ error: "Failed to update form step" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating form step:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; stepId: string } }) {
  try {
    // Check admin access
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, stepId } = params
    const supabase = createServerSupabaseClient()

    // Delete step
    const { error } = await supabase
      .from('form_steps')
      .delete()
      .eq('form_id', id)
      .eq('id', stepId)

    if (error) {
      console.error("Error deleting form step:", error)
      return NextResponse.json({ error: "Failed to delete form step" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting form step:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
