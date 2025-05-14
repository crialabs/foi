import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // Check if form exists and is published
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, published')
      .eq('id', id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    if (!form.published) {
      return NextResponse.json({ error: "Form is not published" }, { status: 400 })
    }

    // Create the submission
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_id: id,
        answers: body.answers || {},
        metadata: {
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        }
      })
      .select()
      .single()

    if (submissionError) {
      console.error("Error creating submission:", submissionError)
      return NextResponse.json({ error: "Failed to submit form" }, { status: 500 })
    }

    // If this is a quiz submission and there are prize-related fields
    if (body.prize) {
      const { error: prizeError } = await supabase
        .from('quiz_submissions')
        .insert({
          submission_id: submission.id,
          prize_id: body.prize.id,
          status: 'pending'
        })

      if (prizeError) {
        console.error("Error recording prize:", prizeError)
      }
    }

    // Create lead record if contact information is provided
    if (body.email || body.whatsapp) {
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          email: body.email,
          whatsapp: body.whatsapp,
          age: body.age,
          supplements: body.supplements,
          submission_id: submission.id,
          form_id: id,
          status: 'new'
        })

      if (leadError) {
        console.error("Error creating lead:", leadError)
      }
    }

    return NextResponse.json({ success: true, data: submission })
  } catch (error) {
    console.error("Error submitting form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
