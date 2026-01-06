"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ChevronRight, Filter } from "lucide-react"

interface Prediction {
  id: string
  predicted_disease: string
  confidence_score: number
  risk_level: string
  icd10_code?: string
  snomed_code?: string
  patient_id?: string
  created_at: string
  explanation?: string
  input_features?: {
    aqi: number
    occupational_hazard: string
    years_exposure: number
  }
  hasXray?: boolean // Added hasXray property to Prediction interface
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [diseaseFilter, setDiseaseFilter] = useState<string>("all")
  const [diseases, setDiseases] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchPredictions()
  }, [page, diseaseFilter])

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const url = new URL(`${window.location.origin}/api/admin/predictions`)
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", "20")
      if (diseaseFilter !== "all") {
        url.searchParams.append("disease", diseaseFilter)
      }

      const response = await fetch(url.toString())
      const data = await response.json()
      console.log("[v0] Predictions data:", data)

      const predictionsWithXray = (data.predictions || []).map((p: any) => ({
        ...p,
        hasXray: p.hasXray || false,
      }))

      setPredictions(predictionsWithXray)
      setTotalPages(data.pagination?.pages || 0)

      if (data.predictions?.length > 0) {
        const uniqueDiseases = [...new Set(data.predictions.map((p: Prediction) => p.predicted_disease))]
        setDiseases(uniqueDiseases)
      }
    } catch (error) {
      console.error("[v0] Error fetching predictions:", error)
      setPredictions([])
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Predictions</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                200+ disease predictions with demographic factors and X-ray availability
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Admin</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={diseaseFilter === "all" ? "default" : "outline"}
                onClick={() => {
                  setDiseaseFilter("all")
                  setPage(1)
                }}
              >
                All Diseases
              </Button>
              {diseases.map((disease) => (
                <Button
                  key={disease}
                  variant={diseaseFilter === disease ? "default" : "outline"}
                  onClick={() => {
                    setDiseaseFilter(disease)
                    setPage(1)
                  }}
                >
                  {disease}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Predictions List with Demographic Factors</span>
              <span className="text-sm font-normal text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading predictions...</p>
              ) : predictions.length > 0 ? (
                predictions.map((pred) => (
                  <button
                    key={pred.id}
                    onClick={() => router.push(`/admin/predictions/${pred.id}`)}
                    className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Disease & Risk with X-Ray Marker */}
                        <div className="flex items-center gap-3 mb-3">
                          <p className="text-sm font-semibold text-foreground">{pred.predicted_disease}</p>
                          {pred.hasXray && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                              📷 X-ray Available
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${
                              pred.risk_level === "high"
                                ? "bg-red-100 text-red-800"
                                : pred.risk_level === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {(pred.risk_level || "unknown").toUpperCase()}
                          </span>
                        </div>

                        {/* Confidence & Codes */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <span>
                            Confidence:{" "}
                            <span className="font-semibold text-foreground">
                              {(pred.confidence_score * 100).toFixed(1)}%
                            </span>
                          </span>
                          <span>ICD-10: {pred.icd10_code || "-"}</span>
                          <span>Patient: {pred.patient_id?.substring(0, 8) || "N/A"}</span>
                        </div>

                        {pred.input_features && (
                          <div className="flex items-center gap-3 text-xs pt-2 border-t border-border/50">
                            {pred.input_features.aqi && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">AQI:</span>
                                <span className="text-foreground">{pred.input_features.aqi.toFixed(0)}</span>
                              </span>
                            )}
                            {pred.input_features.occupational_hazard && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Hazard:</span>
                                <span className="text-foreground text-xs">
                                  {pred.input_features.occupational_hazard.substring(0, 15)}...
                                </span>
                              </span>
                            )}
                            {pred.input_features.years_exposure && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Exp:</span>
                                <span className="text-foreground">{pred.input_features.years_exposure}y</span>
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-2">
                          {pred.created_at ? new Date(pred.created_at).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No predictions found. Run "Seed Tamil Nadu Data" from admin dashboard.
                </p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || loading}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
