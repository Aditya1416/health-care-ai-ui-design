"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from "next/navigation"

interface AppointmentDetail {
  id: string
  patient_id: string
  doctor_id: string
  appointment_type: string
  appointment_date: string
  status: string
  notes: string
  created_at: string
}

interface DoctorInfo {
  id: string
  specialization: string
  license_number: string
  phone: string
}

interface PatientInfo {
  id: string
  date_of_birth: string
  gender: string
  blood_type: string
  medical_history: string
  allergies: string
}

export default function AppointmentDetailPage() {
  const params = useParams()
  const appointmentId = params.id as string

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null)
  const [patient, setPatient] = useState<PatientInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDetails()
  }, [appointmentId])

  const fetchDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/appointments/${appointmentId}`)
      if (!response.ok) throw new Error("Failed to fetch appointment details")

      const data = await response.json()
      setAppointment(data.appointment)
      setDoctor(data.doctor)
      setPatient(data.patient)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading appointment")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-destructive">{error}</div>
  if (!appointment) return <div className="p-6">Appointment not found</div>

  const getAppointmentExplanation = (type: string): string => {
    const explanations: Record<string, string> = {
      "X-Ray":
        "X-ray appointments are used for radiographic imaging to detect bone fractures, lung infections, and other internal abnormalities. The patient receives targeted radiation exposure for diagnostic purposes.",
      "CT Scan":
        "Computed Tomography scans provide detailed 3D images for complex internal structures. Used for tumor detection, internal bleeding, and detailed organ assessment.",
      Spirometry:
        "Lung function test measuring breathing capacity and airflow. Essential for diagnosing respiratory conditions like asthma and COPD.",
      "Blood Test":
        "Laboratory analysis of blood samples to check for infections, anemia, diabetes, and other metabolic conditions.",
      Ultrasound:
        "Non-invasive imaging using sound waves to visualize organs, detect abnormalities, monitor pregnancy, and assess soft tissue conditions.",
      MRI: "Magnetic Resonance Imaging provides detailed soft tissue images without radiation, used for brain, spinal cord, and joint assessments.",
      ECG: "Electrocardiogram records heart electrical activity to detect arrhythmias, heart attacks, and cardiac abnormalities.",
      "Physical Exam":
        "Routine medical examination including vital signs, physical assessment, and preliminary health screening.",
    }
    return (
      explanations[type] ||
      `${type} is a medical examination or diagnostic procedure conducted by a qualified healthcare professional.`
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointment Details</h1>
          <p className="text-muted-foreground mt-2">Complete information and medical context</p>
        </div>
        <Link href="/admin/appointments">
          <Button variant="outline">Back to Appointments</Button>
        </Link>
      </div>

      {/* Appointment Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Appointment Type</p>
              <p className="text-lg font-semibold">{appointment.appointment_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(appointment.status)}`}
              >
                {appointment.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scheduled Date & Time</p>
              <p className="text-lg font-semibold">{new Date(appointment.appointment_date).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created On</p>
              <p className="text-lg font-semibold">{new Date(appointment.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Medical Explanation */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">📋 Medical Context</p>
            <p className="text-sm text-blue-800">{getAppointmentExplanation(appointment.appointment_type)}</p>
          </div>

          {appointment.notes && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-2">Doctor's Notes</p>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Information */}
      {doctor && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Healthcare Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Specialization</p>
              <p className="font-semibold">{doctor.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">License Number</p>
              <p className="font-semibold">{doctor.license_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-semibold">{doctor.phone}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Information */}
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Medical Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-semibold">
                  {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-semibold">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Type</p>
                <p className="font-semibold">{patient.blood_type}</p>
              </div>
            </div>

            {patient.medical_history && (
              <div>
                <p className="text-sm text-muted-foreground">Medical History</p>
                <p className="text-sm">{patient.medical_history}</p>
              </div>
            )}

            {patient.allergies && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-semibold text-red-900">⚠️ Allergies</p>
                <p className="text-sm text-red-800">{patient.allergies}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
