import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const appointmentId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { data: appointment } = await supabase.from("appointments").select("*").eq("id", appointmentId).single()

    const { data: doctor } = appointment?.doctor_id
      ? await supabase.from("doctors").select("*").eq("id", appointment.doctor_id).single()
      : { data: null }

    const { data: patient } = appointment?.patient_id
      ? await supabase.from("patients").select("*").eq("id", appointment.patient_id).single()
      : { data: null }

    return NextResponse.json({ appointment, doctor, patient })
  } catch (error) {
    console.error("[v0] Error fetching appointment:", error)
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 })
  }
}
