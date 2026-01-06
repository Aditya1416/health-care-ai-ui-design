"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import Link from "next/link"

export function UpcomingAppointments({
  appointments,
}: {
  appointments: any[]
}) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt) => (
            <div key={apt.id} className="border-l-4 border-primary pl-4 py-2">
              <p className="font-medium text-foreground">{apt.doctor_name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(apt.appointment_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {new Date(apt.appointment_date).toLocaleTimeString()}
                </span>
              </div>
              {apt.reason && <p className="text-xs text-muted-foreground mt-2">{apt.reason}</p>}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No upcoming appointments</p>
        )}
        <Link href="/dashboard/appointments">
          <Button variant="outline" className="w-full bg-transparent">
            View All
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
