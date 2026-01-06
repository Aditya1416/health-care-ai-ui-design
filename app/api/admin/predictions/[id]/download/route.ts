import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const predictionId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { data: prediction } = await supabase
      .from("health_risk_predictions")
      .select("*")
      .eq("id", predictionId)
      .single()

    if (!prediction) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 })
    }

    // Fetch patient info
    let patientInfo = {}
    if (prediction.patient_id) {
      const { data: patient } = await supabase.from("patients").select("*").eq("id", prediction.patient_id).single()

      if (patient) {
        const { data: userData } = await supabase.from("users").select("*").eq("id", patient.user_id).single()
        patientInfo = { ...patient, user: userData }
      }
    }

    // Generate comprehensive report
    const report = generateReport(prediction, patientInfo)

    return new NextResponse(report, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="prediction_${predictionId}_report.txt"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error downloading prediction:", error)
    return NextResponse.json({ error: "Failed to download prediction" }, { status: 500 })
  }
}

function generateReport(prediction: any, patientInfo: any): string {
  const now = new Date()
  const confidence = prediction.confidence ? Math.min(Math.max(prediction.confidence * 100, 0), 100).toFixed(1) : "0"

  let report = `
═══════════════════════════════════════════════════════════════════════════════
                    AI CLINICAL PREDICTION REPORT
═══════════════════════════════════════════════════════════════════════════════

REPORT GENERATED: ${now.toLocaleString()}
REPORT ID: ${prediction.id}

───────────────────────────────────────────────────────────────────────────────
PATIENT INFORMATION
───────────────────────────────────────────────────────────────────────────────
Patient Name:        ${patientInfo.user?.full_name || "Unknown"}
Patient ID:          ${patientInfo.id || "N/A"}
Date of Birth:       ${patientInfo.date_of_birth || "N/A"}
Gender:              ${patientInfo.gender || "N/A"}
Blood Type:          ${patientInfo.blood_type || "N/A"}
Medical History:     ${patientInfo.medical_history || "None documented"}
Allergies:           ${patientInfo.allergies || "None documented"}

───────────────────────────────────────────────────────────────────────────────
PREDICTION SUMMARY
───────────────────────────────────────────────────────────────────────────────
Predicted Disease:   ${prediction.disease_name}
Confidence Score:    ${confidence}%
Risk Category:       ${prediction.risk_category || "Unknown"}
Risk Score:          ${prediction.risk_score ? (prediction.risk_score * 100).toFixed(1) : "0"}%
ICD-10 Code:         ${prediction.icd10_code || "-"}
SNOMED CT Code:      ${prediction.snomed_code || "-"}
Model Version:       ${prediction.model_version || "v2.1.0"}
Prediction Date:     ${prediction.created_at ? new Date(prediction.created_at).toLocaleString() : "Unknown"}

───────────────────────────────────────────────────────────────────────────────
CLINICAL ANALYSIS & EXPLANATION
───────────────────────────────────────────────────────────────────────────────
${prediction.explanation || "No detailed analysis available"}

───────────────────────────────────────────────────────────────────────────────
FEATURE IMPORTANCE & CONTRIBUTING FACTORS
───────────────────────────────────────────────────────────────────────────────
`

  if (prediction.feature_importance && typeof prediction.feature_importance === "object") {
    const entries = Object.entries(prediction.feature_importance).sort(([, a]: any, [, b]: any) => b - a)
    entries.forEach(([feature, importance]: any) => {
      const importancePercent = (importance * 100).toFixed(1)
      const bar = "█".repeat(Math.ceil(importance * 20)) + "░".repeat(20 - Math.ceil(importance * 20))
      report += `${feature.padEnd(20)} ${bar} ${importancePercent}%\n`
    })
  }

  report += `
───────────────────────────────────────────────────────────────────────────────
INPUT CLINICAL DATA
───────────────────────────────────────────────────────────────────────────────
`

  if (prediction.input_features && typeof prediction.input_features === "object") {
    Object.entries(prediction.input_features).forEach(([key, value]: any) => {
      report += `${key.padEnd(30)} ${value}\n`
    })
  }

  report += `
───────────────────────────────────────────────────────────────────────────────
CLINICAL RECOMMENDATIONS
───────────────────────────────────────────────────────────────────────────────
1. Schedule consultation with relevant medical specialist for confirmation
2. Conduct appropriate diagnostic tests as recommended by physician
3. Review patient medical history and risk factors with healthcare provider
4. Develop personalized treatment or management plan if diagnosis confirmed

───────────────────────────────────────────────────────────────────────────────
IMPORTANT DISCLAIMER
───────────────────────────────────────────────────────────────────────────────
This report is generated by an AI-assisted clinical decision support system.
The analysis provided is intended for healthcare professionals only and should
NOT be used for self-diagnosis or as a substitute for professional medical advice.

All findings MUST be independently verified by qualified radiologists and 
healthcare professionals. The AI system provides probabilistic predictions based
on training data and should be used in conjunction with clinical judgment and
other diagnostic tools.

This system is NOT approved for diagnostic use and serves as a clinical
decision support tool only.

═══════════════════════════════════════════════════════════════════════════════
`

  return report
}
