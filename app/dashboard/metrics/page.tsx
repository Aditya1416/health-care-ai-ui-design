"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { Plus } from "lucide-react"

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newMetric, setNewMetric] = useState({ metric_type: "", value: "", unit: "" })
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchMetrics()
  }, [supabase])

  const fetchMetrics = async () => {
    try {
      const { data } = await supabase
        .from("health_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100)
      setMetrics(data || [])
    } catch (error) {
      console.error("Error fetching metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMetric = async () => {
    if (!newMetric.metric_type || !newMetric.value) return

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const metricData: any = {
        user_id: userData.user.id,
        recorded_at: new Date().toISOString(),
      }

      // Map metric types to schema fields
      const value = Number.parseFloat(newMetric.value)
      switch (newMetric.metric_type) {
        case "weight":
          metricData.weight_kg = value
          break
        case "blood_pressure":
          // For blood pressure, store as systolic (the value entered)
          metricData.blood_pressure_systolic = value
          break
        case "heart_rate":
          metricData.heart_rate = value
          break
        case "blood_glucose":
          metricData.blood_glucose = value
          break
        case "temperature":
          metricData.temperature_celsius = value
          break
      }

      const { error } = await supabase.from("health_metrics").insert([metricData])

      if (error) throw error

      setNewMetric({ metric_type: "", value: "", unit: "" })
      fetchMetrics()
    } catch (error) {
      console.error("[v0] Error adding metric:", error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Health Metrics</h1>
              <p className="text-muted-foreground mt-2">Track and manage your health measurements</p>
            </div>

            {/* Add New Metric */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Add New Measurement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="type">Metric Type</Label>
                    <select
                      id="type"
                      value={newMetric.metric_type}
                      onChange={(e) => setNewMetric({ ...newMetric, metric_type: e.target.value })}
                      className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-card text-foreground"
                    >
                      <option value="">Select type...</option>
                      <option value="weight">Weight</option>
                      <option value="blood_pressure">Blood Pressure</option>
                      <option value="heart_rate">Heart Rate</option>
                      <option value="blood_glucose">Blood Glucose</option>
                      <option value="temperature">Temperature</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newMetric.value}
                      onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                      placeholder="Enter value"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={newMetric.unit}
                      onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                      placeholder="e.g., kg, mmHg, bpm"
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddMetric} className="w-full gap-2">
                      <Plus size={18} />
                      Add Metric
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics List */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Recent Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : metrics.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {metric.metric_type.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(metric.recorded_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          {metric.value} <span className="text-sm text-muted-foreground">{metric.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No metrics recorded yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
