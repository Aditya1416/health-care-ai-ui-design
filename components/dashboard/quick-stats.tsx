"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, Heart, Droplets, Weight } from "lucide-react"

export function QuickStats({ metrics }: { metrics: any[] | null }) {
  const stats = [
    {
      icon: Heart,
      label: "Heart Rate",
      value: "72",
      unit: "bpm",
      color: "text-red-500",
    },
    {
      icon: Droplets,
      label: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      color: "text-blue-500",
    },
    {
      icon: Weight,
      label: "Weight",
      value: "72",
      unit: "kg",
      color: "text-green-500",
    },
    {
      icon: Activity,
      label: "Steps",
      value: "8,234",
      unit: "steps",
      color: "text-amber-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.unit}</p>
              </div>
              <stat.icon className={`${stat.color} w-8 h-8 opacity-80`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
