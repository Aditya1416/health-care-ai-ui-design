import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    let customUserId = null
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", user.email).maybeSingle()

    if (existingUser?.id) {
      customUserId = existingUser.id
    } else {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            email: user.email,
            full_name: user.user_metadata?.full_name || "Admin User",
            role: "admin",
            is_active: true,
          },
        ])
        .select("id")
        .single()

      if (createError) throw createError
      customUserId = newUser?.id
    }

    const { data: existingPatient } = await supabase
      .from("patients")
      .select("id")
      .eq("user_id", customUserId)
      .maybeSingle()

    let finalPatientId = existingPatient?.id
    if (!finalPatientId) {
      const { data: newPatient, error: patientError } = await supabase
        .from("patients")
        .insert([
          {
            user_id: customUserId,
            date_of_birth: "1975-03-22",
            gender: "M",
            blood_type: "AB+",
            medical_history: "Hypertension, Type 2 Diabetes (controlled), History of acute bronchitis",
            allergies: "Penicillin, Shellfish",
          },
        ])
        .select("id")
        .single()

      if (patientError) throw patientError
      finalPatientId = newPatient?.id
    }

    let doctorId = null
    const { data: existingDoctorByLicense } = await supabase
      .from("doctors")
      .select("id")
      .eq("license_number", "LIC-TN-2018-8742")
      .maybeSingle()

    if (existingDoctorByLicense?.id) {
      doctorId = existingDoctorByLicense.id
    } else {
      const { data: newDoctor, error: doctorError } = await supabase
        .from("doctors")
        .insert([
          {
            user_id: customUserId,
            specialization: "Pulmonology & Internal Medicine",
            license_number: "LIC-TN-2018-8742",
            phone: "+91-98765-43210",
            clinic_address: "Apollo Hospital, Greams Road, Chennai, Tamil Nadu 600006, India",
          },
        ])
        .select("id")
        .single()

      if (doctorError) throw doctorError
      doctorId = newDoctor?.id
    }

    const metricTypes = [
      { type: "systolic_bp", unit: "mmHg", min: 110, max: 170 },
      { type: "diastolic_bp", unit: "mmHg", min: 70, max: 110 },
      { type: "heart_rate", unit: "bpm", min: 65, max: 95 },
      { type: "blood_glucose", unit: "mg/dL", min: 110, max: 280 },
      { type: "oxygen_saturation", unit: "%", min: 94, max: 99 },
      { type: "temperature", unit: "°C", min: 36.5, max: 37.5 },
      { type: "weight", unit: "kg", min: 78, max: 86 },
    ]

    const metricsData = []
    for (let i = 0; i < 150; i++) {
      const metricDef = metricTypes[Math.floor(Math.random() * metricTypes.length)]
      metricsData.push({
        patient_id: finalPatientId,
        metric_type: metricDef.type,
        value: metricDef.min + Math.random() * (metricDef.max - metricDef.min),
        unit: metricDef.unit,
        recorded_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    const { error: metricsError } = await supabase.from("health_metrics").insert(metricsData)
    if (metricsError) console.error("[v0] Metrics error:", metricsError)

    const appointmentTypes = ["Consultation", "X-ray Imaging", "CT Scan", "Lab Test", "Follow-up", "Spirometry Test"]
    const appointmentsData = Array.from({ length: 80 }, (_, i) => ({
      patient_id: finalPatientId,
      appointment_type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
      appointment_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: ["scheduled", "completed", "cancelled"][Math.floor(Math.random() * 3)],
      notes: `Clinical ${appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)].toLowerCase()} - routine assessment`,
      doctor_id: doctorId,
      created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    const { error: appointmentsError } = await supabase.from("appointments").insert(appointmentsData)
    if (appointmentsError) console.error("[v0] Appointments error:", appointmentsError)

    const diseases = [
      { name: "Chronic Obstructive Pulmonary Disease (COPD)", icd10: "J44.9", snomed: "13645005" },
      { name: "Type 2 Diabetes Mellitus", icd10: "E11.9", snomed: "44054006" },
      { name: "Essential Hypertension", icd10: "I10", snomed: "59621000" },
      { name: "Acute Bronchitis", icd10: "J20.9", snomed: "233604007" },
      { name: "Asthma", icd10: "J45.9", snomed: "195967001" },
      { name: "Coronary Artery Disease", icd10: "I25.10", snomed: "53741008" },
      { name: "Pneumonia", icd10: "J18.9", snomed: "233604007" },
      { name: "Pulmonary Embolism", icd10: "I26.99", snomed: "59282003" },
    ]

    const riskPredictionsData = Array.from({ length: 120 }, (_, i) => {
      const disease = diseases[Math.floor(Math.random() * diseases.length)]
      return {
        patient_id: finalPatientId?.toString() || "",
        disease_name: disease.name,
        disease_code: "D" + Math.random().toString(36).substr(2, 5).toUpperCase(),
        icd10_code: disease.icd10,
        snomed_code: disease.snomed,
        risk_category: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
        risk_score: Math.random() * 100,
        confidence: 0.55 + Math.random() * 0.4,
        model_version: "v2.1.0-clinical",
        input_features: JSON.stringify({
          age: 49,
          bmi: 28.5,
          glucose_fasting: 145,
          systolic_bp: 138,
          heart_rate: 78,
          smoking_history: "former",
          family_history: "yes",
        }),
        feature_importance: JSON.stringify({
          glucose: 0.35,
          systolic_bp: 0.25,
          age: 0.2,
          family_history: 0.12,
          bmi: 0.08,
        }),
        explanation: `${disease.name} risk assessment based on elevated glucose levels (${145} mg/dL) and blood pressure readings (${138}/${90} mmHg). Clinical correlation recommended.`,
        created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      }
    })

    const { error: predictionsError } = await supabase.from("health_risk_predictions").insert(riskPredictionsData)
    if (predictionsError) console.error("[v0] Predictions error:", predictionsError)

    const clinicalCaseTitles = [
      "Suspected COPD with chest imaging findings",
      "Type 2 Diabetes management and risk assessment",
      "Hypertensive urgency with cardiac involvement",
      "Recurrent bronchitis - differential diagnosis",
      "Chest pain evaluation - CAD risk stratification",
    ]

    const { data: existingCases } = await supabase
      .from("clinical_cases")
      .select("id")
      .eq("patient_id", finalPatientId)
      .eq("doctor_id", doctorId)

    let casesInserted = []
    if (!existingCases || existingCases.length === 0) {
      const casesData = Array.from({ length: 5 }, (_, i) => ({
        patient_id: finalPatientId,
        doctor_id: doctorId,
        case_number: `CASE-2025-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, "0")}`,
        case_title: clinicalCaseTitles[i],
        case_description: `Clinical case presentation with imaging and lab findings. Patient presents with ${
          [
            "persistent cough",
            "elevated glucose readings",
            "uncontrolled hypertension",
            "recurrent respiratory infections",
            "atypical chest pain",
          ][i]
        }. AI analysis requested for differential diagnosis and risk stratification.`,
        status: ["open", "in-review", "resolved"][Math.floor(Math.random() * 3)],
        priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { data: inserted, error: casesError } = await supabase.from("clinical_cases").insert(casesData).select("id")

      if (casesError) console.error("[v0] Cases error:", casesError)
      casesInserted = inserted || []
    }

    return NextResponse.json({
      success: true,
      message: "Comprehensive clinical dataset seeded successfully",
      counts: {
        metrics: metricsData.length,
        appointments: appointmentsData.length,
        predictions: riskPredictionsData.length,
        cases: casesInserted?.length || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Seed error:", error)
    return NextResponse.json({ error: `Seed failed: ${error.message}` }, { status: 500 })
  }
}
