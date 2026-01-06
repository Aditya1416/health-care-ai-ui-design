import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const formData = await request.formData()
    const file = formData.get("file") as File
    const datasetType = formData.get("datasetType") as string

    if (!file || !datasetType) {
      return NextResponse.json({ error: "File and datasetType required" }, { status: 400 })
    }

    const text = await file.text()
    // Simple CSV parsing (in production use papaparse library)
    const lines = text.split("\n")
    const headers = lines[0].split(",")
    const data = lines.slice(1).map((line) => {
      const values = line.split(",")
      return headers.reduce(
        (obj, header, i) => {
          obj[header.trim()] = values[i]?.trim()
          return obj
        },
        {} as Record<string, string | undefined>,
      )
    })

    // Validate and insert based on datasetType
    const results = await ingestDataset(supabase, datasetType, data)

    return NextResponse.json({ success: true, ingested: results.length })
  } catch (error) {
    console.error("[v0] CSV ingestion error:", error)
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 })
  }
}

async function ingestDataset(supabase: any, type: string, data: any[]) {
  const validRows = data.filter((row) => Object.values(row).some((v) => v))

  switch (type) {
    case "health-metrics": {
      // From Tabular EHR datasets
      return await supabase
        .from("health_metrics")
        .upsert(
          validRows.map((row) => ({
            patient_id: row.patient_id,
            metric_type: row.metric_type,
            value: Number.parseFloat(row.value),
            unit: row.unit,
            recorded_at: row.recorded_at || new Date().toISOString(),
          })),
          { onConflict: "patient_id,metric_type,recorded_at" },
        )
        .then((res) => res.data || [])
    }
    case "environmental-data": {
      // From Chennai AQI datasets
      return await supabase
        .from("environmental_data")
        .upsert(
          validRows.map((row) => ({
            user_id: row.user_id,
            aqi_index: Number.parseInt(row.aqi_index),
            pm25: Number.parseFloat(row.pm25),
            pm10: Number.parseFloat(row.pm10),
            temperature_celsius: Number.parseFloat(row.temperature_celsius),
            humidity_percent: Number.parseFloat(row.humidity_percent),
            recorded_at: row.recorded_at || new Date().toISOString(),
          })),
          { onConflict: "user_id,recorded_at" },
        )
        .then((res) => res.data || [])
    }
    case "patient-data": {
      // From Synthetic EHR datasets
      return await supabase
        .from("patients")
        .upsert(
          validRows.map((row) => ({
            user_id: row.user_id,
            gender: row.gender,
            blood_type: row.blood_type,
            date_of_birth: row.date_of_birth,
            medical_history: row.medical_history,
            allergies: row.allergies,
          })),
          { onConflict: "user_id" },
        )
        .then((res) => res.data || [])
    }
    default:
      return []
  }
}
