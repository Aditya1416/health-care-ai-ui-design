"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUploadWidget } from "@/components/ImageUploadWidget" // Import ImageUploadWidget component
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [metrics, setMetrics] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [medicalImages, setMedicalImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminStats, setAdminStats] = useState({ metrics: 0, appointments: 0, predictions: 0 })
  const [seeded, setSeeded] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        setUser(currentUser)

        if (currentUser.email === "aditya161499@gmail.com") {
          try {
            const res = await fetch("/api/admin/set-admin", { method: "POST" })
            if (res.ok) {
              console.log("[v0] Admin initialized successfully")
            }
          } catch (e) {
            console.error("[v0] Admin initialization failed:", e)
          }
        }

        // Check if user is admin
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("is_admin")
          .eq("user_id", currentUser.id)
          .single()

        const adminStatus = profileData?.is_admin || false
        setIsAdmin(adminStatus)

        if (adminStatus) {
          if (!seeded) {
            try {
              await fetch("/api/admin/seed-data", { method: "POST" })
              setSeeded(true)
            } catch (e) {
              console.error("[v0] Seed failed:", e)
            }
          }

          const statsRes = await fetch("/api/admin/stats")
          const statsData = await statsRes.json()
          setAdminStats(statsData)

          // Fetch admin dashboard data - no user filters for admin
          const [metricsRes, predictionsRes, appointmentsRes, doctorsRes, patientsRes, imagesRes] = await Promise.all([
            supabase.from("health_metrics").select("*").order("recorded_at", { ascending: false }).limit(100),
            supabase.from("health_predictions").select("*").order("created_at", { ascending: false }).limit(50),
            supabase.from("appointments").select("*").order("appointment_date", { ascending: true }).limit(50),
            supabase.from("doctors").select("*"),
            supabase.from("patients").select("*"),
            supabase.from("medical_imaging").select("*").limit(20),
          ])

          setMetrics(metricsRes.data || [])
          setPredictions(predictionsRes.data || [])
          setAppointments(appointmentsRes.data || [])
          setDoctors(doctorsRes.data || [])
          setPatients(patientsRes.data || [])
          setMedicalImages(imagesRes.data || [])
        } else {
          // Fetch patient data
          const [metricsRes, appointmentsRes, predictionsRes] = await Promise.all([
            supabase
              .from("health_metrics")
              .select("*")
              .eq("patient_id", currentUser.id)
              .order("recorded_at", { ascending: false })
              .limit(20),
            supabase
              .from("appointments")
              .select("*")
              .eq("patient_id", currentUser.id)
              .order("appointment_date", { ascending: true })
              .limit(5),
            supabase
              .from("health_predictions")
              .select("*")
              .eq("user_id", currentUser.id)
              .order("created_at", { ascending: false })
              .limit(5),
          ])

          setMetrics(metricsRes.data || [])
          setAppointments(appointmentsRes.data || [])
          setPredictions(predictionsRes.data || [])
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase, router])

  // Prepare chart data
  const metricsChartData = metrics
    .slice(-30)
    .reverse()
    .map((m: any) => ({
      date: new Date(m.recorded_at).toLocaleDateString(),
      value: Number.parseFloat(m.value),
      type: m.metric_type,
    }))

  const diseaseDistribution = predictions.reduce((acc: any, pred: any) => {
    const existing = acc.find((p: any) => p.name === pred.predicted_disease)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: pred.predicted_disease, value: 1 })
    }
    return acc
  }, [] as any[])

  const predictionConfidence = predictions.slice(0, 10).map((p: any) => ({
    disease: p.predicted_disease.substring(0, 10),
    confidence: Number.parseFloat(p.confidence_score) * 100,
  }))

  const COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="text-primary text-4xl mb-4">⏳</div>
          <p className="text-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Disclaimer Banner */}
      {showDisclaimer && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900">⚠️ AI-Assisted Clinical Decision Support</p>
              <p className="text-xs text-yellow-800 mt-1">
                This system provides AI-assisted insights for healthcare professionals. All findings must be validated
                by qualified medical professionals before clinical use. This is NOT a replacement for professional
                medical diagnosis.
              </p>
            </div>
            <button onClick={() => setShowDisclaimer(false)} className="ml-4 text-yellow-600 hover:text-yellow-700">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">HealthcareAI</h1>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Admin Dashboard" : "Patient Portal"} • AI-Assisted System
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            {isAdmin && (
              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">Admin</span>
            )}
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/auth/login")
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <Card className="bg-destructive/10 border-destructive/20 mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {isAdmin ? (
          // Admin Dashboard
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">System Overview</h2>
              <p className="text-muted-foreground mt-2">Real-time healthcare analytics and monitoring</p>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push("/admin/metrics")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{adminStats.metrics}</div>
                  <p className="text-xs text-muted-foreground mt-1">Click to view all</p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push("/admin/appointments")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{adminStats.appointments}</div>
                  <p className="text-xs text-muted-foreground mt-1">Click to view all</p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push("/admin/predictions")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{adminStats.predictions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Click to view all</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{medicalImages.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Uploaded</p>
                </CardContent>
              </Card>
            </div>

            {/* Data Management and Imaging Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={async () => {
                    const response = await fetch("/api/admin/export-zip")
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "healthcare-export.txt"
                    a.click()
                  }}
                  className="w-full"
                >
                  Download All Data (Export)
                </Button>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Upload Medical Image</h3>
                  <ImageUploadWidget />
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Disease Distribution */}
              {diseaseDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Disease Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={diseaseDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {diseaseDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Prediction Confidence */}
              {predictionConfidence.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Model Confidence Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={predictionConfidence}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="disease" angle={-45} textAnchor="end" height={80} />
                        <YAxis label={{ value: "Confidence %", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Bar dataKey="confidence" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Health Metrics Trend */}
            {metricsChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>System Health Metrics Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metricsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#10b981" name="Metric Value" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Predictions */}
            {predictions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Latest AI Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.slice(0, 10).map((pred: any) => (
                      <div
                        key={pred.id}
                        className="flex justify-between items-start p-4 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{pred.predicted_disease}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(pred.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Factors: {pred.contributing_factors?.join(", ") || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {(Number.parseFloat(pred.confidence_score) * 100).toFixed(1)}%
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              pred.risk_level === "High"
                                ? "bg-destructive/20 text-destructive"
                                : pred.risk_level === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-700"
                                  : "bg-green-500/20 text-green-700"
                            }`}
                          >
                            {pred.risk_level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medical Imaging Results */}
            {medicalImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Medical Scans & AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicalImages.slice(0, 8).map((img: any) => (
                      <div key={img.id} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{img.image_type || "Medical Scan"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(img.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          {img.analysis_result?.disease_name && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                img.analysis_result.severity === "High"
                                  ? "bg-destructive/20 text-destructive"
                                  : img.analysis_result.severity === "Medium"
                                    ? "bg-yellow-500/20 text-yellow-700"
                                    : "bg-green-500/20 text-green-700"
                              }`}
                            >
                              {img.analysis_result.severity}
                            </span>
                          )}
                        </div>
                        {img.analysis_result && (
                          <div className="text-sm space-y-1 mt-2">
                            <p>
                              <strong>Diagnosis:</strong> {img.analysis_result.disease_name}
                            </p>
                            <p>
                              <strong>Confidence:</strong> {(img.analysis_result.confidence * 100).toFixed(1)}%
                            </p>
                            <p className="text-muted-foreground text-xs mt-2">{img.analysis_result.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Patient Dashboard
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Your Health Dashboard</h2>
              <p className="text-muted-foreground mt-2">Track your metrics, appointments, and AI insights</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{metrics.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{appointments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{predictions.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Metrics Chart */}
            {metricsChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metricsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#10b981" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Appointments */}
            {appointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((apt: any) => (
                      <div key={apt.id} className="flex justify-between items-center p-4 border border-border rounded">
                        <div>
                          <p className="font-semibold">{apt.appointment_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.appointment_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded">
                          {apt.status || "Scheduled"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Predictions */}
            {predictions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your AI Health Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.slice(0, 5).map((pred: any) => (
                      <div key={pred.id} className="p-4 border border-border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{pred.predicted_disease}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              {pred.recommendations?.slice(0, 2).join(" • ") || "Follow up with doctor"}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {(Number.parseFloat(pred.confidence_score) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
