import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Handle cookie setting errors gracefully
            }
          },
        },
      },
    )

    const predictionId = params.id

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      console.log("[v0] Unauthorized: No user session")
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      console.log("[v0] Forbidden: User is not admin", { userId: user.id })
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { data: prediction, error: predictionError } = await supabase
      .from("predictions")
      .select(
        "id, predicted_disease, confidence_score, severity_level, doctor_id, patient_id, explanation, environmental_factors, created_at",
      )
      .eq("id", predictionId)
      .maybeSingle()

    if (predictionError) {
      console.log("[v0] Prediction fetch error:", predictionError)
      return NextResponse.json({ error: "Failed to fetch prediction" }, { status: 500 })
    }

    if (!prediction) {
      console.log("[v0] Prediction not found:", predictionId)
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 })
    }

    console.log("[v0] Fetching prediction:", {
      id: predictionId,
      disease: prediction.predicted_disease,
      patientId: prediction.patient_id,
      doctorId: prediction.doctor_id,
    })

    let patientData = null
    if (prediction.patient_id) {
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", prediction.patient_id)
        .maybeSingle()

      if (patient) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, full_name, email")
          .eq("id", patient.user_id)
          .maybeSingle()

        console.log("[v0] Patient data loaded:", {
          name: userData?.full_name,
          aqi: patient.aqi_index,
          pm25: patient.pm25_level,
          occupational: patient.occupational_hazard,
          smoking: patient.smoking_status,
          age: patient.date_of_birth,
        })

        patientData = {
          id: patient.id,
          name: userData?.full_name || "Unknown",
          email: userData?.email || "N/A",
          dob: patient.date_of_birth || "N/A",
          gender: patient.gender || "N/A",
          blood_type: patient.blood_type || "N/A",
          medical_history: patient.medical_history || "None documented",
          allergies: patient.allergies || "None documented",
          scan_image_url: patient.scan_image_url || null,
          aqi: patient.aqi_index,
          pm25: patient.pm25_level,
          temperature: patient.temperature,
          humidity: patient.humidity,
          occupational_hazard: patient.occupational_hazard,
          years_exposure: patient.years_of_exposure || 0,
          smoking_status: patient.smoking_status,
          age: patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : null,
        }
      }
    }

    const { data: allReferenceImages, error: refError } = await supabase
      .from("medical_reference_images")
      .select("id, image_url, disease_name, image_name, notes")
      .ilike("disease_name", `%${prediction.predicted_disease}%`)
      .limit(5)

    if (refError) {
      console.log("[v0] Error fetching reference images:", refError)
    }

    console.log("[v0] Reference images found:", allReferenceImages?.length || 0, {
      disease: prediction.predicted_disease,
      images: allReferenceImages?.map((img) => ({
        name: img.image_name,
        url: img.image_url?.substring(0, 80),
      })),
    })

    let doctorData = null
    if (prediction.doctor_id) {
      const { data: doctor } = await supabase.from("doctors").select("*").eq("id", prediction.doctor_id).maybeSingle()

      if (doctor) {
        const { data: doctorUser } = await supabase
          .from("users")
          .select("id, full_name, email")
          .eq("id", doctor.user_id)
          .maybeSingle()

        doctorData = {
          id: doctor.id,
          name: doctorUser?.full_name || "Unknown",
          email: doctorUser?.email || "N/A",
          specialization: doctor.specialization || "N/A",
          license_number: doctor.license_number || "N/A",
          phone: doctor.phone || "N/A",
          clinic_address: doctor.clinic_address || "N/A",
        }
      }
    }

    return NextResponse.json({
      prediction: {
        ...prediction,
        environmental_factors: prediction.environmental_factors || {},
      },
      patient: patientData,
      doctor: doctorData,
      referenceImages: allReferenceImages || [],
    })
  } catch (error) {
    console.error("[v0] Error fetching prediction:", error)
    return NextResponse.json({ error: "Failed to fetch prediction", details: String(error) }, { status: 500 })
  }
}
