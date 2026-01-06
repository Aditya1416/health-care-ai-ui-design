"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createBrowserClient } from "@/lib/supabase/client"
import { Activity, Calendar } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Patient {
  id: string
  date_of_birth: string
  gender: string
  blood_type: string
  medical_history: string
  allergies: string
  created_at: string
}

interface PatientWithStats extends Patient {
  predictionCount: number
  highRiskCount: number
}

export default function PatientsPage() {
  const supabase = createBrowserClient()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch all unique patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["uniquePatients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) {
        console.error("[v0] Error fetching patients:", error)
        return []
      }
      return data as Patient[]
    },
  })

  // Fetch predictions for selected patient
  const { data: predictions = [] } = useQuery({
    queryKey: ["patientPredictions", selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return []

      const { data, error } = await supabase
        .from("health_risk_predictions")
        .select("*")
        .eq("patient_id", selectedPatientId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching predictions:", error)
        return []
      }
      return data || []
    },
    enabled: !!selectedPatientId,
  })

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const highRiskPredictions = predictions.filter((p: any) => p.risk_category === "High")

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Patient Directory</h1>
              <p className="mt-2 text-sm text-muted-foreground">Browse all unique patients and their diagnoses</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Admin</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Column 1: Patients List with Search */}
          <div>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Patients ({patients.length})</CardTitle>
                <CardDescription>Unique patient records</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search by ID or DOB..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground"
                />

                {/* Patients List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {patientsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : patients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No patients found. Run seed data first.</p>
                  ) : (
                    patients
                      .filter((p) => p.id.includes(searchTerm.toUpperCase()) || p.date_of_birth.includes(searchTerm))
                      .map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => setSelectedPatientId(patient.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedPatientId === patient.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <p className="text-xs font-mono text-foreground">{patient.id.substring(0, 8)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Age {calculateAge(patient.date_of_birth)}, {patient.gender}
                          </p>
                          <p className="text-xs text-muted-foreground">🩸 {patient.blood_type}</p>
                        </button>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2-3: Patient Details & Predictions */}
          <div className="lg:col-span-3">
            {selectedPatient ? (
              <div className="space-y-6">
                {/* Patient Demographics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Patient ID</p>
                      <p className="text-sm font-mono text-foreground">{selectedPatient.id.substring(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="text-sm font-medium text-foreground">{selectedPatient.date_of_birth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="text-sm font-medium text-foreground">
                        {calculateAge(selectedPatient.date_of_birth)} years
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="text-sm font-medium text-foreground">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Blood Type</p>
                      <p className="text-sm font-medium text-foreground">{selectedPatient.blood_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(selectedPatient.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Medical History</p>
                      <p className="text-sm text-foreground">
                        {selectedPatient.medical_history || "No significant history"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Allergies</p>
                      <p className="text-sm text-foreground">{selectedPatient.allergies || "None reported"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Diagnoses Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      AI Diagnoses ({predictions.length})
                    </CardTitle>
                    {highRiskPredictions.length > 0 && (
                      <CardDescription className="text-destructive">
                        {highRiskPredictions.length} high-risk case(s) detected
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {predictions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No predictions found for this patient</p>
                    ) : (
                      <div className="space-y-2">
                        {predictions.map((pred: any) => (
                          <Link
                            key={pred.id}
                            href={`/admin/predictions/${pred.id}`}
                            className="block p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{pred.disease_name}</p>
                                <p className="text-xs text-muted-foreground">ICD-10: {pred.icd10_code}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded font-medium ${
                                      pred.risk_category === "High"
                                        ? "bg-destructive/10 text-destructive"
                                        : pred.risk_category === "Medium"
                                          ? "bg-yellow-500/10 text-yellow-700"
                                          : "bg-green-500/10 text-green-700"
                                    }`}
                                  >
                                    {pred.risk_category}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {((pred.confidence || 0) * 100).toFixed(0)}% confidence
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-muted-foreground">Select a patient to view their information and diagnoses</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
