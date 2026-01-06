import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: patients, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: patients })
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
