import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const supabase = await createServerClient()

    let query = supabase.from("health_predictions").select("*").order("created_at", { ascending: false }).limit(50)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data: predictions, error } = await query

    if (error) throw error

    return NextResponse.json({ data: predictions })
  } catch (error) {
    console.error("Error fetching predictions:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
