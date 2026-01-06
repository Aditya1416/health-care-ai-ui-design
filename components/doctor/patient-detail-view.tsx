"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Download, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PatientDetailViewProps {
  doctorId: string
  patientId: string
}

export default function PatientDetailView({ doctorId, patientId }: PatientDetailViewProps) {
  const [patient, setPatient] = useState<any>(null)
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock patient data - in production, fetch from Supabase
    setPatient({
      id: patientId,
      name: "John Smith",
      age: 45,
      gender: "Male",
      email: "john@example.com",
      phone: "+1-555-0123",
      blood_type: "O+",
      height_cm: 180,
      weight_kg: 82,
      chronic_conditions: ["Hypertension", "Type 2 Diabetes"],
      allergies: ["Penicillin", "Shellfish"],
      last_visit: "2024-01-12",
    })

    setPredictions([
      {
        id: "1",
        disease: "Type 2 Diabetes Complication Risk",
        confidence: 72,
        symptoms: ["Excessive thirst", "Frequent urination", "Fatigue"],
        environmental_factors: ["High stress", "Poor diet"],
        recommendation: "Endocrinology consultation recommended",
        explanation:
          "Patient's symptoms and medical history align with diabetic complication risk patterns. Environmental factors (stress, diet) may be contributing.",
      },
    ])
    setLoading(false)
  }, [patientId])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Patient Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{patient?.name}</h1>
            <p className="text-muted-foreground mt-1">
              {patient?.age}y/o {patient?.gender}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Records
            </Button>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Send Consultation
            </Button>
          </div>
        </div>

        {/* Patient Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-foreground">{patient?.email}</p>
              <p className="text-muted-foreground">{patient?.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Vital Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-foreground">Height: {patient?.height_cm} cm</p>
              <p className="text-foreground">Weight: {patient?.weight_kg} kg</p>
              <p className="text-foreground">Blood Type: {patient?.blood_type}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Medical Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-foreground font-medium">Conditions:</p>
              <p className="text-muted-foreground">{patient?.chronic_conditions?.join(", ")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            <TabsTrigger value="medical_history">Medical History</TabsTrigger>
            <TabsTrigger value="environmental">Environmental Data</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            {predictions.map((pred) => (
              <Card key={pred.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{pred.disease}</CardTitle>
                      <CardDescription>{pred.recommendation}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{pred.confidence}%</div>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-sm mb-2">Explanation:</p>
                    <p className="text-sm text-muted-foreground">{pred.explanation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm mb-2">Contributing Symptoms:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {pred.symptoms.map((s: string) => (
                          <li key={s}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">Environmental Factors:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {pred.environmental_factors.map((f: string) => (
                          <li key={f}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2 border-t">
                    <Button variant="outline" size="sm">
                      Request More Info
                    </Button>
                    <Button size="sm">Validate Prediction</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="medical_history">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No records uploaded yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environmental">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Exposure Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Environmental data not yet available</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Notice */}
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              All AI predictions are preliminary assessments for clinical decision support. Professional judgment and
              standard diagnostic procedures are required for diagnosis and treatment planning.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
