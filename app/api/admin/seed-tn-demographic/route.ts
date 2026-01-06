import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const TNDemographicData = {
  districts: ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"],
  cities: {
    Chennai: ["T. Nagar", "Velachery", "Tambaram", "Adyar"],
    Coimbatore: ["Saibaba Colony", "Town Hall", "Peelamedu"],
    Madurai: ["Aavani Mohan", "Pasumalai", "Chitra Nagar"],
    Trichy: ["Cantonment", "Thillai Nagar", "Ponmalai"],
    Salem: ["Fairlands", "Ashoka Nagar", "Meyyanur"],
  },
  commonDiseases: {
    Chennai: ["Asthma", "Allergic Rhinitis", "Type 2 Diabetes"],
    Coimbatore: ["Asthma", "Type 2 Diabetes", "Chronic Bronchitis"],
    Madurai: ["Hypertension", "Type 2 Diabetes", "Asthma"],
    Trichy: ["COPD", "Hypertension", "Type 2 Diabetes"],
    Salem: ["COPD", "Industrial Lung Disease", "Asthma"],
  },
  occupations: ["IT Professional", "Textile Worker", "Farmer", "Factory Worker", "Shopkeeper", "Driver"],
  environmentalFactors: {
    Chennai: { aqi: 75, pollution: "Moderate", humidity: 75, temp: 32 },
    Coimbatore: { aqi: 55, pollution: "Good", humidity: 60, temp: 28 },
    Madurai: { aqi: 65, pollution: "Moderate", humidity: 65, temp: 34 },
    Trichy: { aqi: 60, pollution: "Good", humidity: 68, temp: 30 },
    Salem: { aqi: 70, pollution: "Moderate", humidity: 62, temp: 31 },
  },
}

const doctorsData = [
  {
    name: "Dr. Ramakrishnan Iyer",
    specialization: "Pulmonology",
    phone: "+91-98765-43210",
    clinic_name: "Apollo Respiratory, Chennai",
    license_number: "LIC-TN-2006-4521",
    district: "Chennai",
  },
  {
    name: "Dr. Meera Sharma",
    specialization: "Endocrinology",
    phone: "+91-97654-32109",
    clinic_name: "Diabetes Care, Coimbatore",
    license_number: "LIC-TN-2009-3845",
    district: "Coimbatore",
  },
  {
    name: "Dr. Ashok Kumar",
    specialization: "Cardiology",
    phone: "+91-96543-21098",
    clinic_name: "Heart Health, Madurai",
    license_number: "LIC-TN-2001-2934",
    district: "Madurai",
  },
  {
    name: "Dr. Anjali Menon",
    specialization: "General Medicine",
    phone: "+91-95432-10987",
    clinic_name: "City Medical, Trichy",
    license_number: "LIC-TN-2012-1823",
    district: "Trichy",
  },
  {
    name: "Dr. Suresh Reddy",
    specialization: "Occupational Medicine",
    phone: "+91-94321-09876",
    clinic_name: "Industrial Health, Salem",
    license_number: "LIC-TN-2004-5674",
    district: "Salem",
  },
]

export async function POST() {
  try {
    const supabase = await createServerClient()

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

    // Seed Doctors
    const doctorRecords = []
    for (const doctorData of doctorsData) {
      const { data: newDoctor } = await supabase
        .from("doctors")
        .insert([
          {
            specialization: doctorData.specialization,
            license_number: doctorData.license_number,
            phone: doctorData.phone,
            clinic_address: `${doctorData.clinic_name}, ${doctorData.district}, Tamil Nadu`,
          },
        ])
        .select("id")
        .single()

      if (newDoctor) {
        doctorRecords.push({ ...doctorData, id: newDoctor.id })
      }
    }

    const patientRecords = []
    for (const doctor of doctorRecords) {
      for (let i = 0; i < 10; i++) {
        const age = 30 + Math.floor(Math.random() * 40)
        const gender = Math.random() > 0.5 ? "M" : "F"
        const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
        const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)]
        const occupation =
          TNDemographicData.occupations[Math.floor(Math.random() * TNDemographicData.occupations.length)]
        const city =
          TNDemographicData.cities[doctor.district][
            Math.floor(Math.random() * TNDemographicData.cities[doctor.district].length)
          ]
        const commonDiseases = TNDemographicData.commonDiseases[doctor.district]
        const medicalHistory = commonDiseases[Math.floor(Math.random() * commonDiseases.length)]

        const birthYear = new Date().getFullYear() - age
        const dob = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`

        const { data: newPatient } = await supabase
          .from("patients")
          .insert([
            {
              date_of_birth: dob,
              gender,
              blood_type: bloodType,
              medical_history: medicalHistory,
              allergies: Math.random() > 0.7 ? "Penicillin" : "None",
            },
          ])
          .select("id")
          .single()

        if (newPatient) {
          patientRecords.push({
            patient_id: newPatient.id,
            doctor_id: doctor.id,
            district: doctor.district,
            occupation,
            city,
          })
        }
      }
    }

    const diseases = [
      { name: "COPD", icd10: "J44.9", snomed: "13645005" },
      { name: "Type 2 Diabetes", icd10: "E11.9", snomed: "44054006" },
      { name: "Hypertension", icd10: "I10", snomed: "59621000" },
      { name: "Asthma", icd10: "J45.9", snomed: "195967001" },
      { name: "Allergic Rhinitis", icd10: "J30.9", snomed: "61582004" },
    ]

    const predictionsData = []
    for (const patient of patientRecords) {
      for (let i = 0; i < 5; i++) {
        const disease = diseases[i]
        const env = TNDemographicData.environmentalFactors[patient.district]

        const confidencePercentage = 55 + Math.random() * 35 // 55-90%
        const confidence = confidencePercentage / 100 // Convert to 0-1 decimal

        predictionsData.push({
          patient_id: patient.patient_id.toString(),
          disease_name: disease.name,
          icd10_code: disease.icd10,
          snomed_code: disease.snomed,
          risk_category: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
          risk_score: Math.floor(confidencePercentage), // 55-90 range
          confidence: Math.round(confidence * 1000) / 1000, // Round to 3 decimals for precision
          model_version: "v2.1.0-tn",
          input_features: JSON.stringify({
            occupation: patient.occupation,
            district: patient.district,
            aqi: env.aqi,
            pollution: env.pollution,
            age: new Date().getFullYear() - Number.parseInt(patient.date_of_birth?.split("-")[0] || "2000"),
          }),
          feature_importance: JSON.stringify({
            occupation_exposure: 0.35,
            environmental_aqi: 0.25,
            age: 0.2,
            lifestyle: 0.15,
            genetics: 0.05,
          }),
          explanation: `Risk assessment for ${disease.name} based on ${patient.occupation} work, ${env.pollution} air quality (AQI: ${env.aqi}), and demographics in ${patient.district}.`,
          created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        })
      }
    }

    const { error: predictionsError } = await supabase.from("health_risk_predictions").insert(predictionsData)

    if (predictionsError) console.error("[v0] Predictions error:", predictionsError)

    return NextResponse.json({
      success: true,
      message: "Tamil Nadu dataset seeded with 250 realistic predictions",
      counts: {
        doctors: doctorRecords.length,
        patients: patientRecords.length,
        predictions: predictionsData.length,
      },
    })
  } catch (error) {
    console.error("[v0] TN seed error:", error)
    return NextResponse.json({ error: `Seed failed: ${error.message}` }, { status: 500 })
  }
}
