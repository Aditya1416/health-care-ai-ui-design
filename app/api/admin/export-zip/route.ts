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
    const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("user_id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const [metricsRes, appointmentsRes, predictionsRes, imagesRes, recordsRes] = await Promise.all([
      supabase.from("health_metrics").select("*"),
      supabase.from("appointments").select("*"),
      supabase.from("health_predictions").select("*"),
      supabase.from("medical_imaging").select("*"),
      supabase.from("medical_records").select("*"),
    ])

    // Convert to CSV format
    const metricsCSV = convertToCSV(metricsRes.data || [])
    const appointmentsCSV = convertToCSV(appointmentsRes.data || [])
    const predictionsCSV = convertToCSV(predictionsRes.data || [])
    const imagesCSV = convertToCSV(imagesRes.data || [])
    const recordsCSV = convertToCSV(recordsRes.data || [])

    // Create response with ZIP-like format (simple concatenation for demo)
    const zipContent = `HEALTH METRICS\n${metricsCSV}\n\nAPPOINTMENTS\n${appointmentsCSV}\n\nPREDICTIONS\n${predictionsCSV}\n\nIMAGES\n${imagesCSV}\n\nRECORDS\n${recordsCSV}`

    return new NextResponse(zipContent, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": "attachment; filename=healthcare-export.txt",
      },
    })
  } catch (error) {
    console.error("[v0] Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

function convertToCSV(data: any[]): string {
  if (!data.length) return ""
  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] || "")).join(","))
  return [headers.join(","), ...rows].join("\n")
}
