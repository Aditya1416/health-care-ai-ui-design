import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const disease = searchParams.get("disease")

    const supabase = await createServerClient()

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

    let query = supabase.from("medical_reference_images").select("*")

    if (disease) {
      query = query.ilike("disease_name", `%${disease}%`)
    }

    const { data: images } = await query.limit(5)

    return NextResponse.json({ images: images || [] })
  } catch (error) {
    console.error("[v0] Error fetching reference images:", error)
    return NextResponse.json({ error: "Failed to fetch reference images" }, { status: 500 })
  }
}
