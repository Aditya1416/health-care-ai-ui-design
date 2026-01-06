import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { case_title, case_description, patient_id } = await request.json()

    // Generate case number
    const caseNumber = `CASE-${Date.now()}`

    // Get doctor ID
    const { data: doctor } = await supabase.from("doctors").select("id").eq("user_id", user.id).single()

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 400 })
    }

    // Create case
    const { data: newCase, error } = await supabase
      .from("clinical_cases")
      .insert({
        case_number: caseNumber,
        patient_id,
        doctor_id: doctor.id,
        case_title,
        case_description,
        status: "open",
      })
      .select()
      .single()

    if (error) throw error

    // Log audit trail
    await supabase.from("case_audit_log").insert({
      case_id: newCase.id,
      action: "created",
      actor_id: doctor.id,
      actor_role: "doctor",
      details: { case_title, patient_id },
    })

    return NextResponse.json(newCase)
  } catch (error) {
    console.error("[v0] Error creating case:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create case" },
      { status: 500 },
    )
  }
}
