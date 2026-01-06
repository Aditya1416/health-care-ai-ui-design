"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, Heart, Activity } from "lucide-react"

interface HealthTimelineProps {
  userId: string
}

export default function HealthTimeline({ userId }: HealthTimelineProps) {
  const timeline = [
    {
      date: "Jan 15, 2024",
      event: "Symptoms Logged",
      description: "Cough and sore throat reported",
      type: "symptom",
    },
    {
      date: "Jan 14, 2024",
      event: "Environmental Alert",
      description: "High AQI detected - 95",
      type: "environment",
    },
    {
      date: "Jan 13, 2024",
      event: "Doctor Visit",
      description: "Annual checkup - all tests normal",
      type: "appointment",
    },
    {
      date: "Jan 10, 2024",
      event: "Health Metrics",
      description: "Weight recorded: 75kg, BP: 120/80",
      type: "metric",
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "symptom":
        return <Activity className="w-5 h-5 text-orange-500" />
      case "environment":
        return <TrendingUp className="w-5 h-5 text-blue-500" />
      case "appointment":
        return <Calendar className="w-5 h-5 text-green-500" />
      case "metric":
        return <Heart className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Timeline</CardTitle>
        <CardDescription>Your health events and observations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex gap-4 pb-4 last:pb-0 border-b last:border-b-0">
              <div className="pt-1">{getIcon(item.type)}</div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{item.event}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
