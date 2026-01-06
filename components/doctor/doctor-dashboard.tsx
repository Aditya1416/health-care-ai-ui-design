"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { AlertCircle, TrendingUp, Users, CheckCircle } from "lucide-react"

interface DoctorDashboardProps {
  userId: string
}

export default function DoctorDashboard({ userId }: DoctorDashboardProps) {
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in production, fetch real predictions
    setPredictions([
      {
        id: "1",
        patient_name: "John Smith",
        condition: "Influenza",
        confidence: 85,
        status: "pending_review",
        created_at: "2024-01-15",
      },
      {
        id: "2",
        patient_name: "Jane Doe",
        condition: "Allergic Rhinitis",
        confidence: 72,
        status: "pending_review",
        created_at: "2024-01-15",
      },
      {
        id: "3",
        patient_name: "Bob Johnson",
        condition: "Hypertension",
        confidence: 68,
        status: "reviewed",
        created_at: "2024-01-14",
      },
    ])
    setLoading(false)
  }, [])

  const prediction_trends = [
    { date: "Mon", predictions: 12, confirmed: 9 },
    { date: "Tue", predictions: 18, confirmed: 14 },
    { date: "Wed", predictions: 15, confirmed: 11 },
    { date: "Thu", predictions: 22, confirmed: 18 },
    { date: "Fri", predictions: 20, confirmed: 16 },
    { date: "Sat", predictions: 10, confirmed: 8 },
    { date: "Sun", predictions: 8, confirmed: 6 },
  ]

  const confidence_distribution = [
    { range: "60-70%", count: 8, fill: "#fbbf24" },
    { range: "70-80%", count: 15, fill: "#60a5fa" },
    { range: "80-90%", count: 12, fill: "#34d399" },
    { range: "90%+", count: 5, fill: "#10b981" },
  ]

  const top_conditions = [
    { name: "Influenza", count: 12, percentage: 22 },
    { name: "Allergic Rhinitis", count: 8, percentage: 15 },
    { name: "Hypertension", count: 7, percentage: 13 },
    { name: "Common Cold", count: 6, percentage: 11 },
    { name: "Others", count: 20, percentage: 39 },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Clinical Decision Support</h1>
          <p className="text-muted-foreground">Doctor Dashboard - Prediction Review & Analytics</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary">24</div>
              <AlertCircle className="w-8 h-8 text-yellow-500 opacity-50" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reviewed This Week</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold text-accent">42</div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy Rate</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold text-secondary">87%</div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Patients</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary">156</div>
              <Users className="w-8 h-8 text-teal-500 opacity-50" />
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prediction Trends */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Prediction Trends (7 Days)</CardTitle>
              <CardDescription>Total predictions vs confirmed diagnoses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prediction_trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="predictions" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="confirmed" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Confidence Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction Confidence Distribution</CardTitle>
              <CardDescription>Quality of AI predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={confidence_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="range" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]}>
                    {confidence_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Predicted Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Most Common Predictions</CardTitle>
              <CardDescription>Top 5 conditions predicted this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={top_conditions}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="var(--primary)"
                    dataKey="count"
                  >
                    {top_conditions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ["var(--primary)", "var(--secondary)", "var(--accent)", "var(--chart-4)", "var(--muted)"][
                            index % 5
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pending Predictions Review */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Prediction Reviews</CardTitle>
            <CardDescription>AI predictions awaiting clinical validation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/50 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{pred.patient_name}</p>
                    <p className="text-sm text-muted-foreground">{pred.condition}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{pred.confidence}%</div>
                      <div className="text-xs text-muted-foreground">{pred.created_at}</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${pred.status === "reviewed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {pred.status === "reviewed" ? "Reviewed" : "Pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
              <AlertCircle className="w-5 h-5" />
              Clinical Decision Support Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800 dark:text-yellow-200 text-sm space-y-2">
            <p>This dashboard displays AI-generated preliminary assessments only. All predictions:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Are assistive only - never replace professional judgment</li>
              <li>Require clinical validation before patient communication</li>
              <li>Should be considered alongside full patient evaluation</li>
              <li>Must be documented in patient records with physician review notes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
