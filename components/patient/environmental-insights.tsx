"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wind, Droplets, Sun, AlertTriangle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface EnvironmentalInsightsProps {
  userId: string
}

export default function EnvironmentalInsights({ userId }: EnvironmentalInsightsProps) {
  const environmentalData = [
    { date: "Mon", aqi: 65, temp: 22, humidity: 45 },
    { date: "Tue", aqi: 78, temp: 20, humidity: 52 },
    { date: "Wed", aqi: 82, temp: 18, humidity: 58 },
    { date: "Thu", aqi: 95, temp: 15, humidity: 72 },
    { date: "Fri", aqi: 72, temp: 19, humidity: 55 },
  ]

  const currentEnv = {
    aqi: 72,
    temp: 19,
    humidity: 55,
    wind_speed: 12,
    uv_index: 4,
    pollen_level: "Moderate",
    condition: "Partly Cloudy",
  }

  return (
    <div className="space-y-4">
      {/* Current Environmental Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="w-4 h-4" />
              Air Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">{currentEnv.aqi}</div>
            <p className="text-sm text-muted-foreground">AQI (Moderate)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{currentEnv.temp}°C</div>
            <p className="text-sm text-muted-foreground">{currentEnv.condition}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Pollen Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{currentEnv.pollen_level}</div>
            <p className="text-sm text-muted-foreground">Allergen exposure</p>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Environmental Trends (5 Days)</CardTitle>
          <CardDescription>How weather patterns correlate with health</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={environmentalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
              <Line type="monotone" dataKey="aqi" stroke="var(--primary)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidity" stroke="var(--secondary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Health Correlation */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <AlertTriangle className="w-5 h-5" />
            Environmental Health Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
          <p>• High humidity (55%) may increase mold and dust mite allergens</p>
          <p>• Moderate AQI (72) can trigger respiratory symptoms in sensitive individuals</p>
          <p>• Temperature dropping - may increase respiratory infection risk</p>
          <p>• Pollen levels moderate - manage outdoor exposure time</p>
        </CardContent>
      </Card>
    </div>
  )
}
