"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { createBrowserClient } from "@/lib/supabase/client"
import { AlertCircle, Upload, Loader2, Download } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PredictionResult {
  disease: string
  confidence: number
  icd10: string
  snomed: string
  riskCategory: string
  heatmapRegions: Array<{
    x: number
    y: number
    intensity: number
    label: string
  }>
  featureImportance: Array<{
    feature: string
    importance: number
  }>
  matchingReferences: Array<{
    id: string
    name: string
    similarity: number
    url: string
  }>
  clinicalRecommendation: string
}

export default function UploadPredictPage() {
  const supabase = createBrowserClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null)
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [referenceImages, setReferenceImages] = useState<any[]>([])

  const { data: availableReferences = [] } = useQuery({
    queryKey: ["referenceImages", selectedDisease],
    queryFn: async () => {
      if (!selectedDisease) return []
      const { data } = await supabase
        .from("medical_reference_images")
        .select("id, disease_name, image_name, image_url")
        .ilike("disease_name", `%${selectedDisease}%`)
        .limit(10)
      return data || []
    },
    enabled: !!selectedDisease,
  })

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setPredictionResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  function generateSimulatedPrediction() {
    if (!uploadedImage || !selectedDisease) return

    setIsAnalyzing(true)

    // Simulate processing time
    setTimeout(() => {
      const diseases = {
        COPD: { icd10: "J44.9", snomed: "13645005", confidence: 0.82 },
        Pneumonia: { icd10: "J18.9", snomed: "233604007", confidence: 0.88 },
        Asthma: { icd10: "J45.9", snomed: "195967001", confidence: 0.75 },
        "Allergic Rhinitis": { icd10: "J30.9", snomed: "61582004", confidence: 0.71 },
        "Type 2 Diabetes": { icd10: "E11.9", snomed: "44054006", confidence: 0.79 },
        Hypertension: { icd10: "I10", snomed: "59621000", confidence: 0.85 },
      }

      const diseaseInfo = diseases[selectedDisease as keyof typeof diseases] || {
        icd10: "J99.9",
        snomed: "000000",
        confidence: 0.75,
      }

      const heatmapRegions = [
        { x: 120, y: 150, intensity: 95, label: "Primary pathology" },
        { x: 280, y: 200, intensity: 78, label: "Secondary involvement" },
        { x: 200, y: 320, intensity: 62, label: "Marginal changes" },
      ]

      const prediction: PredictionResult = {
        disease: selectedDisease,
        confidence: diseaseInfo.confidence,
        icd10: diseaseInfo.icd10,
        snomed: diseaseInfo.snomed,
        riskCategory: diseaseInfo.confidence > 0.8 ? "High" : diseaseInfo.confidence > 0.65 ? "Medium" : "Low",
        heatmapRegions,
        featureImportance: [
          { feature: "Tissue Density Patterns", importance: 0.92 },
          { feature: "Edge Characteristics", importance: 0.87 },
          { feature: "Regional Distribution", importance: 0.78 },
          { feature: "Opacity Gradients", importance: 0.71 },
          { feature: "Artifact Detection", importance: 0.64 },
        ],
        matchingReferences: availableReferences.slice(0, 3).map((ref, idx) => ({
          id: ref.id,
          name: ref.image_name,
          similarity: 95 - idx * 5,
          url: ref.image_url,
        })),
        clinicalRecommendation: `Patient presents with imaging findings consistent with ${selectedDisease}. Confidence level: ${Math.round(diseaseInfo.confidence * 100)}%. Recommend clinical correlation with patient history and physical examination. Follow-up imaging may be required based on clinical response.`,
      }

      setPredictionResult(prediction)
      setIsAnalyzing(false)
    }, 2000)
  }

  function downloadFullReport() {
    if (!predictionResult) return

    const reportText = `
COMPREHENSIVE MEDICAL AI ANALYSIS REPORT
================================================
Generated: ${new Date().toLocaleString()}
System Version: v2.1.0-TN-Demographic

MEDICAL DISCLAIMER:
This AI analysis is simulated for educational demonstration. It does not constitute medical diagnosis.
Always consult qualified healthcare professionals for medical decisions.

PATIENT IMAGING ANALYSIS:
================================
Disease Predicted: ${predictionResult.disease}
Confidence Score: ${Math.round(predictionResult.confidence * 100)}%
Risk Category: ${predictionResult.riskCategory}

MEDICAL CODES:
ICD-10 Code: ${predictionResult.icd10}
SNOMED CT Code: ${predictionResult.snomed}

HEATMAP ANALYSIS (Influential Regions):
${predictionResult.heatmapRegions.map((r) => `- ${r.label}: (${r.x}, ${r.y}) - Intensity: ${r.intensity}%`).join("\n")}

FEATURE IMPORTANCE ANALYSIS:
${predictionResult.featureImportance.map((f) => `- ${f.feature}: ${Math.round(f.importance * 100)}%`).join("\n")}

REFERENCE IMAGE COMPARISON:
${predictionResult.matchingReferences.map((r, idx) => `${idx + 1}. ${r.name} - ${r.similarity}% similarity`).join("\n")}

CLINICAL INTERPRETATION:
${predictionResult.clinicalRecommendation}

IMPORTANT DISCLAIMERS:
- This analysis is SIMULATED for academic purposes only
- Not for clinical diagnosis or medical decision-making
- All results are deterministic demonstrations
- Consult licensed healthcare professionals immediately
- This system cannot replace professional medical judgment

Report Generated: ${new Date().toISOString()}
    `

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportText))
    element.setAttribute("download", `ai_analysis_report_${selectedDisease}_${Date.now()}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-foreground">Upload & Predict</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload medical imaging and get AI-powered analysis with reference comparison
          </p>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="border-b border-border bg-destructive/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">Simulated Analysis - Educational Only</p>
              <p className="text-muted-foreground mt-1">
                This system does not provide medical diagnosis. Results are for research and education. Always consult
                qualified healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="prediction" disabled={!predictionResult}>
              Prediction Results
            </TabsTrigger>
            <TabsTrigger value="heatmap" disabled={!predictionResult}>
              Heatmap Analysis
            </TabsTrigger>
            <TabsTrigger value="report" disabled={!predictionResult}>
              Report
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Upload */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Upload Medical Image</CardTitle>
                <CardDescription>Select a chest X-ray or medical imaging file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Click to upload image</span>
                  <span className="text-xs text-muted-foreground">or drag and drop</span>
                </button>

                {uploadedImage && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Uploaded Image Preview:</p>
                      <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Uploaded medical image"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Select Disease Category</label>
                      <select
                        value={selectedDisease || ""}
                        onChange={(e) => setSelectedDisease(e.target.value || null)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      >
                        <option value="">-- Select a disease --</option>
                        <option value="COPD">COPD (Chronic Obstructive Pulmonary Disease)</option>
                        <option value="Pneumonia">Pneumonia</option>
                        <option value="Asthma">Asthma</option>
                        <option value="Allergic Rhinitis">Allergic Rhinitis</option>
                        <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                        <option value="Hypertension">Hypertension</option>
                      </select>
                    </div>

                    {selectedDisease && availableReferences.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Reference Images for {selectedDisease}:
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          {availableReferences.slice(0, 3).map((ref) => (
                            <div
                              key={ref.id}
                              className="relative h-32 bg-muted rounded-lg overflow-hidden border border-border"
                            >
                              <Image
                                src={ref.image_url || "/placeholder.svg"}
                                alt={ref.image_name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={generateSimulatedPrediction}
                      disabled={!uploadedImage || !selectedDisease || isAnalyzing}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Generate Prediction"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Prediction Results */}
          <TabsContent value="prediction" className="space-y-6">
            {predictionResult && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>AI Prediction Results</CardTitle>
                    <CardDescription>Confidence scores and medical classification</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Predicted Disease</p>
                        <p className="text-2xl font-bold text-foreground">{predictionResult.disease}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Confidence Score</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-primary">
                            {Math.round(predictionResult.confidence * 100)}%
                          </p>
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              predictionResult.riskCategory === "High"
                                ? "bg-destructive/10 text-destructive"
                                : predictionResult.riskCategory === "Medium"
                                  ? "bg-yellow-500/10 text-yellow-700"
                                  : "bg-green-500/10 text-green-700"
                            }`}
                          >
                            {predictionResult.riskCategory} Risk
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">ICD-10 Code</p>
                        <p className="font-mono text-sm font-semibold text-foreground">{predictionResult.icd10}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">SNOMED CT Code</p>
                        <p className="font-mono text-sm font-semibold text-foreground">{predictionResult.snomed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Importance Analysis</CardTitle>
                    <CardDescription>Key features driving the prediction</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {predictionResult.featureImportance.map(({ feature, importance }) => (
                      <div key={feature}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground">{feature}</span>
                          <span className="font-semibold text-primary">{Math.round(importance * 100)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-chart-1"
                            style={{ width: `${importance * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reference Image Matches</CardTitle>
                    <CardDescription>Similar cases from reference database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {predictionResult.matchingReferences.map((ref, idx) => (
                        <div key={ref.id} className="space-y-2">
                          <div className="relative h-40 bg-muted rounded-lg overflow-hidden border border-border">
                            <Image src={ref.url || "/placeholder.svg"} alt={ref.name} fill className="object-contain" />
                          </div>
                          <p className="text-xs text-foreground">{ref.name}</p>
                          <p className="text-sm font-semibold text-primary">{ref.similarity}% Match</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* TAB 3: Heatmap */}
          <TabsContent value="heatmap" className="space-y-6">
            {predictionResult && uploadedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Heatmap Visualization - Influential Regions</CardTitle>
                  <CardDescription>Areas of pathology highlighted on imaging</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden border border-border">
                    <Image
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Patient image with heatmap"
                      fill
                      className="object-contain"
                    />
                    <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                      {predictionResult.heatmapRegions.map((region, idx) => (
                        <g key={idx}>
                          <rect
                            x={region.x - 40}
                            y={region.y - 40}
                            width="80"
                            height="80"
                            fill={`rgba(255, ${100 - region.intensity}, 0, ${region.intensity / 200})`}
                            rx="8"
                          />
                          <circle
                            cx={region.x}
                            cy={region.y}
                            r="40"
                            fill="none"
                            stroke={`rgba(255, ${100 - region.intensity}, 0, ${region.intensity / 150})`}
                            strokeWidth="2"
                          />
                          <text
                            x={region.x}
                            y={region.y + 50}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontWeight="bold"
                            style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                          >
                            {region.intensity}%
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold text-foreground">Detected Pathological Regions:</p>
                    {predictionResult.heatmapRegions.map((region, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-lg border border-border">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div
                              className="w-12 h-12 rounded-lg"
                              style={{
                                background: `linear-gradient(135deg, rgba(255, ${100 - region.intensity}, 0, 0.3), rgba(255, ${100 - region.intensity}, 0, 0.8))`,
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{region.label}</p>
                            <p className="text-xs text-muted-foreground">
                              Location: ({region.x}, {region.y}) | Intensity: {region.intensity}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 4: Report */}
          <TabsContent value="report" className="space-y-6">
            {predictionResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Generate & Download Full Report</CardTitle>
                  <CardDescription>Comprehensive diagnosis report with all details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <p className="font-semibold text-foreground">Report Summary:</p>
                    <p className="text-muted-foreground">• Disease: {predictionResult.disease}</p>
                    <p className="text-muted-foreground">
                      • Confidence: {Math.round(predictionResult.confidence * 100)}%
                    </p>
                    <p className="text-muted-foreground">• Risk Category: {predictionResult.riskCategory}</p>
                    <p className="text-muted-foreground">
                      • Medical Codes: ICD-10 {predictionResult.icd10} / SNOMED {predictionResult.snomed}
                    </p>
                    <p className="text-muted-foreground">
                      • Heatmap Regions: {predictionResult.heatmapRegions.length} identified
                    </p>
                  </div>

                  <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-destructive mb-2">CRITICAL DISCLAIMER</p>
                    <p className="text-xs text-foreground">
                      This report contains SIMULATED analysis for educational purposes only. It does not constitute
                      medical diagnosis. Always consult qualified healthcare professionals before making any medical
                      decisions.
                    </p>
                  </div>

                  <Button onClick={downloadFullReport} className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Analysis Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
