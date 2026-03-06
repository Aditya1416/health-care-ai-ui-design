'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Loader2 } from 'lucide-react'

interface Prediction {
  id: string
  patient_id: string
  predicted_disease: string
  confidence_score: number
  created_at: string
  hasXray: boolean
}

interface PatientInfo {
  name: string
  aqi: number
  pm25: number
  occupational: string
  smoking: string
  age: string
}

export default function PatientAnalysisPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [xrayUrl, setXrayUrl] = useState<string | null>(null)
  const [gradcamUrl, setGradcamUrl] = useState<string | null>(null)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  // Load predictions from Supabase
  useEffect(() => {
    const loadPredictions = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('predictions')
          .select('*')
          .order('created_at', { ascending: false })

        if (err) throw err
        setPredictions(data || [])
      } catch (err) {
        setError('Failed to load predictions from database')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadPredictions()
  }, [])

  // Load patient info when prediction is selected
  const handleSelectPrediction = async (pred: Prediction) => {
    setSelectedPrediction(pred)
    setPatientInfo(null)
    setXrayUrl(null)
    setGradcamUrl(null)
    setReferenceImageUrl(null)
    setLoading(true)
    setError(null)

    try {
      // Fetch patient info
      const { data: patData, error: patErr } = await supabase
        .from('patients')
        .select('*')
        .eq('id', pred.patient_id)
        .single()

      if (patErr) throw patErr
      if (patData) {
        setPatientInfo({
          name: patData.name || 'Unknown',
          aqi: patData.aqi || 0,
          pm25: patData.pm25 || 0,
          occupational: patData.occupational_exposure || 'N/A',
          smoking: patData.smoking_status || 'Unknown',
          age: patData.date_of_birth || 'Unknown',
        })
      }

      // Fetch X-ray images
      const { data: xrayData, error: xrayErr } = await supabase
        .from('medical_images')
        .select('url, type')
        .eq('patient_id', pred.patient_id)
        .eq('type', 'xray')
        .limit(1)
        .single()

      if (!xrayErr && xrayData) {
        setXrayUrl(xrayData.url)
      }

      // Fetch reference images for disease
      const { data: refData, error: refErr } = await supabase
        .from('reference_images')
        .select('url')
        .eq('disease', pred.predicted_disease)
        .limit(1)
        .single()

      if (!refErr && refData) {
        setReferenceImageUrl(refData.url)
      }

      // Fetch GradCAM heatmap
      const { data: gradcamData, error: gradcamErr } = await supabase
        .from('heatmaps')
        .select('image_url')
        .eq('prediction_id', pred.id)
        .limit(1)
        .single()

      if (!gradcamErr && gradcamData) {
        setGradcamUrl(gradcamData.image_url)
      }
    } catch (err) {
      console.error('Error loading patient data:', err)
      setError('Failed to load patient data. Some images may be unavailable.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600'
    if (score >= 0.5) return 'text-orange-600'
    return 'text-green-600'
  }

  const getRiskBadgeColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-100 text-red-800'
    if (score >= 0.5) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Patient X-ray Analysis</h1>
        <p className="text-muted-foreground mb-8">Compare patient X-rays with reference disease patterns using AI</p>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Notice</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Predictions List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Predictions</CardTitle>
                <CardDescription>{predictions.length} predictions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && predictions.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {predictions.map((pred) => (
                      <button
                        key={pred.id}
                        onClick={() => handleSelectPrediction(pred)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedPrediction?.id === pred.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary hover:bg-accent'
                        }`}
                      >
                        <p className="font-medium text-sm">{pred.predicted_disease}</p>
                        <p className="text-xs opacity-75">
                          Confidence: {(pred.confidence_score * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs opacity-75">{new Date(pred.created_at).toLocaleDateString()}</p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedPrediction && patientInfo ? (
              <Tabs defaultValue="analysis" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="xray">X-ray Comparison</TabsTrigger>
                </TabsList>

                {/* AI Analysis Tab */}
                <TabsContent value="analysis" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-semibold">{patientInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="font-semibold">{patientInfo.age}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Smoking Status</p>
                          <p className="font-semibold">{patientInfo.smoking}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Occupational Exposure</p>
                          <p className="font-semibold text-sm">{patientInfo.occupational}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Air Quality Index (AQI)</p>
                          <p className="font-semibold text-lg">{patientInfo.aqi}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">PM2.5 Level</p>
                          <p className="font-semibold text-lg">{patientInfo.pm25} µg/m³</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Disease Prediction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{selectedPrediction.predicted_disease}</h3>
                          <p className="text-muted-foreground">AI Diagnosis</p>
                        </div>
                        <Badge className={getRiskBadgeColor(selectedPrediction.confidence_score)}>
                          {(selectedPrediction.confidence_score * 100).toFixed(1)}% Confidence
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence Score</span>
                          <span className={`font-semibold ${getRiskColor(selectedPrediction.confidence_score)}`}>
                            {(selectedPrediction.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              selectedPrediction.confidence_score >= 0.7
                                ? 'bg-red-500'
                                : selectedPrediction.confidence_score >= 0.5
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${selectedPrediction.confidence_score * 100}%` }}
                          />
                        </div>
                      </div>

                      {selectedPrediction.hasXray && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900">X-ray Available</p>
                          <p className="text-xs text-blue-800">Medical imaging available for analysis</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* X-ray Comparison Tab */}
                <TabsContent value="xray" className="space-y-6">
                  {loading ? (
                    <Card>
                      <CardContent className="pt-6 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>X-ray Visual Comparison with GradCAM Analysis</CardTitle>
                        <CardDescription>
                          Left: Patient scan | Middle: AI attention heatmap | Right: Reference disease pattern
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Patient X-ray */}
                          <div>
                            <h5 className="font-semibold text-sm mb-2">Patient's X-ray</h5>
                            <div className="bg-black rounded-lg overflow-hidden aspect-square border-2 border-blue-300">
                              {xrayUrl ? (
                                <img src={xrayUrl} alt="Patient X-ray" className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                  <p className="text-sm">No X-ray available</p>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">Original scan</p>
                          </div>

                          {/* GradCAM Heatmap */}
                          <div>
                            <h5 className="font-semibold text-sm mb-2">AI Attention (GradCAM)</h5>
                            <div className="bg-black rounded-lg overflow-hidden aspect-square border-2 border-red-300">
                              {gradcamUrl ? (
                                <img src={gradcamUrl} alt="GradCAM Heatmap" className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                  <p className="text-sm">No heatmap available</p>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">Red = detected abnormality</p>
                          </div>

                          {/* Reference Disease Image */}
                          <div>
                            <h5 className="font-semibold text-sm mb-2">Reference Pattern</h5>
                            <div className="bg-black rounded-lg overflow-hidden aspect-square border-2 border-green-300">
                              {referenceImageUrl ? (
                                <img
                                  src={referenceImageUrl}
                                  alt={`Reference ${selectedPrediction.predicted_disease}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                  <p className="text-sm">No reference image</p>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              Standard {selectedPrediction.predicted_disease} pattern
                            </p>
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                          <p className="text-sm font-semibold text-amber-900 mb-2">How to Interpret</p>
                          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                            <li>The left image shows the patient's actual X-ray</li>
                            <li>The middle image highlights regions where AI detected abnormalities (red areas = high attention)</li>
                            <li>The right image shows a typical {selectedPrediction.predicted_disease.toLowerCase()} X-ray for comparison</li>
                            <li>Compare patterns between patient and reference to assess disease likelihood</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground mb-4">Select a prediction from the list to begin analysis</p>
                  {predictions.length === 0 && !loading && (
                    <p className="text-sm text-muted-foreground">No predictions available</p>
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
