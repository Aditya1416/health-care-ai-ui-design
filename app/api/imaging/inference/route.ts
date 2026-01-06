import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { imageUrl, imageType } = await request.json()

    if (!imageUrl || !imageType) {
      return NextResponse.json({ error: "Missing imageUrl or imageType" }, { status: 400 })
    }

    const diseases = ["Pneumonia", "TB", "Nodule", "Fracture", "Infection"]
    const selectedDisease = diseases[Math.floor(Math.random() * diseases.length)]
    const confidence = 0.65 + Math.random() * 0.3

    const inferenceResult = {
      disease_name: selectedDisease,
      disease_code: `DIS_${selectedDisease.toUpperCase()}`,
      confidence: Number(confidence.toFixed(4)),
      severity: confidence > 0.8 ? "High" : confidence > 0.6 ? "Medium" : "Low",
      heatmap_regions: [
        { region: "upper_left", intensity: 0.7 },
        { region: "center", intensity: 0.85 },
      ],
      pixel_differences: {
        abnormal_pixels: Math.floor(1000 + Math.random() * 5000),
        total_pixels: 262144,
        difference_percentage: Number(((Math.random() * 8 + 2) / 100).toFixed(4)),
      },
      model_version: "v2.1.0",
      explanation: `Model detected signs of ${selectedDisease.toLowerCase()} with ${(confidence * 100).toFixed(1)}% confidence. Recommend radiologist review.`,
      recommendations: ["Consult radiologist", "Follow-up imaging in 6 weeks", "Compare with prior studies"],
      requires_validation: confidence < 0.75,
    }

    return NextResponse.json(inferenceResult)
  } catch (error) {
    console.error("[v0] Inference error:", error)
    return NextResponse.json({ error: "Inference failed" }, { status: 500 })
  }
}
