"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createBrowserClient } from "@/lib/supabase/client"
import { ChevronRight, Users, Activity } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Doctor {
  id: string
  specialization: string
  license_number: string
  phone: string
  clinic_address: string
}

interface Patient {
  patient_id: string
  name: string
  date_of_birth: string
  gender: string
  blood_type: string
  occupation: string
  district: string
  city: string
}

interface Prediction {
  id: string
  disease_name: string
  risk_score: number
  confidence: number
  icd10_code: string
}

export default function DoctorsPage() {
  const supabase = createBrowserClient()
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  // Fetch all doctors
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").limit(20)

      if (error) {
        console.error("[v0] Error fetching doctors:", error)
        return []
      }
      return data as Doctor[]
    },
  })

  // Fetch patients for selected doctor
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["doctorPatients", selectedDoctorId],
    queryFn: async () => {
      if (!selectedDoctorId) return []

      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
        doctor_id,
        patients:patient_id (
          id,
          date_of_birth,
          gender,
          blood_type,
          medical_history,
          allergies,
          user_id
        )
      `,
        )
        .eq("doctor_id", selectedDoctorId)
        .limit(50)

      if (error) {
        console.error("[v0] Error fetching patients:", error)
        return []
      }

      // Extract unique patients
      const uniquePatients = new Map()
      data?.forEach((appointment: any) => {
        if (appointment.patients && !uniquePatients.has(appointment.patients.id)) {
          uniquePatients.set(appointment.patients.id, appointment.patients)
        }
      })

      return Array.from(uniquePatients.values())
    },
    enabled: !!selectedDoctorId,
  })

  // Fetch predictions for selected patient
  const { data: predictions = [], isLoading: predictionsLoading } = useQuery({
    queryKey: ["patientPredictions", selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return []

      const { data, error } = await supabase
        .from("health_risk_predictions")
        .select("*")
        .eq("patient_id", selectedPatientId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("[v0] Error fetching predictions:", error)
        return []
      }
      return data as Prediction[]
    },
    enabled: !!selectedPatientId,
  })

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId)
  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-foreground">Doctor Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">View doctors, their patients, and all diagnoses</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Column 1: Doctors List */}
          <div>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Doctors ({doctors.length})</CardTitle>
                <CardDescription>Select a doctor to view their patients</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {doctorsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : doctors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No doctors found. Run seed data first.</p>
                ) : (
                  <div className="space-y-2">
                    {doctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => {
                          setSelectedDoctorId(doctor.id)
                          setSelectedPatientId(null)
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedDoctorId === doctor.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="text-sm font-medium text-foreground">Dr. {doctor.specialization.split(" ")[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{doctor.specialization}</p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Doctor Details & Patients */}
          <div className="lg:col-span-2">
            {selectedDoctor ? (
              <div className="space-y-6">
                {/* Doctor Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Doctor Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Specialization</p>
                      <p className="text-sm font-medium text-foreground">{selectedDoctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">License Number</p>
                      <p className="text-sm font-mono text-foreground">{selectedDoctor.license_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="text-sm text-foreground">{selectedDoctor.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Clinic Address</p>
                      <p className="text-sm text-foreground">{selectedDoctor.clinic_address}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Patients List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Patients ({patients.length})
                    </CardTitle>
                    <CardDescription>Click to view patient predictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patientsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : patients.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No patients found</p>
                    ) : (
                      <div className="space-y-2">
                        {patients.map((patient: any) => (
                          <button
                            key={patient.id}
                            onClick={() => setSelectedPatientId(patient.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedPatientId === patient.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <p className="text-sm font-medium text-foreground">
                              Patient {patient.id.substring(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {patient.gender}, Blood: {patient.blood_type}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">📍 {patient.district || "Unknown"}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-muted-foreground">Select a doctor to view their details and patients</p>
              </Card>
            )}
          </div>

          {/* Column 3: Patient Predictions */}
          <div>
            {selectedPatient ? (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Diagnoses
                  </CardTitle>
                  <CardDescription>AI predictions for this patient</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  {predictionsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : predictions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No predictions found</p>
                  ) : (
                    <div className="space-y-3">
                      {predictions.map((pred: any) => (
                        <Link
                          key={pred.id}
                          href={`/admin/predictions/${pred.id}`}
                          className="block p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{pred.disease_name}</p>
                              <p className="text-xs text-muted-foreground mt-1">ICD-10: {pred.icd10_code}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    pred.risk_score > 70
                                      ? "bg-destructive/10 text-destructive"
                                      : pred.risk_score > 40
                                        ? "bg-yellow-500/10 text-yellow-700"
                                        : "bg-green-500/10 text-green-700"
                                  }`}
                                >
                                  Risk: {Math.round(pred.risk_score)}%
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <p className="text-muted-foreground">Select a patient to view their diagnoses</p>
              </Card>
            )}
          </div>
        </div>

        {/* Patient Details Panel */}
        {selectedPatient && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Patient Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="text-sm font-medium text-foreground">{selectedPatient.date_of_birth}</p>
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
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedPatient.district}, {selectedPatient.city}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Medical History</p>
                  <p className="text-sm text-foreground">{selectedPatient.medical_history || "None"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Allergies</p>
                  <p className="text-sm text-foreground">{selectedPatient.allergies || "None"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Doctor-Patient Relationship</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-2">Attending Physician:</p>
                  <p className="text-sm text-foreground">{selectedDoctor?.specialization}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedDoctor?.clinic_address}</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-2">Diagnostic Summary:</p>
                  <p className="text-xs text-muted-foreground">Total predictions: {predictions.length}</p>
                  <p className="text-xs text-muted-foreground">
                    High-risk cases: {predictions.filter((p: any) => p.risk_score > 70).length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Average confidence:{" "}
                    {(
                      (predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / predictions.length) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
