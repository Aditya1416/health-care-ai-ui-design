import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { patientId, predictionId, doctorId } = await request.json()

    if (!patientId || !predictionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch patient data
    const { data: patient } = await supabase.from("patients").select("*").eq("id", patientId).single()

    // Fetch prediction data
    const { data: prediction } = await supabase
      .from("health_risk_predictions")
      .select("*")
      .eq("id", predictionId)
      .single()

    // Fetch doctor data if provided
    let doctor = null
    if (doctorId) {
      const { data: doctorData } = await supabase.from("doctors").select("*").eq("id", doctorId).single()
      doctor = doctorData
    }

    // Generate comprehensive report
    const report = generateComprehensiveReport(patient, prediction, doctor)

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Report generation error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

function generateComprehensiveReport(patient: any, prediction: any, doctor: any) {
  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Medical AI Diagnosis Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
    .section { margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; }
    .section-title { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
    .field { display: flex; justify-content: space-between; margin: 8px 0; }
    .label { font-weight: bold; color: #1e40af; }
    .value { color: #333; }
    .risk-high { background: #fee2e2; padding: 10px; border-radius: 5px; border-left: 4px solid #ef4444; }
    .risk-medium { background: #fef3c7; padding: 10px; border-radius: 5px; border-left: 4px solid #f59e0b; }
    .risk-low { background: #d1fae5; padding: 10px; border-radius: 5px; border-left: 4px solid #10b981; }
    .disclaimer { background: #fee2e2; padding: 15px; margin: 20px 0; border-radius: 5px; font-size: 12px; border-left: 4px solid #dc2626; }
    .footer { text-align: center; font-size: 11px; color: #666; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f3f4f6; font-weight: bold; color: #1e40af; }
  </style>
</head>
<body>
  <div class="header">
    <h1>COMPREHENSIVE MEDICAL AI DIAGNOSIS REPORT</h1>
    <p>Generated: ${formattedDate}</p>
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>CRITICAL MEDICAL DISCLAIMER:</strong><br/>
    This report contains AI-generated analysis for educational and research purposes only. It is NOT a medical diagnosis and does NOT constitute medical advice. This analysis must be reviewed and validated by qualified healthcare professionals. Always consult licensed physicians before making any medical decisions. The system is designed to assist medical professionals, not replace clinical judgment.
  </div>

  <!-- Patient Information -->
  <div class="section">
    <div class="section-title">1. PATIENT INFORMATION</div>
    <div class="field">
      <span class="label">Patient ID:</span>
      <span class="value">${patient?.id || "N/A"}</span>
    </div>
    <div class="field">
      <span class="label">Date of Birth:</span>
      <span class="value">${patient?.date_of_birth || "N/A"}</span>
    </div>
    <div class="field">
      <span class="label">Gender:</span>
      <span class="value">${patient?.gender || "N/A"}</span>
    </div>
    <div class="field">
      <span class="label">Blood Type:</span>
      <span class="value">${patient?.blood_type || "N/A"}</span>
    </div>
    <div class="field">
      <span class="label">Medical History:</span>
      <span class="value">${patient?.medical_history || "Not specified"}</span>
    </div>
    <div class="field">
      <span class="label">Allergies:</span>
      <span class="value">${patient?.allergies || "None reported"}</span>
    </div>
  </div>

  <!-- Physician Information -->
  ${
    doctor
      ? `
  <div class="section">
    <div class="section-title">2. ATTENDING PHYSICIAN</div>
    <div class="field">
      <span class="label">License Number:</span>
      <span class="value">${doctor.license_number || "N/A"}</span>
    </div>
    <div class="field">
      <span class="label">Specialization:</span>
      <span class="value">${doctor.specialization || "N/A"}</span>
    </div>
    <div class="field">
      <span class="label">Contact:</span>
      <span class="value">${doctor.phone || "N/A"}</span>
    </div>
    <div class="field">
      <span class="label">Clinic Address:</span>
      <span class="value">${doctor.clinic_address || "N/A"}</span>
    </div>
  </div>
  `
      : ""
  }

  <!-- AI Diagnosis -->
  <div class="section">
    <div class="section-title">3. AI-ASSISTED DIAGNOSIS</div>
    <div class="field">
      <span class="label">Disease Predicted:</span>
      <span class="value"><strong>${prediction?.disease_name || "N/A"}</strong></span>
    </div>
    <div class="field">
      <span class="label">Confidence Score:</span>
      <span class="value"><strong>${(prediction?.confidence * 100).toFixed(1)}%</strong></span>
    </div>
    <div class="field">
      <span class="label">Risk Score:</span>
      <span class="value"><strong>${prediction?.risk_score?.toFixed(1) || "N/A"}</strong></span>
    </div>
    <div class="field">
      <span class="label">Risk Category:</span>
      <span class="value">
        <strong class="${
          prediction?.risk_score > 70 ? "risk-high" : prediction?.risk_score > 40 ? "risk-medium" : "risk-low"
        }" style="display: inline-block; padding: 4px 8px; border-radius: 3px;">
          ${prediction?.risk_score > 70 ? "HIGH" : prediction?.risk_score > 40 ? "MEDIUM" : "LOW"}
        </strong>
      </span>
    </div>
    <div class="field">
      <span class="label">ICD-10 Code:</span>
      <span class="value">${prediction?.icd10_code || "N/A"}</span>
    </div>
    <div class="field">
      <span class="label">SNOMED CT Code:</span>
      <span class="value">${prediction?.snomed_code || "N/A"}</span>
    </div>
  </div>

  <!-- Feature Analysis -->
  ${
    prediction?.feature_importance
      ? `
  <div class="section">
    <div class="section-title">4. CONTRIBUTING FACTORS & FEATURE IMPORTANCE</div>
    <p><strong>Key factors contributing to this diagnosis:</strong></p>
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Importance</th>
          <th>Impact</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(JSON.parse(prediction.feature_importance || "{}"))
          .map(
            ([key, value]: any) => `
        <tr>
          <td>${key.replace(/_/g, " ")}</td>
          <td>${(value * 100).toFixed(1)}%</td>
          <td>${value > 0.3 ? "High" : value > 0.15 ? "Medium" : "Low"}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>
  `
      : ""
  }

  <!-- Clinical Explanation -->
  <div class="section">
    <div class="section-title">5. CLINICAL EXPLANATION</div>
    <p>${prediction?.explanation || "Analysis not available"}</p>
  </div>

  <!-- Input Data -->
  ${
    prediction?.input_features
      ? `
  <div class="section">
    <div class="section-title">6. INPUT DATA & METRICS</div>
    <table>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(JSON.parse(prediction.input_features || "{}"))
          .map(
            ([key, value]: any) => `
        <tr>
          <td>${key.replace(/_/g, " ")}</td>
          <td>${value}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>
  `
      : ""
  }

  <!-- Recommendations -->
  <div class="section">
    <div class="section-title">7. RECOMMENDATIONS & NEXT STEPS</div>
    <ul>
      <li>This AI analysis should be reviewed and validated by the attending physician</li>
      <li>Recommend clinical correlation with patient's signs, symptoms, and physical examination</li>
      <li>Consider additional diagnostic testing if clinically indicated</li>
      <li>Follow-up imaging or labs may be required based on clinical response</li>
      <li>This report is NOT a substitute for professional medical judgment</li>
    </ul>
  </div>

  <!-- Data Quality -->
  <div class="section">
    <div class="section-title">8. ANALYSIS QUALITY & LIMITATIONS</div>
    <ul>
      <li><strong>Model Version:</strong> ${prediction?.model_version || "v2.1.0"}</li>
      <li><strong>Analysis Date:</strong> ${new Date().toLocaleString("en-IN")}</li>
      <li><strong>Confidence Level:</strong> ${(prediction?.confidence * 100).toFixed(1)}%</li>
      <li><strong>Limitations:</strong> This analysis is based on available data and historical patterns. Individual clinical presentation may vary.</li>
    </ul>
  </div>

  <!-- Final Disclaimer -->
  <div class="disclaimer">
    <strong>IMPORTANT LEGAL NOTICE:</strong><br/>
    This report is generated by an AI system for research and educational purposes. It is NOT meant for clinical diagnosis. All results must be validated by licensed medical professionals. The system developers and organization accept no responsibility for any medical decisions based solely on this report. Always seek professional medical advice.
  </div>

  <div class="footer">
    <p>Report Generated: ${formattedDate}</p>
    <p>Healthcare AI Diagnostic System v2.1.0 - Tamil Nadu Demographic Study</p>
    <p>For questions, contact your healthcare provider or medical facility.</p>
  </div>
</body>
</html>
  `

  return reportHTML
}
