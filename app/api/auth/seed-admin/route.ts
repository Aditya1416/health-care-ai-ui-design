import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createServerClient()

    // Create admin user in user_profiles table
    const adminData = {
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      is_admin: true,
      full_name: "Admin User",
      email: "aditya161499@gmail.com",
      phone: "+1-555-0100",
      age: 35,
      gender: "Male",
      blood_type: "O+",
      height_cm: 180,
      weight_kg: 75,
      medical_conditions: ["None"],
      allergies: ["Penicillin"],
      medications: [],
      address: "123 Health Street",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postal_code: "94102",
    }

    const { error: profileError } = await supabase.from("user_profiles").upsert([adminData], { onConflict: "user_id" })

    if (profileError) throw profileError

    // Seed sample patients
    const patients = Array.from({ length: 15 }, (_, i) => ({
      user_id: `550e8400-e29b-41d4-a716-44665544000${i}`,
      full_name: `Patient ${i + 1}`,
      date_of_birth: new Date(
        1990 + Math.floor(Math.random() * 20),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28),
      )
        .toISOString()
        .split("T")[0],
      gender: i % 2 === 0 ? "Male" : "Female",
      blood_type: ["O+", "A+", "B+", "AB+"][Math.floor(Math.random() * 4)],
      medical_history: "General health monitoring",
      allergies: "None",
    }))

    const { error: patientsError } = await supabase.from("patients").insert(patients)
    if (patientsError) throw patientsError

    // Seed sample health metrics
    const metrics = Array.from({ length: 30 }, (_, i) => ({
      patient_id: patients[Math.floor(Math.random() * patients.length)].user_id,
      metric_type: ["weight", "blood_pressure", "heart_rate", "glucose", "temperature"][Math.floor(Math.random() * 5)],
      value: Math.random() * 200,
      unit: "standard",
      recorded_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    const { error: metricsError } = await supabase.from("health_metrics").insert(metrics)
    if (metricsError) throw metricsError

    // Seed sample predictions
    const diseases = ["Hypertension", "Diabetes", "Asthma", "Pneumonia", "Flu", "COVID-19"]
    const predictions = Array.from({ length: 20 }, (_, i) => ({
      user_id: patients[Math.floor(Math.random() * patients.length)].user_id,
      predicted_disease: diseases[Math.floor(Math.random() * diseases.length)],
      confidence_score: 0.5 + Math.random() * 0.5,
      risk_level: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      contributing_factors: ["Age", "Lifestyle", "Environmental"],
      recommendations: ["Consult doctor", "Lifestyle changes", "Monitor symptoms"],
      prediction_date: new Date().toISOString(),
    }))

    const { error: predictionsError } = await supabase.from("health_predictions").insert(predictions)
    if (predictionsError) throw predictionsError

    return NextResponse.json({ success: true, message: "Admin and sample data seeded successfully" })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
