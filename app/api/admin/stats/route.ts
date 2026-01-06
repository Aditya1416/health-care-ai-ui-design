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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const [metricsRes, appointmentsRes, predictionsRes, riskPredictionsRes, imagingRes] = await Promise.all([
      supabase.from("health_metrics").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("predictions").select("*", { count: "exact", head: true }),
      supabase.from("health_risk_predictions").select("*", { count: "exact", head: true }),
      supabase.from("medical_imaging").select("*", { count: "exact", head: true }),
    ])

    return NextResponse.json({
      metrics: metricsRes.count || 0,
      appointments: appointmentsRes.count || 0,
      predictions: (predictionsRes.count || 0) + (riskPredictionsRes.count || 0),
      imaging: imagingRes.count || 0,
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
