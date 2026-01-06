"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function DemographicAnalytics() {
  const [ageBuckets, setAgeBuckets] = useState([])
  const [genderDistribution, setGenderDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserClient()

        const { data: patients, error: err } = await supabase.from("patients").select("date_of_birth, gender")

        if (err) throw err

        // Process age data
        const ageGroups: Record<string, number> = {
          "18-30": 0,
          "31-45": 0,
          "46-60": 0,
          "60+": 0,
        }

        // Process gender data
        const genderCounts: Record<string, number> = {
          M: 0,
          F: 0,
          Other: 0,
        }

        patients?.forEach((p: any) => {
          if (p.date_of_birth) {
            const age = new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()
            if (age < 31) ageGroups["18-30"]++
            else if (age < 46) ageGroups["31-45"]++
            else if (age < 61) ageGroups["46-60"]++
            else ageGroups["60+"]++
          }
          if (p.gender) genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1
        })

        setAgeBuckets(Object.entries(ageGroups).map(([name, value]) => ({ name, value })))
        setGenderDistribution(Object.entries(genderCounts).map(([name, value]) => ({ name, value })))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8">Loading demographic data...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  const COLORS = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981"]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Demographic Analytics</h1>
        <p className="text-muted-foreground">Patient population statistics by age and gender</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageBuckets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label
                  dataKey="value"
                  outerRadius={100}
                >
                  {genderDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
