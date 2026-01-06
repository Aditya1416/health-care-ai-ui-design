import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")

    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Fetch doctor details
    const { data: doctor } = await supabase.from("doctors").select("*").eq("id", doctorId).single()

    // Fetch all unique patients for this doctor
    const { data: appointments } = await supabase
      .from("appointments")
      .select("patient_id, patients(*)")
      .eq("doctor_id", doctorId)

    // Extract unique patients
    const uniquePatients = new Map()
    appointments?.forEach((apt: any) => {
      if (apt.patients && !uniquePatients.has(apt.patients.id)) {
        uniquePatients.set(apt.patients.id, apt.patients)
      }
    })

    // Fetch predictions for each patient
    const patientIds = Array.from(uniquePatients.keys())
    const { data: predictions } = await supabase
      .from("health_risk_predictions")
      .select("*")
      .in("patient_id", patientIds)

    return NextResponse.json({
      doctor,
      patients: Array.from(uniquePatients.values()),
      predictions,
    })
  } catch (error) {
    console.error("[v0] Error fetching doctor patients:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
