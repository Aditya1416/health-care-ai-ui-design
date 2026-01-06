"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Appointment {
  id: string
  patient_id: string
  appointment_type: string
  appointment_date: string
  status: string
  notes: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAppointments()
  }, [page])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/appointments?page=${page}&limit=20`)
      const data = await response.json()
      setAppointments(data.appointments)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground mt-2">All appointments in the system</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr
                    key={appt.id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/admin/appointments/${appt.id}`)}
                  >
                    <td className="p-2 capitalize">{appt.appointment_type}</td>
                    <td className="p-2">{new Date(appt.appointment_date).toLocaleString()}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          appt.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : appt.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="p-2">{appt.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading} variant="outline">
                Previous
              </Button>
              <Button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
