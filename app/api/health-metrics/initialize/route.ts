import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has metrics
    const { count } = await supabase
      .from("health_metrics")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (count === 0) {
      // Create sample data
      const sampleMetrics = [
        {
          user_id: user.id,
          weight_kg: 75,
          height_cm: 180,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          heart_rate: 72,
          temperature_celsius: 36.5,
          blood_glucose: 105,
          oxygen_saturation: 98,
          bmi: 23.1,
          recorded_at: new Date().toISOString(),
        },
      ]

      await supabase.from("health_metrics").insert(sampleMetrics)
    }

    const { data: metrics } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(10)

    return NextResponse.json({ success: true, metrics })
  } catch (error) {
    console.error("[v0] Error initializing metrics:", error)
    return NextResponse.json({ error: "Failed to initialize metrics" }, { status: 500 })
  }
}
