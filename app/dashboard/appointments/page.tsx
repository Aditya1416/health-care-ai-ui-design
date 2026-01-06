"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { Calendar, Clock, Plus, Trash2 } from "lucide-react"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newAppointment, setNewAppointment] = useState({
    doctor_name: "",
    appointment_date: "",
    reason: "",
    notes: "",
  })
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchAppointments()
  }, [supabase])

  const fetchAppointments = async () => {
    try {
      const { data } = await supabase.from("appointments").select("*").order("appointment_date", { ascending: true })
      setAppointments(data || [])
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAppointment = async () => {
    if (!newAppointment.doctor_name || !newAppointment.appointment_date) return

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { error } = await supabase.from("appointments").insert([
        {
          user_id: userData.user.id,
          ...newAppointment,
        },
      ])

      if (error) throw error

      setNewAppointment({ doctor_name: "", appointment_date: "", reason: "", notes: "" })
      setIsOpen(false)
      fetchAppointments()
    } catch (error) {
      console.error("Error adding appointment:", error)
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase.from("appointments").delete().eq("id", id)
      if (error) throw error
      fetchAppointments()
    } catch (error) {
      console.error("Error deleting appointment:", error)
    }
  }

  const upcomingAppointments = appointments.filter((apt) => new Date(apt.appointment_date) > new Date())
  const pastAppointments = appointments.filter((apt) => new Date(apt.appointment_date) <= new Date())

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
                <p className="text-muted-foreground mt-2">Schedule and manage your doctor appointments</p>
              </div>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={18} />
                    New Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Schedule New Appointment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="doctor">Doctor Name</Label>
                      <Input
                        id="doctor"
                        value={newAppointment.doctor_name}
                        onChange={(e) => setNewAppointment({ ...newAppointment, doctor_name: e.target.value })}
                        placeholder="Enter doctor's name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Appointment Date & Time</Label>
                      <Input
                        id="date"
                        type="datetime-local"
                        value={newAppointment.appointment_date}
                        onChange={(e) => setNewAppointment({ ...newAppointment, appointment_date: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Input
                        id="reason"
                        value={newAppointment.reason}
                        onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                        placeholder="e.g., Regular checkup"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <textarea
                        id="notes"
                        value={newAppointment.notes}
                        onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                        placeholder="Any additional notes..."
                        className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddAppointment} className="w-full">
                      Schedule Appointment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Upcoming</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {upcomingAppointments.map((apt) => (
                    <Card key={apt.id} className="border-l-4 border-primary border-border">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-foreground text-lg">{apt.doctor_name}</p>
                            <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                {new Date(apt.appointment_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={16} />
                                {new Date(apt.appointment_date).toLocaleTimeString()}
                              </span>
                            </div>
                            {apt.reason && <p className="mt-3 text-foreground">{apt.reason}</p>}
                            {apt.notes && <p className="mt-2 text-sm text-muted-foreground">{apt.notes}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center py-8">No upcoming appointments</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Past Appointments</h2>
                <div className="grid grid-cols-1 gap-4">
                  {pastAppointments.map((apt) => (
                    <Card key={apt.id} className="border-border opacity-75">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{apt.doctor_name}</p>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{new Date(apt.appointment_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
