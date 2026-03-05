"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  fetchFromColab, 
  getPatientPredictions, 
  checkColabHealth,
  API_BASE_URL 
} from "@/lib/backend/api"
import { 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  User, 
  Activity, 
  FileImage, 
  Brain,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Download
} from "lucide-react"

interface Patient {
  id: string | number
  name: string
  age?: number
  gender?: string
  district?: string
  medical_history?: string[]
  [key: string]: any
}

interface Prediction {
  id: string | number
  disease: string
  confidence: number
  risk_level?: string
  icd10_code?: string
  snomed_code?: string
  created_at?: string
  heatmap_url?: string
  scan_url?: string
  features?: Record<string, number>
  [key: string]: any
}

export default function PatientAnalysisPage() {
  const router = useRouter()
  
  // Connection state
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isCheckingConnection, setIsCheckingConnection] = useState(true)
  
  // Data state
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  
  // Loading states
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const [runningAnalysis, setRunningAnalysis] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  // Check Colab connection on mount
  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    setIsCheckingConnection(true)
    setError(null)
    try {
      const healthy = await checkColabHealth()
      setIsConnected(healthy)
      if (healthy) {
        fetchPatients()
      }
    } catch (err) {
      setIsConnected(false)
      setError("Failed to connect to Colab backend")
    } finally {
      setIsCheckingConnection(false)
    }
  }

  async function fetchPatients() {
    setLoadingPatients(true)
    setError(null)
    try {
      const data = await fetchFromColab<Patient[]>("/patients")
      if (data) {
        setPatients(data)
      } else {
        // Try alternate endpoint format
        const altData = await fetchFromColab<{ patients: Patient[] }>("/patients/")
        if (altData?.patients) {
          setPatients(altData.patients)
        } else {
          setError("No patients found or endpoint not available")
        }
      }
    } catch (err) {
      setError("Failed to fetch patients from Colab")
    } finally {
      setLoadingPatients(false)
    }
  }

  async function handleSelectPatient(patient: Patient) {
    setSelectedPatient(patient)
    setSelectedPrediction(null)
    setPredictions([])
    setLoadingPredictions(true)
    setError(null)
    
    try {
      const data = await getPatientPredictions(String(patient.id))
      if (data) {
        // Handle different response formats
        const predList = Array.isArray(data) ? data : data.predictions || [data]
        setPredictions(predList)
        if (predList.length > 0) {
          setSelectedPrediction(predList[0])
        }
      }
    } catch (err) {
      setError("Failed to fetch predictions for this patient")
    } finally {
      setLoadingPredictions(false)
    }
  }

  async function runAnalysis() {
    if (!selectedPatient) return
    
    setRunningAnalysis(true)
    setError(null)
    
    try {
      const result = await fetchFromColab<any>(`/patients/${selectedPatient.id}/analyze`, {
        method: "POST"
      })
      
      if (result) {
        // Refresh predictions after analysis
        await handleSelectPatient(selectedPatient)
      }
    } catch (err) {
      setError("Failed to run analysis")
    } finally {
      setRunningAnalysis(false)
    }
  }

  function getRiskColor(risk: string | undefined) {
    switch (risk?.toLowerCase()) {
      case "high": return "bg-red-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  function getConfidenceColor(confidence: number) {
    if (confidence >= 0.8) return "text-red-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-green-600"
  }

  // Connection check screen
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Connecting to Colab backend...</p>
              <p className="text-xs text-muted-foreground font-mono">{API_BASE_URL}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not connected screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Connection Failed
            </CardTitle>
            <CardDescription>
              Could not connect to Colab backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-mono break-all">{API_BASE_URL}</p>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Make sure your Colab notebook is running with:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>ngrok tunnel active</li>
                <li>FastAPI server running</li>
                <li>CORS enabled</li>
              </ul>
            </div>
            <Button onClick={checkConnection} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin")} className="w-full">
              Back to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Patient Analysis</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Select a patient to view predictions, scans, and heatmaps
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Colab Connected</span>
              </div>
              <Button variant="outline" size="sm" onClick={checkConnection}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Patient List Sidebar */}
          <div className="lg:col-span-3">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Patients</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchPatients}
                    disabled={loadingPatients}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingPatients ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingPatients ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : patients.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No patients found
                  </div>
                ) : (
                  <div className="max-h-[60vh] overflow-y-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => handleSelectPatient(patient)}
                        className={`w-full px-4 py-3 text-left border-b border-border hover:bg-muted/50 transition-colors flex items-center justify-between ${
                          selectedPatient?.id === patient.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {patient.name || `Patient ${patient.id}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {patient.age && `${patient.age}y`}
                              {patient.gender && ` • ${patient.gender}`}
                              {patient.district && ` • ${patient.district}`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {!selectedPatient ? (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a Patient</p>
                  <p className="text-sm">Choose a patient from the list to view their analysis</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Patient Info Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {selectedPatient.name || `Patient ${selectedPatient.id}`}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            ID: {selectedPatient.id}
                            {selectedPatient.age && ` • Age: ${selectedPatient.age}`}
                            {selectedPatient.gender && ` • ${selectedPatient.gender}`}
                          </CardDescription>
                        </div>
                      </div>
                      <Button 
                        onClick={runAnalysis} 
                        disabled={runningAnalysis}
                        className="gap-2"
                      >
                        {runningAnalysis ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            Run Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {selectedPatient.district && (
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">District</p>
                          <p className="font-medium">{selectedPatient.district}</p>
                        </div>
                        {selectedPatient.blood_type && (
                          <div>
                            <p className="text-muted-foreground">Blood Type</p>
                            <p className="font-medium">{selectedPatient.blood_type}</p>
                          </div>
                        )}
                        {selectedPatient.occupation && (
                          <div>
                            <p className="text-muted-foreground">Occupation</p>
                            <p className="font-medium">{selectedPatient.occupation}</p>
                          </div>
                        )}
                        {selectedPatient.smoking_status && (
                          <div>
                            <p className="text-muted-foreground">Smoking Status</p>
                            <p className="font-medium">{selectedPatient.smoking_status}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Loading Predictions */}
                {loadingPredictions ? (
                  <Card className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground mt-2">Loading predictions...</p>
                    </div>
                  </Card>
                ) : predictions.length === 0 ? (
                  <Card className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No Predictions Found</p>
                      <p className="text-sm mb-4">Run an analysis to generate predictions</p>
                      <Button onClick={runAnalysis} disabled={runningAnalysis}>
                        <Brain className="h-4 w-4 mr-2" />
                        Run Analysis
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Tabs defaultValue="predictions" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="predictions" className="gap-2">
                        <Activity className="h-4 w-4" />
                        Predictions
                      </TabsTrigger>
                      <TabsTrigger value="scans" className="gap-2">
                        <FileImage className="h-4 w-4" />
                        Scans
                      </TabsTrigger>
                      <TabsTrigger value="heatmap" className="gap-2">
                        <Brain className="h-4 w-4" />
                        Heatmap
                      </TabsTrigger>
                      <TabsTrigger value="features" className="gap-2">
                        <Activity className="h-4 w-4" />
                        Features
                      </TabsTrigger>
                    </TabsList>

                    {/* Predictions Tab */}
                    <TabsContent value="predictions" className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {predictions.map((pred, idx) => (
                          <Card 
                            key={pred.id || idx}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedPrediction?.id === pred.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedPrediction(pred)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{pred.disease || "Unknown"}</CardTitle>
                                <Badge className={getRiskColor(pred.risk_level)}>
                                  {pred.risk_level || "N/A"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Confidence</span>
                                    <span className={`font-semibold ${getConfidenceColor(pred.confidence)}`}>
                                      {typeof pred.confidence === "number" 
                                        ? `${Math.round(pred.confidence * 100)}%`
                                        : pred.confidence}
                                    </span>
                                  </div>
                                  <Progress 
                                    value={typeof pred.confidence === "number" ? pred.confidence * 100 : 50} 
                                    className="h-2"
                                  />
                                </div>
                                <div className="flex gap-2 text-xs">
                                  {pred.icd10_code && (
                                    <span className="px-2 py-1 bg-muted rounded font-mono">
                                      ICD-10: {pred.icd10_code}
                                    </span>
                                  )}
                                  {pred.snomed_code && (
                                    <span className="px-2 py-1 bg-muted rounded font-mono">
                                      SNOMED: {pred.snomed_code}
                                    </span>
                                  )}
                                </div>
                                {pred.created_at && (
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(pred.created_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Scans Tab */}
                    <TabsContent value="scans">
                      <Card>
                        <CardHeader>
                          <CardTitle>Medical Scans</CardTitle>
                          <CardDescription>X-rays and imaging for this patient</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {selectedPrediction?.scan_url ? (
                            <div className="space-y-4">
                              <div className="relative aspect-square max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
                                <Image
                                  src={selectedPrediction.scan_url}
                                  alt="Medical scan"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div className="flex justify-center">
                                <Button variant="outline" className="gap-2">
                                  <Download className="h-4 w-4" />
                                  Download Scan
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                              <div className="text-center">
                                <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No scan image available for this prediction</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Heatmap Tab */}
                    <TabsContent value="heatmap">
                      <Card>
                        <CardHeader>
                          <CardTitle>Heatmap Analysis</CardTitle>
                          <CardDescription>
                            AI-highlighted regions of interest
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {selectedPrediction?.heatmap_url ? (
                            <div className="space-y-4">
                              <div className="relative aspect-square max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
                                <Image
                                  src={selectedPrediction.heatmap_url}
                                  alt="Heatmap analysis"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                <div className="p-3 bg-red-500/10 rounded-lg">
                                  <div className="w-4 h-4 bg-red-500 rounded mx-auto mb-1" />
                                  <p className="text-muted-foreground">High Attention</p>
                                </div>
                                <div className="p-3 bg-yellow-500/10 rounded-lg">
                                  <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-1" />
                                  <p className="text-muted-foreground">Medium Attention</p>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                  <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1" />
                                  <p className="text-muted-foreground">Low Attention</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                              <div className="text-center">
                                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No heatmap available for this prediction</p>
                                <p className="text-xs mt-1">Run analysis to generate heatmap</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Features Tab */}
                    <TabsContent value="features">
                      <Card>
                        <CardHeader>
                          <CardTitle>Feature Importance</CardTitle>
                          <CardDescription>
                            Key factors contributing to the prediction
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {selectedPrediction?.features ? (
                            <div className="space-y-4">
                              {Object.entries(selectedPrediction.features).map(([feature, importance]) => (
                                <div key={feature}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-foreground capitalize">
                                      {feature.replace(/_/g, " ")}
                                    </span>
                                    <span className="font-semibold text-primary">
                                      {typeof importance === "number" 
                                        ? `${Math.round(importance * 100)}%`
                                        : importance}
                                    </span>
                                  </div>
                                  <Progress 
                                    value={typeof importance === "number" ? importance * 100 : 50} 
                                    className="h-2"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                              <div className="text-center">
                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No feature data available</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
