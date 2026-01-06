// Backend API client for Next.js frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface PredictionRequest {
  age: number
  temperature: number
  cough_severity: number
  fatigue: number
  body_ache: number
  aqi: number
  humidity: number
  temperature_env: number
}

interface DiseaseInfo {
  disease: string
  confidence: number
  severity: number
}

interface PredictionResponse {
  predictions: DiseaseInfo[]
  explanation: string
}

export async function fetchBackendData(userId: string) {
  "\"\"Fetch user data from backend\"\""
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })

    if (!response.ok) throw new Error("Failed to fetch backend data")
    return await response.json()
  } catch (error) {
    console.error("Backend API error:", error)
    return null
  }
}

export async function getPrediction(
  request: PredictionRequest,
  accessToken: string,
): Promise<PredictionResponse | null> {
  "\"\"Get disease prediction from ML backend\"\""
  try {
    const response = await fetch(`${API_BASE_URL}/predictions/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) throw new Error("Failed to get prediction")
    return await response.json()
  } catch (error) {
    console.error("Prediction API error:", error)
    return null
  }
}

export async function generateReport(patientId: string, accessToken: string) {
  "\"\"Generate PDF report\"\""
  try {
    const response = await fetch(`${API_BASE_URL}/reports/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        patient_id: patientId,
      }),
    })

    if (!response.ok) throw new Error("Failed to generate report")
    return await response.blob()
  } catch (error) {
    console.error("Report API error:", error)
    return null
  }
}

export async function getAdminStatistics(accessToken: string) {
  "\"\"Get admin dashboard statistics\"\""
  try {
    const response = await fetch(`${API_BASE_URL}/admin/statistics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) throw new Error("Failed to fetch statistics")
    return await response.json()
  } catch (error) {
    console.error("Admin API error:", error)
    return null
  }
}

export async function getModelPerformance(accessToken: string) {
  "\"\"Get ML model performance metrics\"\""
  try {
    const response = await fetch(`${API_BASE_URL}/admin/model-performance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) throw new Error("Failed to fetch model performance")
    return await response.json()
  } catch (error) {
    console.error("Model performance API error:", error)
    return null
  }
}

export async function uploadMedicalImage(file: File, patientId: string, accessToken: string) {
  "\"\"Upload medical image for analysis\"\""
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("patient_id", patientId)

    const response = await fetch(`${API_BASE_URL}/imaging/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) throw new Error("Failed to upload image")
    return await response.json()
  } catch (error) {
    console.error("Image upload error:", error)
    return null
  }
}
