"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function HealthMetricsChart({ metrics }: { metrics: any[] | null }) {
  // Sample data for the chart
  const data = [
    { date: "Mon", weight: 72, heartRate: 72, bp: 120 },
    { date: "Tue", weight: 71.8, heartRate: 74, bp: 122 },
    { date: "Wed", weight: 71.6, heartRate: 71, bp: 119 },
    { date: "Thu", weight: 71.5, heartRate: 70, bp: 118 },
    { date: "Fri", weight: 71.3, heartRate: 73, bp: 121 },
    { date: "Sat", weight: 71.2, heartRate: 68, bp: 116 },
    { date: "Sun", weight: 71.0, heartRate: 69, bp: 117 },
  ]

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Health Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--chart-1)"
              dot={{ fill: "var(--chart-1)" }}
              name="Weight (kg)"
            />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="var(--chart-2)"
              dot={{ fill: "var(--chart-2)" }}
              name="Heart Rate (bpm)"
            />
            <Line
              type="monotone"
              dataKey="bp"
              stroke="var(--chart-3)"
              dot={{ fill: "var(--chart-3)" }}
              name="Blood Pressure"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
