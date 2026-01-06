"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"

const AQI_DATA = [
  { district: "Chennai", aqi: 156, pm25: 89, temperature: 32 },
  { district: "Coimbatore", aqi: 168, pm25: 95, temperature: 28 },
  { district: "Madurai", aqi: 142, pm25: 78, temperature: 34 },
  { district: "Tiruchirappalli", aqi: 145, pm25: 81, temperature: 33 },
  { district: "Salem", aqi: 172, pm25: 98, temperature: 31 },
]

export default function EnvironmentalAnalytics() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Environmental Analytics</h1>
        <p className="text-muted-foreground">Air quality and environmental factors by Tamil Nadu district</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Air Quality Index by District</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={AQI_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2} name="AQI" />
                <Line type="monotone" dataKey="pm25" stroke="#f59e0b" strokeWidth={2} name="PM2.5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature vs AQI Correlation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="temperature" name="Temperature (°C)" />
                <YAxis type="number" dataKey="aqi" name="AQI" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Districts" data={AQI_DATA} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environmental Data by District</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">District</th>
                  <th className="text-center py-2 px-4">AQI</th>
                  <th className="text-center py-2 px-4">PM2.5 (µg/m³)</th>
                  <th className="text-center py-2 px-4">Temperature (°C)</th>
                </tr>
              </thead>
              <tbody>
                {AQI_DATA.map((row) => (
                  <tr key={row.district} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4 font-medium">{row.district}</td>
                    <td className="text-center py-2 px-4">{row.aqi}</td>
                    <td className="text-center py-2 px-4">{row.pm25}</td>
                    <td className="text-center py-2 px-4">{row.temperature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
