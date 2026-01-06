import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Check if user is admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle()

    const isAdmin = profile?.is_admin || false

    console.log("[v0] Diagnostics - User:", { id: user.id, email: user.email, isAdmin })

    // Try to fetch reference images
    const { data: images, error: imagesError } = await supabase
      .from("medical_reference_images")
      .select("id, disease_name, image_name, image_url")
      .limit(5)

    console.log("[v0] Diagnostics - Images fetch:", {
      count: images?.length || 0,
      error: imagesError?.message,
      firstImage: images?.[0]?.disease_name,
    })

    // Try to fetch a specific disease
    const { data: asthmaImages, error: asthmaError } = await supabase
      .from("medical_reference_images")
      .select("id, disease_name, image_url")
      .ilike("disease_name", "%Asthma%")
      .limit(1)

    console.log("[v0] Diagnostics - Asthma images:", {
      count: asthmaImages?.length || 0,
      error: asthmaError?.message,
      imageUrl: asthmaImages?.[0]?.image_url?.substring(0, 100),
    })

    return NextResponse.json({
      userStatus: {
        userId: user.id,
        email: user.email,
        isAdmin,
      },
      imageAccess: {
        canFetchAll: !imagesError,
        allImagesCount: images?.length || 0,
        allImagesError: imagesError?.message || null,
        sampleDisease: images?.[0]?.disease_name,
      },
      diseaseSearch: {
        canFetchAsthma: !asthmaError,
        asthmaImagesCount: asthmaImages?.length || 0,
        asthmaError: asthmaError?.message || null,
        sampleUrl: asthmaImages?.[0]?.image_url?.substring(0, 100),
      },
      recommendations:
        imagesError || asthmaError
          ? [
              "Issue: RLS policies may be blocking image access",
              "Fix: Verify 'reference_images_select' policy allows admin/authenticated users",
              "Or: Add admin bypass policy similar to clinical_cases table",
            ]
          : ["All image access working correctly"],
    })
  } catch (error) {
    console.error("[v0] Diagnostics error:", error)
    return NextResponse.json({ error: "Diagnostic check failed", details: String(error) }, { status: 500 })
  }
}
