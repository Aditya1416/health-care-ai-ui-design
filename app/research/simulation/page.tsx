"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createBrowserClient } from "@/lib/supabase/client"
import { AlertCircle, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ReferenceImage {
  id: string
  disease_name: string
  image_name: string
  image_url: string
  created_at: string
}

interface SimulationState {
  selectedSampleId: string | null
  selectedSampleDisease: string | null
  referenceMatches: ReferenceImage[]
  similarityScores: { disease: string; score: number }[]
  featureImportance: { feature: string; importance: number }[]
  explanationText: string
  reportGenerated: boolean
}

export default function SimulationPage() {
  const supabase = createBrowserClient()
  const [simulationState, setSimulationState] = useState<SimulationState>({
    selectedSampleId: null,
    selectedSampleDisease: null,
    referenceMatches: [],
    similarityScores: [],
    featureImportance: [],
    explanationText: "",
    reportGenerated: false,
  })

  const { data: referenceImages = [], isLoading: imagesLoading } = useQuery({
    queryKey: ["referenceImages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_reference_images")
        .select("id, disease_name, image_name, image_url, created_at")
        .limit(50)

      if (error) throw error
      return data as ReferenceImage[]
    },
  })

  const imagesByDisease = referenceImages.reduce(
    (acc, img) => {
      if (!acc[img.disease_name]) {
        acc[img.disease_name] = []
      }
      acc[img.disease_name].push(img)
      return acc
    },
    {} as Record<string, ReferenceImage[]>,
  )

  function handleSelectSample(image: ReferenceImage) {
    const diseaseMatches = imagesByDisease[image.disease_name] || []
    const topMatches = diseaseMatches.slice(0, 3)

    const scores = topMatches.map((_, idx) => ({
      disease: image.disease_name,
      score: 95 - idx * 5, // Deterministic: 95%, 90%, 85%
    }))

    const features = [
      { feature: "Tissue Density", importance: 92 },
      { feature: "Edge Sharpness", importance: 87 },
      { feature: "Opacity Gradient", importance: 78 },
      { feature: "Region Distribution", importance: 71 },
      { feature: "Artifact Detection", importance: 64 },
    ]

    const explanationText = `This analysis compares your selected image with reference cases of ${image.disease_name}. The simulation shows 95% similarity with the first reference image based on feature matching. Key matching features include tissue density patterns, edge characteristics, and regional distribution. This is a simulated analysis for educational purposes only.`

    setSimulationState({
      selectedSampleId: image.id,
      selectedSampleDisease: image.disease_name,
      referenceMatches: topMatches,
      similarityScores: scores,
      featureImportance: features,
      explanationText,
      reportGenerated: false,
    })
  }

  function generateReport() {
    const reportContent = `
MEDICAL AI SIMULATION REPORT
=====================================
Generated: ${new Date().toLocaleString()}

DISCLAIMER:
This system does not provide medical diagnosis. Outputs are generated for academic demonstration only.
This report is for research and educational purposes only. Always consult qualified healthcare professionals.

PATIENT CASE:
Disease: ${simulationState.selectedSampleDisease}
Sample: ${referenceImages.find((img) => img.id === simulationState.selectedSampleId)?.image_name}

REFERENCE COMPARISON:
${simulationState.referenceMatches.map((img, idx) => `${idx + 1}. ${img.image_name} (${simulationState.similarityScores[idx]?.score}% match)`).join("\n")}

SIMILARITY ANALYSIS:
${simulationState.similarityScores.map((s) => `${s.disease}: ${s.score}%`).join("\n")}

FEATURE IMPORTANCE:
${simulationState.featureImportance.map((f) => `${f.feature}: ${f.importance}%`).join("\n")}

AI EXPLANATION:
${simulationState.explanationText}

IMPORTANT NOTICE:
- This analysis is SIMULATED and for EDUCATIONAL purposes only
- No real machine learning inference was performed
- Results are deterministic demonstrations only
- NOT for clinical diagnosis or medical decision-making
- Always consult licensed healthcare professionals
    `

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent))
    element.setAttribute("download", `medical_simulation_report_${Date.now()}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    setSimulationState((prev) => ({ ...prev, reportGenerated: true }))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Medical AI Simulation</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Educational platform for medical image analysis (Simulated - Educational Demo Only)
              </p>
            </div>
            <Link href="/research" className="text-sm text-primary hover:underline">
              ← Back to Research
            </Link>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="border-b border-border bg-destructive/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-semibold">Simulated AI Analysis - Educational Only</p>
              <p className="text-muted-foreground mt-1">
                This system does not provide medical diagnosis. Outputs are generated for academic demonstration only.
                Always consult qualified healthcare professionals for any medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="samples" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="samples">Samples</TabsTrigger>
            <TabsTrigger value="comparison" disabled={!simulationState.selectedSampleId}>
              Comparison
            </TabsTrigger>
            <TabsTrigger value="explanation" disabled={!simulationState.selectedSampleId}>
              AI Explanation
            </TabsTrigger>
            <TabsTrigger value="report" disabled={!simulationState.selectedSampleId}>
              Report
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Sample Selection */}
          <TabsContent value="samples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sample Patient Images</CardTitle>
                <CardDescription>Select a reference image to analyze</CardDescription>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : Object.keys(imagesByDisease).length === 0 ? (
                  <p className="text-muted-foreground">No reference images found.</p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(imagesByDisease).map(([disease, images]) => (
                      <div key={disease}>
                        <h3 className="font-semibold text-foreground mb-3">{disease}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {images.map((img) => (
                            <button
                              key={img.id}
                              onClick={() => handleSelectSample(img)}
                              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                simulationState.selectedSampleId === img.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="aspect-square bg-muted relative">
                                <Image
                                  src={img.image_url || "/placeholder.svg"}
                                  alt={img.image_name}
                                  fill
                                  className="object-contain p-2"
                                />
                              </div>
                              <div className="p-2 bg-card border-t border-border">
                                <p className="text-xs font-medium text-foreground truncate">{img.image_name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Comparison */}
          <TabsContent value="comparison" className="space-y-6">
            {simulationState.selectedSampleId && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Side-by-Side Comparison</CardTitle>
                    <CardDescription>Patient image vs. reference matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Patient Image */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">Your Image</p>
                        <div className="aspect-square bg-muted rounded-lg relative overflow-hidden">
                          <Image
                            src={
                              referenceImages.find((img) => img.id === simulationState.selectedSampleId)?.image_url ||
                              "/placeholder.svg"
                            }
                            alt="Patient image"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>

                      {/* Reference Matches */}
                      {simulationState.referenceMatches.map((refImg, idx) => (
                        <div key={refImg.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">Reference {idx + 1}</p>
                            <span className="text-xs font-mono text-primary">
                              {simulationState.similarityScores[idx]?.score}%
                            </span>
                          </div>
                          <div className="aspect-square bg-muted rounded-lg relative overflow-hidden border-2 border-primary/50">
                            <Image
                              src={refImg.image_url || "/placeholder.svg"}
                              alt={refImg.image_name}
                              fill
                              className="object-contain"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{refImg.image_name}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Similarity Scores</CardTitle>
                    <CardDescription>Comparison metrics (Simulated)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {simulationState.similarityScores.map(({ disease, score }, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-foreground">
                              {disease} - Reference {idx + 1}
                            </span>
                            <span className="font-mono font-semibold text-primary">{score}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-chart-1 transition-all"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* TAB 3: AI Explanation */}
          <TabsContent value="explanation" className="space-y-6">
            {simulationState.selectedSampleId && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Importance Analysis</CardTitle>
                    <CardDescription>Which features contributed to the analysis (Simulated)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {simulationState.featureImportance.map(({ feature, importance }) => (
                        <div key={feature}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-foreground">{feature}</span>
                            <span className="font-mono font-semibold text-primary">{importance}%</span>
                          </div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-chart-1 to-chart-2"
                              style={{ width: `${importance}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Clinical Reasoning</CardTitle>
                    <CardDescription>Why this analysis was generated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <p>{simulationState.explanationText}</p>
                      <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground font-semibold">
                          ⚠️ EDUCATIONAL DISCLAIMER: This explanation is simulated and does not represent actual medical
                          analysis. Always consult healthcare professionals.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* TAB 4: Report */}
          <TabsContent value="report" className="space-y-6">
            {simulationState.selectedSampleId && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Report</CardTitle>
                    <CardDescription>Download comprehensive analysis report</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <p className="font-semibold text-foreground">Report Summary:</p>
                      <p className="text-muted-foreground">• Disease: {simulationState.selectedSampleDisease}</p>
                      <p className="text-muted-foreground">
                        • Top Similarity Score: {simulationState.similarityScores[0]?.score}%
                      </p>
                      <p className="text-muted-foreground">
                        • Reference Matches: {simulationState.referenceMatches.length}
                      </p>
                      <p className="text-muted-foreground">• Generated: {new Date().toLocaleString()}</p>
                    </div>

                    <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-destructive mb-2">IMPORTANT DISCLAIMER</p>
                      <p className="text-xs text-foreground">
                        This report contains SIMULATED analysis data for educational purposes only. It does not
                        constitute medical diagnosis or recommendation. Always consult qualified healthcare
                        professionals.
                      </p>
                    </div>

                    <Button onClick={generateReport} className="w-full" disabled={simulationState.reportGenerated}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Report as Text File
                    </Button>

                    {simulationState.reportGenerated && (
                      <p className="text-sm text-chart-2 text-center">✓ Report downloaded successfully</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
