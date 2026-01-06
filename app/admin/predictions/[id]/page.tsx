"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PredictionsView from "@/app/components/predictions-view"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PredictionPage() {
  const params = useParams()
  const router = useRouter()
  const predictionId = params?.id as string
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!predictionId) return

    const fetchPrediction = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching prediction:", predictionId)
        const response = await fetch(`/api/admin/predictions/${predictionId}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP ${response.status}`
          console.error("[v0] API Error:", { status: response.status, error: errorMessage })
          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log("[v0] Prediction fetched successfully:", { disease: data.prediction?.predicted_disease })

        const fullPrediction = {
          ...data.prediction,
          scan_image_url: data.patient?.scan_image_url,
          patient: {
            user: { full_name: data.patient?.name },
            gender: data.patient?.gender,
            blood_type: data.patient?.blood_type,
            smoking_status: data.patient?.smoking_status,
            allergies: data.patient?.allergies,
            medical_history: data.patient?.medical_history,
          },
          environmental_factors: {
            aqi_index: data.patient?.aqi,
            pm25_level: data.patient?.pm25,
            temperature: data.patient?.temperature,
            humidity: data.patient?.humidity,
            occupational_hazard: data.patient?.occupational_hazard,
            years_exposure: data.patient?.years_exposure,
            district: data.patient?.district,
          },
        }
        setPrediction(fullPrediction)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred"
        setError(errorMsg)
        console.error("[v0] Fetch error details:", { error: errorMsg, predictionId })
      } finally {
        setLoading(false)
      }
    }

    fetchPrediction()
  }, [predictionId])

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">Loading prediction details...</CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-12 text-center text-red-700">
              {error ? `Error: ${error}` : "Prediction not found"}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Predictions
          </Button>
          <span className="text-sm text-muted-foreground">Prediction ID: {predictionId?.substring(0, 8)}</span>
        </div>
      </div>
      <div className="p-6">
        <PredictionsView prediction={prediction} />
      </div>
    </div>
  )
}
