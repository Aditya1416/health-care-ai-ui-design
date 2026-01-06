import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    const supabase = await createServerClient()

    let query = supabase.from("health_metrics").select("*").order("recorded_at", { ascending: false }).limit(100)

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    const { data: metrics, error } = await query

    if (error) throw error

    return NextResponse.json({ data: metrics })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
