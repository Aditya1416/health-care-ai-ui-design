import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { uploadMedicalImage, analyzeMedialImage, updateImageAnalysis } from "@/lib/services/medical-imaging-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const imageType = formData.get("imageType") as string
    const bodyPart = formData.get("bodyPart") as string
    const imageDate = formData.get("imageDate") as string
    const orderingProvider = formData.get("orderingProvider") as string
    const indication = formData.get("indication") as string

    if (!file || !imageType || !bodyPart || !imageDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload image
    const image = await uploadMedicalImage(user.id, file, imageType as any, bodyPart, imageDate, {
      ordering_provider: orderingProvider,
      indication: indication,
    })

    // Trigger analysis (in production, this would be async)
    try {
      const analysis = await analyzeMedialImage(image.id!, image.image_url, imageType, bodyPart)
      await updateImageAnalysis(image.id!, analysis)
    } catch (error) {
      console.error("Error analyzing image:", error)
      // Continue without analysis
    }

    return NextResponse.json({ success: true, image })
  } catch (error) {
    console.error("Error uploading medical image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
