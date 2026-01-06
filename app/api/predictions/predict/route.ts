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

    const patientData = await request.json()

    // Call Python ML engine (simulated with JavaScript implementation for now)
    const predictions = predictHealthConditions(patientData)

    // Save prediction to database
    const { data, error } = await supabase
      .from("predictions")
      .insert({
        user_id: user.id,
        predicted_disease: predictions[0]?.disease || "Unknown",
        confidence_score: predictions[0]?.confidence || 0,
        contributing_factors: predictions[0]?.contributing_factors || {},
        severity_level: predictions[0]?.severity || 1,
        recommendation: generateRecommendation(predictions[0]),
      })
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, predictions, saved: data })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}

function predictHealthConditions(patientData: any) {
  const diseaseDB: { [key: string]: any } = {
    "Common Cold": {
      symptoms: ["cough", "sore throat", "runny nose", "fever"],
      risk_factors: ["seasonal", "stress", "poor sleep"],
      severity: 1,
    },
    "Diabetes Type 2": {
      symptoms: ["fatigue", "increased thirst", "frequent urination", "blurred vision"],
      risk_factors: ["obesity", "sedentary lifestyle", "family history", "age"],
      severity: 3,
    },
    Hypertension: {
      symptoms: ["headache", "dizziness", "chest pain"],
      risk_factors: ["stress", "obesity", "salt intake", "family history"],
      severity: 3,
    },
    Asthma: {
      symptoms: ["shortness of breath", "wheezing", "chest tightness", "cough"],
      risk_factors: ["air pollution", "allergens", "cold weather", "stress"],
      severity: 2,
    },
    Migraine: {
      symptoms: ["severe headache", "nausea", "light sensitivity", "vomiting"],
      risk_factors: ["stress", "hormones", "sleep deprivation", "caffeine"],
      severity: 2,
    },
  }

  const predictions = []

  for (const [disease, data] of Object.entries(diseaseDB)) {
    const symptoms = patientData.symptoms || []
    const riskFactors = patientData.risk_factors || []

    const symptomMatch = symptoms.filter((s: string) =>
      data.symptoms.some((ds: string) => ds.toLowerCase().includes(s.toLowerCase())),
    ).length
    const symptomScore = (symptomMatch / data.symptoms.length) * 100

    const riskMatch = riskFactors.filter((r: string) =>
      data.risk_factors.some((dr: string) => dr.toLowerCase().includes(r.toLowerCase())),
    ).length
    const riskScore = (riskMatch / data.risk_factors.length) * 50

    const confidence = Math.min(100, symptomScore * 0.6 + riskScore * 0.4)

    if (confidence > 20) {
      predictions.push({
        disease,
        confidence: Number(confidence.toFixed(2)),
        severity: data.severity,
        contributing_factors: { symptoms: symptomScore, risk_factors: riskScore },
      })
    }
  }

  predictions.sort((a, b) => b.confidence - a.confidence)
  return predictions.slice(0, 5)
}

function generateRecommendation(prediction: any): string {
  if (!prediction) return "Please consult with a healthcare professional."

  const recommendations: { [key: string]: string } = {
    "Common Cold":
      "Rest well, stay hydrated, and consider over-the-counter remedies. Consult a doctor if symptoms persist.",
    "Diabetes Type 2":
      "Maintain a balanced diet, exercise regularly, and monitor blood sugar levels. Schedule a consultation with an endocrinologist.",
    Hypertension:
      "Reduce sodium intake, manage stress, and exercise regularly. Regular blood pressure monitoring is recommended.",
    Asthma:
      "Avoid triggers, use prescribed inhalers, and keep emergency medications nearby. Consult a pulmonologist for management.",
    Migraine:
      "Identify and avoid triggers, stay hydrated, and rest in a dark room. Consider consulting a neurologist for treatment options.",
  }

  return recommendations[prediction.disease] || "Please consult with a healthcare professional for personalized advice."
}
