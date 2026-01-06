import { createServerClient } from "@supabase/ssr"

// Tamil Nadu specific data
const DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy", "Tiruppur", "Vellore", "Kanyakumari"]
const OCCUPATIONS = [
  "Textile Worker",
  "Software Engineer",
  "Construction Worker",
  "Factory Worker",
  "Farmer",
  "Auto Driver",
  "Store Owner",
  "Fisherman",
]
const DISEASES = [
  "Asthma",
  "Chronic Bronchitis",
  "COPD",
  "Tuberculosis",
  "Pneumonia",
  "Bronchiectasis",
  "Interstitial Lung Disease",
  "Occupational Lung Disease",
]
const TAMIL_FIRST_NAMES = [
  "Rajesh",
  "Priya",
  "Arun",
  "Divya",
  "Karthik",
  "Anjali",
  "Ramesh",
  "Kavya",
  "Suresh",
  "Lakshmi",
  "Vikram",
  "Nisha",
]
const TAMIL_LAST_NAMES = ["Kumar", "Singh", "Reddy", "Sharma", "Patel", "Gupta", "Verma", "Nair", "Iyer", "Rao"]

interface DemographicFactors {
  aqi_exposure: number
  pm25_exposure: number
  temperature_avg: number
  humidity_avg: number
  occupational_hazard: string
  years_exposure: number
  smoking_status: "never" | "former" | "current"
  age_factor: number
}

// Generate realistic Tamil Nadu demographic data
function generatePatientDemographics(occupation: string, district: string): DemographicFactors {
  const districtAQI: Record<string, number> = {
    Chennai: 85,
    Coimbatore: 92,
    Madurai: 78,
    Salem: 95,
    Trichy: 82,
    Tiruppur: 98,
    Vellore: 80,
    Kanyakumari: 65,
  }

  const occupationHazard: Record<string, { hazard: string; exposure_years: number }> = {
    "Textile Worker": { hazard: "Cotton Dust", exposure_years: 12 },
    "Software Engineer": { hazard: "None", exposure_years: 0 },
    "Construction Worker": { hazard: "Silica Dust & Pollution", exposure_years: 10 },
    "Factory Worker": { hazard: "Chemical Fumes", exposure_years: 15 },
    Farmer: { hazard: "Pesticide & Crop Dust", exposure_years: 20 },
    "Auto Driver": { hazard: "Vehicle Emissions", exposure_years: 8 },
    "Store Owner": { hazard: "None", exposure_years: 0 },
    Fisherman: { hazard: "Salt Air & Humidity", exposure_years: 18 },
  }

  const occupationInfo = occupationHazard[occupation] || { hazard: "None", exposure_years: 0 }
  const baseAQI = districtAQI[district] || 80

  return {
    aqi_exposure: baseAQI + (Math.random() * 20 - 10),
    pm25_exposure: baseAQI * 0.6 + (Math.random() * 15 - 7),
    temperature_avg: 28 + (Math.random() * 4 - 2),
    humidity_avg: 65 + (Math.random() * 15 - 7),
    occupational_hazard: occupationInfo.hazard,
    years_exposure: occupationInfo.exposure_years + Math.floor(Math.random() * 5),
    smoking_status: ["never", "former", "current"][Math.floor(Math.random() * 3)] as "never" | "former" | "current",
    age_factor: Math.random() * 0.5,
  }
}

// Generate disease-specific explanation based on demographic factors
function generateDiseaseExplanation(disease: string, factors: DemographicFactors, age: number): string {
  const explanations: Record<string, string> = {
    Asthma: `Patient shows elevated risk for Asthma. Contributing factors: AQI ${factors.aqi_exposure.toFixed(1)}, occupational exposure to ${factors.occupational_hazard}, age ${age}. AQI > 100 increases risk by 35%.`,
    "Chronic Bronchitis": `Chronic Bronchitis risk elevated due to: ${factors.years_exposure} years occupational exposure, AQI ${factors.aqi_exposure.toFixed(1)}, smoking status: ${factors.smoking_status}. Long-term exposure increases risk significantly.`,
    COPD: `COPD risk assessment: PM2.5 ${factors.pm25_exposure.toFixed(1)} µg/m³, ${factors.years_exposure} years workplace hazard exposure, age ${age}. Combined environmental and occupational factors indicate moderate-to-high risk.`,
    Tuberculosis: `TB screening recommended due to: occupational exposure to ${factors.occupational_hazard}, environmental stress, AQI levels. Clinical evaluation needed.`,
    Pneumonia: `Pneumonia susceptibility elevated: recent environmental stress from AQI ${factors.aqi_exposure.toFixed(1)}, age ${age}. Recommend respiratory hygiene measures.`,
    Bronchiectasis: `Progressive airway damage risk from: ${factors.years_exposure} years ${factors.occupational_hazard} exposure, PM2.5 ${factors.pm25_exposure.toFixed(1)}. Follow-up imaging recommended.`,
    "Interstitial Lung Disease": `ILD risk from occupational exposure: ${factors.occupational_hazard} over ${factors.years_exposure} years. Environmental factors: AQI ${factors.aqi_exposure.toFixed(1)}, humidity ${factors.humidity_avg.toFixed(1)}%.`,
    "Occupational Lung Disease": `High occupational risk: ${factors.years_exposure}+ years ${factors.occupational_hazard} exposure. AQI ${factors.aqi_exposure.toFixed(1)}, PM2.5 ${factors.pm25_exposure.toFixed(1)}. Workplace safety measures critical.`,
  }
  return explanations[disease] || "Clinical assessment required."
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      },
    )

    console.log("[v0] Starting 200 prediction seeding...")

    const { count: existingPredictions } = await supabase
      .from("predictions")
      .select("*", { count: "exact", head: true })

    if ((existingPredictions || 0) >= 200) {
      console.log("[v0] Data already seeded (200+ predictions exist), skipping seeding")
      return Response.json({
        success: true,
        message: "Data already seeded - 200+ predictions exist in database",
        existing_predictions: existingPredictions,
      })
    }

    // Step 1: Clear existing predictions
    const { error: clearError } = await supabase.from("predictions").delete().gte("created_at", "1900-01-01")

    if (clearError) throw clearError
    console.log("[v0] Cleared existing predictions")

    // Fetch existing doctor users to avoid duplicate key constraint violations
    const { data: existingUsers } = await supabase.from("users").select("id, email").eq("role", "doctor").limit(100)

    const existingEmails = new Set((existingUsers || []).map((u: any) => u.email))
    console.log(`[v0] Found ${existingEmails.size} existing doctor users, checking for duplicates...`)

    const { data: existingDoctors } = await supabase
      .from("doctors")
      .select("id, user_id")
      .not("user_id", "is", null)
      .limit(25)

    let doctorIds: string[] = []

    // If we have existing doctors, use their user_ids. Otherwise create new user records.
    if ((existingDoctors || []).length > 0) {
      console.log(`[v0] Found ${existingDoctors?.length} existing doctors, reusing their user_ids`)
      doctorIds = (existingDoctors || []).map((d: any) => d.user_id)
    } else {
      // Only create new doctor users if none exist
      const newDoctorUsers = []
      for (let i = 0; i < 25; i++) {
        const email = `doctor${i}@healthcare.tn`
        if (!existingEmails.has(email)) {
          const firstName = TAMIL_FIRST_NAMES[i % TAMIL_FIRST_NAMES.length]
          const lastName = TAMIL_LAST_NAMES[i % TAMIL_LAST_NAMES.length]

          newDoctorUsers.push({
            id: crypto.randomUUID(),
            email: email,
            full_name: `${firstName} ${lastName}`,
            role: "doctor",
            password_hash: "hashed_password",
            created_at: new Date(),
          })
        }
      }

      if (newDoctorUsers.length > 0) {
        const { data: insertedUsers, error: userError } = await supabase.from("users").insert(newDoctorUsers).select()

        if (userError) throw userError
        doctorIds = (insertedUsers || []).map((u: any) => u.id)
        console.log(`[v0] Created ${insertedUsers?.length} new doctor users`)
      }
    }

    // Now create doctor records linked to users
    const doctorRecords: any[] = []
    const specializations = ["Pulmonologist", "General Medicine", "Occupational Health", "Chest Specialist"]

    for (let i = 0; i < 25; i++) {
      const spec = specializations[i % specializations.length]
      const district = DISTRICTS[i % DISTRICTS.length]
      const userId = doctorIds[i % doctorIds.length] // Use doctorIds array instead of createdUsers

      if (!userId) {
        console.error(`[v0] Warning: No user_id available for doctor ${i}`)
        continue
      }

      doctorRecords.push({
        id: crypto.randomUUID(),
        user_id: userId,
        specialization: spec,
        clinic_address: `${district} Medical Center, Tamil Nadu`,
        phone: `+91-${String(Math.floor(Math.random() * 9000000000) + 1000000000).slice(0, 10)}`,
        license_number: `LIC-${district.toUpperCase()}-${String(i).padStart(4, "0")}`,
        created_at: new Date(),
      })
    }

    const { data: doctorData, error: doctorError } = await supabase.from("doctors").insert(doctorRecords).select()

    if (doctorError) throw doctorError
    console.log(`[v0] Created ${doctorRecords.length} doctors linked to user accounts`)

    // Step 3: Create 200 unique patients (8 per doctor) with demographic factors
    const patients: any[] = []
    const doctorIdsFromData = (doctorData || []).map((d: any) => d.id)

    for (let i = 0; i < 200; i++) {
      const occupation = OCCUPATIONS[i % OCCUPATIONS.length]
      const district = DISTRICTS[i % DISTRICTS.length]
      const age = 25 + Math.floor(Math.random() * 45)
      const gender = i % 2 === 0 ? "M" : "F"
      const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
      const bloodType = bloodTypes[i % bloodTypes.length]

      const demographicFactors = generatePatientDemographics(occupation, district)

      patients.push({
        id: crypto.randomUUID(),
        user_id: null,
        gender: gender,
        blood_type: bloodType,
        date_of_birth: new Date(new Date().setFullYear(new Date().getFullYear() - age)),
        medical_history: `Patient from ${district}, works as ${occupation}`,
        allergies: "None",
        aqi_index: demographicFactors.aqi_exposure,
        pm25_level: demographicFactors.pm25_exposure,
        temperature: demographicFactors.temperature_avg,
        humidity: demographicFactors.humidity_avg,
        occupational_hazard: demographicFactors.occupational_hazard,
        years_of_exposure: demographicFactors.years_exposure,
        smoking_status: demographicFactors.smoking_status,
        scan_image_url: null,
        created_at: new Date(),
      })
    }

    const { data: patientData, error: patientError } = await supabase.from("patients").insert(patients).select()

    if (patientError) throw patientError
    console.log("[v0] Created 200 patients with demographic factors")

    // Step 4: Create 200 predictions with demographic factor mapping
    const predictions: any[] = []
    const patientIds = (patientData || []).map((p: any) => p.id)

    for (let i = 0; i < 200; i++) {
      const patient = patients[i]
      const disease = DISEASES[i % DISEASES.length]
      const doctorId = doctorIdsFromData[i % doctorIdsFromData.length]
      const demographicFactors = generatePatientDemographics(patient.occupation, patient.district)

      // Calculate confidence based on demographic factors
      let baseConfidence = 0.55
      if (demographicFactors.aqi_exposure > 100) baseConfidence += 0.15
      if (demographicFactors.pm25_exposure > 50) baseConfidence += 0.12
      if (demographicFactors.years_exposure > 10) baseConfidence += 0.1
      if (patient.age > 45) baseConfidence += 0.08

      const confidence = Math.min(0.95, Math.max(0.55, baseConfidence + (Math.random() * 0.05 - 0.025)))

      const explanation = generateDiseaseExplanation(disease, demographicFactors, patient.age)

      predictions.push({
        id: crypto.randomUUID(),
        patient_id: patientIds[i],
        doctor_id: doctorId,
        predicted_disease: disease,
        confidence_score: confidence,
        severity_level: confidence > 0.85 ? 3 : confidence > 0.7 ? 2 : 1,
        explanation: explanation,
        created_at: new Date(),
      })
    }

    const { error: predictionError } = await supabase.from("predictions").insert(predictions)

    if (predictionError) throw predictionError
    console.log("[v0] Created 200 predictions with demographic mapping")

    return Response.json({
      success: true,
      doctors_created: doctorIds.length,
      patients_created: 200,
      predictions_created: 200,
      message: "200 unique Tamil Nadu predictions seeded with demographic factors",
    })
  } catch (error: any) {
    console.error("[v0] Seeding error:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
