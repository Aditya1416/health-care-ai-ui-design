'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Loader2, Send } from 'lucide-react'
import { getPatients, getPatientDetails, getPatientImages, askChatbot } from '@/lib/backend/api'

interface Patient {
  patient_id: string
  age: number
  location: string
  risk_score: number
}

interface Prediction {
  disease: string
  probability: number
  gradcam_heatmap: string
  reference_image: string
  similarity_score?: number
  affected_areas?: string[]
}

interface PatientData {
  patient_id: string
  age: number
  location: string
  family_history: string[]
  risk_score: number
  predictions: Prediction[]
}

export default function PatientAnalysisPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [patientImages, setPatientImages] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingChat, setSendingChat] = useState(false)
  const [activeTab, setActiveTab] = useState('predictions')

  // Fetch patients on load
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getPatients()
        if (data) {
          setPatients(data)
        } else {
          setError('Failed to fetch patients from backend')
        }
      } catch (err) {
        setError('Error fetching patients')
      } finally {
        setLoading(false)
      }
    }
    loadPatients()
  }, [])

  // Load patient details and images when selected
  const handleSelectPatient = async (patientId: string) => {
    setSelectedPatient(patientId)
    setLoading(true)
    setError(null)
    setChatMessages([])
    try {
      const [details, images] = await Promise.all([
        getPatientDetails(patientId),
        getPatientImages(patientId),
      ])

      if (details && images) {
        setPatientData(details)
        setPatientImages(images)
      } else {
        setError('Failed to load patient data')
      }
    } catch (err) {
      setError('Error loading patient data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedPatient) return

    const userMessage = chatInput
    setChatInput('')
    setSendingChat(true)

    // Add user message to chat
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await askChatbot(selectedPatient, userMessage)
      if (response) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: response.response }])
      } else {
        setChatMessages((prev) => [...prev, { role: 'error', content: 'Failed to get response' }])
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: 'error', content: 'Error communicating with chatbot' }])
    } finally {
      setSendingChat(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600'
    if (score >= 0.5) return 'text-orange-600'
    return 'text-green-600'
  }

  const getDiseaseSeverity = (prob: number) => {
    if (prob >= 0.7) return 'High Risk'
    if (prob >= 0.5) return 'Medium Risk'
    return 'Low Risk'
  }

  const getDiseaseSeverityColor = (prob: number) => {
    if (prob >= 0.7) return 'bg-red-100 text-red-800'
    if (prob >= 0.5) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Patient X-ray Analysis</h1>
        <p className="text-muted-foreground mb-8">Compare patient X-rays with reference disease patterns using AI analysis</p>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patients</CardTitle>
                <CardDescription>{patients.length} patients available</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && !selectedPatient ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.patient_id}
                        onClick={() => handleSelectPatient(patient.patient_id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedPatient === patient.patient_id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary hover:bg-accent'
                        }`}
                      >
                        <p className="font-medium">{patient.patient_id}</p>
                        <p className="text-xs opacity-75">Age: {patient.age}</p>
                        <p className="text-xs opacity-75">Risk: {(patient.risk_score * 100).toFixed(0)}%</p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedPatient && patientData ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="predictions">AI Analysis</TabsTrigger>
                  <TabsTrigger value="xray">X-ray Comparison</TabsTrigger>
                  <TabsTrigger value="chat">Clinical Chat</TabsTrigger>
                </TabsList>

                {/* AI Analysis Tab */}
                <TabsContent value="predictions" className="space-y-6">
                  {/* Patient Info Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Patient ID</p>
                          <p className="font-semibold">{patientData.patient_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="font-semibold">{patientData.age} years</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-semibold">{patientData.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Risk</p>
                          <p className={`font-semibold text-lg ${getRiskColor(patientData.risk_score)}`}>
                            {(patientData.risk_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      {patientData.family_history && patientData.family_history.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Family History</p>
                          <div className="flex flex-wrap gap-2">
                            {patientData.family_history.map((condition) => (
                              <Badge key={condition} variant="secondary">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Disease Predictions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Disease Predictions</CardTitle>
                      <CardDescription>Based on X-ray comparison and pattern matching</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {patientImages?.predictions && patientImages.predictions.length > 0 ? (
                        patientImages.predictions.map((pred: Prediction, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-lg">{pred.disease}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Confidence: {(pred.probability * 100).toFixed(1)}%
                                </p>
                              </div>
                              <Badge className={getDiseaseSeverityColor(pred.probability)}>
                                {getDiseaseSeverity(pred.probability)}
                              </Badge>
                            </div>

                            {/* Confidence Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Prediction Score</span>
                                <span>{(pred.probability * 100).toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    pred.probability >= 0.7
                                      ? 'bg-red-500'
                                      : pred.probability >= 0.5
                                        ? 'bg-orange-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ width: `${pred.probability * 100}%` }}
                                />
                              </div>
                            </div>

                            {pred.similarity_score !== undefined && (
                              <div className="mt-3 p-3 bg-blue-50 rounded">
                                <p className="text-sm font-semibold text-blue-900">
                                  X-ray Similarity with Reference: {(pred.similarity_score * 100).toFixed(1)}%
                                </p>
                                <p className="text-xs text-blue-800 mt-1">
                                  Indicates how closely the patient's X-ray matches typical {pred.disease.toLowerCase()} patterns
                                </p>
                              </div>
                            )}

                            {pred.affected_areas && pred.affected_areas.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Affected Areas (by GradCAM):</p>
                                <div className="flex flex-wrap gap-2">
                                  {pred.affected_areas.map((area) => (
                                    <Badge key={area} variant="outline" className="text-xs">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No predictions available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* X-ray Comparison Tab */}
                <TabsContent value="xray" className="space-y-6">
                  {patientImages?.predictions && patientImages.predictions.length > 0 ? (
                    patientImages.predictions.map((pred: Prediction, idx: number) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle>{pred.disease}</CardTitle>
                          <CardDescription>
                            AI Confidence: {(pred.probability * 100).toFixed(1)}% | 
                            X-ray Similarity: {(pred.similarity_score ? pred.similarity_score * 100 : 0).toFixed(1)}%
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-sm font-semibold text-muted-foreground">
                              Below: Patient X-ray (left), AI attention heatmap (middle), Reference disease pattern (right)
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Patient X-ray */}
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Patient's X-ray</h5>
                                <div className="bg-black rounded-lg overflow-hidden aspect-square border-2 border-blue-300">
                                  <img
                                    src={patientImages.patient_xray}
                                    alt="Patient X-ray"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">Original scan</p>
                              </div>

                              {/* GradCAM Heatmap */}
                              <div>
                                <h5 className="font-semibold text-sm mb-2">AI Attention (GradCAM)</h5>
                                <div className="bg-black rounded-lg overflow-hidden aspect-square border-2 border-red-300">
                                  <img
                                    src={pred.gradcam_heatmap}
                                    alt="GradCAM Heatmap"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                  Red=detected abnormality
                                </p>
                              </div>

                              {/* Reference Disease Image */}
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Reference {pred.disease}</h5>
                                <div className="bg-black rounded-lg overflow-hidden aspect-square border-2 border-green-300">
                                  <img
                                    src={pred.reference_image}
                                    alt={`Reference ${pred.disease}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                  Standard disease pattern
                                </p>
                              </div>
                            </div>

                            {/* Interpretation */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                              <p className="text-sm font-semibold text-amber-900 mb-2">Clinical Interpretation</p>
                              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                                <li>Left image shows the patient's actual X-ray scan</li>
                                <li>Middle image highlights regions where AI detected abnormalities (red areas)</li>
                                <li>Right image shows a typical {pred.disease.toLowerCase()} pattern for comparison</li>
                                <li>Similarity score {pred.similarity_score ? `(${(pred.similarity_score * 100).toFixed(1)}%)` : ''} indicates pattern match</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground">No X-ray images available for this patient</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat" className="space-y-6">
                  <Card className="h-96 flex flex-col">
                    <CardHeader>
                      <CardTitle>Clinical Chat Assistant</CardTitle>
                      <CardDescription>Ask clinical questions about this patient's X-ray analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {chatMessages.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          Ask about the patient's condition, X-ray findings, disease predictions, or medical recommendations...
                        </p>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                              } ${msg.role === 'error' ? 'bg-red-100 text-red-800' : ''}`}
                            >
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                    <div className="border-t pt-4 flex gap-2">
                      <Input
                        placeholder="Ask about X-ray findings..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                        disabled={sendingChat}
                      />
                      <Button onClick={handleSendChat} disabled={sendingChat || !chatInput.trim()}>
                        {sendingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-muted-foreground">Loading patient data...</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Select a patient from the list to view X-ray analysis</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
