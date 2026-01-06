import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { healthMetrics, demographics } = await req.json()

    // Feature preprocessing
    const features = {
      age: demographics.age || 45,
      bmi: healthMetrics.weight / (healthMetrics.height / 100) ** 2,
      blood_pressure_systolic: healthMetrics.systolic || 120,
      blood_glucose: healthMetrics.glucose || 100,
      heart_rate: healthMetrics.heart_rate || 70,
    }

    // ML model inference (placeholder using realistic logic)
    const riskScores = {
      "Diabetes Type 2": 0.3 + (features.bmi > 25 ? 0.25 : 0) + (features.blood_glucose > 100 ? 0.2 : 0),
      Hypertension: 0.2 + (features.blood_pressure_systolic > 140 ? 0.35 : 0) + (features.age > 50 ? 0.15 : 0),
      "Heart Disease":
        0.15 + (features.heart_rate > 100 ? 0.2 : 0) + (features.blood_pressure_systolic > 140 ? 0.25 : 0),
      Asthma: Math.random() * 0.4,
      Obesity: 0.1 + (features.bmi > 30 ? 0.5 : features.bmi > 25 ? 0.3 : 0),
    }

    // Explainability
    const contributing_factors = Object.entries(features)
      .filter(([_, val]) => typeof val === "number" && val > 100)
      .map(([key]) => key)

    const topRisk = Object.entries(riskScores).sort(([, a], [, b]) => b - a)[0]

    return NextResponse.json({
      predictions: Object.entries(riskScores).map(([disease, score]) => ({
        predicted_disease: disease,
        confidence_score: Math.min(0.99, Math.max(0.01, score)),
        risk_level: score > 0.7 ? "high" : score > 0.4 ? "moderate" : "low",
        contributing_factors: contributing_factors.length > 0 ? contributing_factors : ["Age", "BMI"],
        recommendations:
          score > 0.6 ? ["Consult healthcare provider", "Lifestyle modifications"] : ["Monitor health metrics"],
      })),
      primary_risk: {
        disease: topRisk[0],
        score: Math.min(0.99, Math.max(0.01, topRisk[1])),
        explanation: `Risk based on ${contributing_factors.join(", ") || "demographic factors"}`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Prediction failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
