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

    const { metric_type, value, unit } = await request.json()

    const { data, error } = await supabase
      .from("health_metrics")
      .insert({
        user_id: user.id,
        metric_type,
        value,
        unit,
      })
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error saving metric:", error)
    return NextResponse.json({ error: "Failed to save metric" }, { status: 500 })
  }
}
