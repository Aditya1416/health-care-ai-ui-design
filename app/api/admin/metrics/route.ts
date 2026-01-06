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

    // Get admin status
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get paginated metrics
    const { data: metrics, count } = await supabase
      .from("health_metrics")
      .select("*", { count: "exact" })
      .order("recorded_at", { ascending: false })
      .range(offset, offset + limit - 1)

    return NextResponse.json({
      metrics,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
