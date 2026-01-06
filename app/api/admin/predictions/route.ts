import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { data: predictions, count } = await supabase
      .from("predictions")
      .select(
        `
        id,
        predicted_disease,
        confidence_score,
        severity_level,
        created_at,
        patient_id,
        doctor_id,
        explanation,
        patients (
          scan_image_url
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const mappedPredictions = (predictions || []).map((pred: any) => {
      const confidence = Math.min(Math.max(pred.confidence_score || 0, 0), 1)
      const severityMap: Record<number, string> = { 1: "low", 2: "medium", 3: "high" }
      const hasXray = !!(pred.patients && pred.patients.scan_image_url)

      return {
        id: pred.id,
        predicted_disease: pred.predicted_disease || "Unknown Disease",
        confidence_score: confidence,
        risk_level: severityMap[pred.severity_level || 1] || "unknown",
        created_at: pred.created_at,
        patient_id: pred.patient_id,
        doctor_id: pred.doctor_id,
        explanation: pred.explanation || "",
        hasXray: hasXray,
      }
    })

    return NextResponse.json({
      predictions: mappedPredictions,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}
