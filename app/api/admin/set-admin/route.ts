import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ADMIN_EMAIL = "aditya161499@gmail.com"

    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Only authorized users can be set as admin" }, { status: 403 })
    }

    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!existingProfile) {
      // Create user profile if it doesn't exist
      const { error: insertError } = await supabase.from("user_profiles").insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || ADMIN_EMAIL.split("@")[0],
        is_admin: true,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("[v0] Insert error:", insertError)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
      }
    } else {
      // Update existing profile to set is_admin = true
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ is_admin: true })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] Update error:", updateError)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${ADMIN_EMAIL} has been set as admin`,
      user_id: user.id,
    })
  } catch (error) {
    console.error("[v0] Error setting admin:", error)
    return NextResponse.json({ error: "Failed to set admin" }, { status: 500 })
  }
}
