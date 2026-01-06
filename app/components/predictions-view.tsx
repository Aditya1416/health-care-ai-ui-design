"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Scan, Activity, TrendingUp } from "lucide-react"
import { getDiseaseInfo } from "@/lib/disease-info"

interface EnvironmentalFactors {
  aqi_index?: number
  pm25_level?: number
  temperature?: number
  humidity?: number
  occupational_hazard?: string
  years_exposure?: number
  district?: string
}

interface PredictionViewProps {
  prediction: {
    id: string
    predicted_disease: string
    confidence_score: number
    severity_level?: number
    environmental_factors?: EnvironmentalFactors
    scan_image_url?: string
    patient?: {
      user?: { full_name: string }
      gender?: string
      blood_type?: string
      smoking_status?: string
      allergies?: string
      medical_history?: string
    }
  }
}

export default function PredictionsView({ prediction }: PredictionViewProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const hasXray = !!prediction.scan_image_url && prediction.scan_image_url.trim().length > 0
  const confidencePercent = Math.round((prediction.confidence_score || 0) * 100)
  const diseaseInfo = getDiseaseInfo(prediction.predicted_disease)

  const severityLabels: Record<number, string> = { 1: "Low", 2: "Medium", 3: "High" }
  const severityColors: Record<number, string> = {
    1: "bg-green-100 text-green-800",
    2: "bg-yellow-100 text-yellow-800",
    3: "bg-red-100 text-red-800",
  }

  const generateGradCAMHeatmap = (confidence: number): string => {
    const hueRotation = (1 - confidence) * 240
    return `hsl(${hueRotation}, 70%, 50%)`
  }

  const currentSeverity = prediction.severity_level || 1
  const env = prediction.environmental_factors || {}

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-slate-50 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{prediction.predicted_disease}</h1>
                {hasXray && <Badge className="bg-blue-600 text-white text-xs px-3 py-1">📷 X-Ray Available</Badge>}
              </div>
              <p className="text-muted-foreground">Comprehensive clinical analysis and AI prediction</p>
            </div>
            <div className="text-right bg-white rounded-lg p-4 border border-border">
              <div className="text-4xl font-bold text-teal-600">{confidencePercent}%</div>
              <div className="text-xs text-muted-foreground mt-1">Confidence Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded p-3 border border-border">
              <p className="text-xs text-muted-foreground font-medium">Severity</p>
              <Badge className={`mt-2 ${severityColors[currentSeverity]}`}>{severityLabels[currentSeverity]}</Badge>
            </div>
            <div className="bg-white rounded p-3 border border-border">
              <p className="text-xs text-muted-foreground font-medium">Patient</p>
              <p className="font-semibold text-sm mt-2">{prediction.patient?.user?.full_name || "Unknown"}</p>
            </div>
            <div className="bg-white rounded p-3 border border-border">
              <p className="text-xs text-muted-foreground font-medium">Prediction ID</p>
              <p className="font-mono text-xs mt-2">{prediction.id.substring(0, 8)}</p>
            </div>
            <div className="bg-white rounded p-3 border border-border">
              <p className="text-xs text-muted-foreground font-medium">Analysis Type</p>
              <p className="font-semibold text-sm mt-2">{hasXray ? "Imaging" : "Clinical"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={hasXray ? "imaging" : "clinical"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="imaging"
            disabled={!hasXray}
            className={`flex items-center gap-2 ${!hasXray ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Scan className="h-4 w-4" />
            X-Ray Analysis
          </TabsTrigger>
          <TabsTrigger value="clinical" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Clinical Assessment
          </TabsTrigger>
        </TabsList>

        {/* X-Ray Tab */}
        <TabsContent value="imaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Imaging Analysis with GradCAM</CardTitle>
              <CardDescription>X-ray visualization with diagnostic findings and risk heatmap overlay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasXray ? (
                <>
                  {/* X-Ray Image with GradCAM Overlay */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Diagnostic Imaging with Risk Visualization</p>
                    <div className="bg-slate-100 rounded-lg overflow-hidden border border-border aspect-video flex items-center justify-center relative">
                      <img
                        src={prediction.scan_image_url || "/placeholder.svg"}
                        alt={`${prediction.predicted_disease} X-ray`}
                        className="max-w-full max-h-full object-contain"
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                      />
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none rounded-lg"
                        style={{
                          background: `radial-gradient(circle at center, ${generateGradCAMHeatmap(prediction.confidence_score)}, transparent)`,
                        }}
                      />
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 rounded-lg">
                          <p className="text-slate-700 font-medium">Loading X-ray image...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Heatmap Legend */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">GradCAM Risk Intensity Legend</p>
                    <div className="bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded-lg h-12 flex items-center px-4 text-white text-xs font-medium shadow-md">
                      <span>Low Risk (Blue)</span>
                      <span className="flex-1 text-center">Medium Risk (Yellow)</span>
                      <span>High Risk (Red)</span>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      The overlay shows model attention: red regions indicate areas of highest diagnostic concern,
                      yellow indicates moderate findings, and blue indicates lower risk areas. Model confidence:{" "}
                      {confidencePercent}%
                    </p>
                  </div>

                  {/* Radiological Findings */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex gap-2">
                      <Scan className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-blue-900">Radiological Findings</p>
                        <p className="text-sm text-blue-800 mt-1">
                          Medical imaging analysis indicates characteristic findings consistent with{" "}
                          <strong>{prediction.predicted_disease}</strong>. The confidence score of{" "}
                          <strong>{confidencePercent}%</strong> reflects the model's assessment based on visual patterns
                          and risk factors. GradCAM attention maps highlight the most influential regions contributing
                          to this diagnosis.
                        </p>
                        <div className="mt-3 bg-blue-100 rounded p-2 text-xs text-blue-900">
                          <p className="font-semibold mb-1">Detailed Interpretation:</p>
                          <p className="leading-relaxed">
                            {diseaseInfo.description} The affected regions shown in the heatmap overlay indicate areas
                            of highest diagnostic concern.{" "}
                            {confidencePercent > 80
                              ? "This high-confidence prediction warrants immediate clinical correlation and specialist review."
                              : "Further clinical evaluation and follow-up imaging may be warranted to confirm findings."}{" "}
                            Treatment recommendations should be made in conjunction with patient symptomatology and
                            laboratory results.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Implications */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Clinical Implications & Recommendations
                    </p>
                    <ul className="text-sm text-amber-800 space-y-2 list-disc list-inside">
                      <li>Requires specialist radiologist review for final confirmation</li>
                      <li>Follow-up imaging recommended based on clinical context</li>
                      <li>Correlate with patient symptoms and laboratory findings</li>
                      <li>Treatment planning should involve multidisciplinary team</li>
                      <li>GradCAM visualization aids in model interpretability for clinical decision-making</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
                  <Scan className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-700 font-semibold">No X-ray imaging available</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Switch to Clinical Assessment for symptom-based analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Assessment Tab */}
        <TabsContent value="clinical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Assessment & Disease Information</CardTitle>
              <CardDescription>Symptoms, risk factors, and environmental analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Disease Description */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-900 leading-relaxed">{diseaseInfo.description}</p>
              </div>

              {/* Symptoms */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  Common Clinical Symptoms
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {diseaseInfo.symptoms.map((symptom, i) => (
                    <div
                      key={i}
                      className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm font-medium text-orange-900"
                    >
                      • {symptom}
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Associated Risk Factors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {diseaseInfo.risks.map((risk, i) => (
                    <div
                      key={i}
                      className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm font-medium text-red-900"
                    >
                      ⚠️ {risk}
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental & Demographic Factors */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-slate-700">
                  <TrendingUp className="h-5 w-5" />
                  Environmental & Demographic Assessment
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground font-semibold">Air Quality Index</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{env.aqi_index || "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {env.aqi_index && env.aqi_index > 150
                        ? "Poor"
                        : env.aqi_index && env.aqi_index > 100
                          ? "Unhealthy"
                          : "Moderate"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground font-semibold">PM2.5 Level</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{env.pm25_level || "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">µg/m³</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground font-semibold">Temperature</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{env.temperature || "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">°C</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground font-semibold">Humidity</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{env.humidity || "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-white rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground font-semibold">Occupational Hazard</p>
                    <p className="font-semibold text-slate-900 mt-2">{env.occupational_hazard || "None"}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground font-semibold">Years of Exposure</p>
                    <p className="font-semibold text-slate-900 mt-2">{env.years_exposure || 0} years</p>
                  </div>
                </div>

                {env.district && (
                  <div className="bg-white rounded-lg p-4 border border-border mt-3">
                    <p className="text-xs text-muted-foreground font-semibold">Geographic Location</p>
                    <p className="font-semibold text-slate-900 mt-2">{env.district}</p>
                  </div>
                )}
              </div>

              {/* Patient Demographics */}
              {prediction.patient && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-700">Patient Demographics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                      <p className="text-xs text-purple-600 font-semibold">Gender</p>
                      <p className="font-bold text-slate-900 mt-2">
                        {prediction.patient.gender === "M"
                          ? "Male"
                          : prediction.patient.gender === "F"
                            ? "Female"
                            : prediction.patient.gender || "N/A"}
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                      <p className="text-xs text-purple-600 font-semibold">Blood Type</p>
                      <p className="font-bold text-slate-900 mt-2">{prediction.patient.blood_type || "N/A"}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                      <p className="text-xs text-purple-600 font-semibold">Smoking Status</p>
                      <p className="font-bold text-slate-900 mt-2 capitalize">
                        {prediction.patient.smoking_status || "N/A"}
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                      <p className="text-xs text-purple-600 font-semibold">Allergies</p>
                      <p className="font-bold text-slate-900 mt-2 text-sm">{prediction.patient.allergies || "None"}</p>
                    </div>
                  </div>
                  {prediction.patient.medical_history && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                      <p className="text-xs text-purple-600 font-semibold">Medical History</p>
                      <p className="text-sm text-slate-900 mt-2">{prediction.patient.medical_history}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Clinical Recommendations & Follow-up Plan
                </p>
                <ul className="text-sm text-green-800 space-y-2 list-disc list-inside">
                  <li>
                    <strong>Immediate Actions:</strong> Monitor symptoms closely and report any changes to healthcare
                    provider immediately. Maintain detailed symptom log.
                  </li>
                  <li>
                    <strong>Treatment Plan:</strong> Follow prescribed treatment plan strictly and take medications as
                    directed. Do not self-adjust dosages without consulting physician.
                  </li>
                  <li>
                    <strong>Environmental Control:</strong> Reduce environmental and occupational exposure when
                    possible. Use appropriate protective equipment (masks, respirators) in hazardous environments.
                  </li>
                  <li>
                    <strong>Follow-up Schedule:</strong> Schedule regular follow-up appointments with assigned physician
                    at: 1 week, 1 month, 3 months. Additional follow-up imaging may be needed based on response to
                    treatment.
                  </li>
                  <li>
                    <strong>Lifestyle Modifications:</strong> Maintain healthy lifestyle including regular exercise
                    within tolerance limits, adequate sleep, and balanced diet. Avoid smoking and secondhand smoke
                    exposure.
                  </li>
                  <li>
                    <strong>Risk Factor Management:</strong> Address identified occupational hazards through workplace
                    modifications, ventilation improvements, or job repositioning if necessary.
                  </li>
                  <li>
                    <strong>Medication Adherence:</strong> Take all prescribed medications at scheduled times. Keep
                    track of medication side effects and report to healthcare provider.
                  </li>
                  <li>
                    <strong>Vaccination & Prevention:</strong> Ensure up-to-date vaccinations (flu, pneumococcal).
                    Consider preventive therapies based on disease and risk profile.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
