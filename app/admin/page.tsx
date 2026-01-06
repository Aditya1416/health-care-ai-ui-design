"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BarChart3, Stethoscope, Users, Database, AlertCircle } from "lucide-react"

interface Doctor {
  id: string
  name: string
  specialization: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [seedingData, setSeedingData] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [showSystemOverview, setShowSystemOverview] = useState(false) // Make system overview optional - don't auto-load
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalPredictions: 0,
    totalAppointments: 0,
  })

  useEffect(() => {
    const checkAdmin = async () => {
      if (!supabase) {
        router.push("/auth/login")
        return
      }

      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        setUser(currentUser)
        setIsAdmin(true)

        const { data: doctorsList } = await supabase
          .from("doctors")
          .select("id, user:user_id(full_name), specialization")
          .limit(100)

        if (doctorsList) {
          setDoctors(
            doctorsList.map((doc: any) => ({
              id: doc.id,
              name: doc.user?.full_name || "Unknown Doctor",
              specialization: doc.specialization || "General",
            })),
          )
        }
      } catch (error) {
        console.error("[v0] Admin check error:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [supabase, router])

  useEffect(() => {
    if (!showSystemOverview) return

    const loadStats = async () => {
      try {
        const [patientCount, doctorCount, predCount, aptCount] = await Promise.all([
          supabase.from("patients").select("*", { count: "exact", head: true }),
          supabase.from("doctors").select("*", { count: "exact", head: true }),
          supabase.from("predictions").select("*", { count: "exact", head: true }),
          supabase.from("appointments").select("*", { count: "exact", head: true }),
        ]).then((results) => results.map((r) => r.count || 0))

        setStats({
          totalPatients: patientCount,
          totalDoctors: doctorCount,
          totalPredictions: predCount,
          totalAppointments: aptCount,
        })
      } catch (error) {
        console.error("[v0] Error loading stats:", error)
      }
    }

    loadStats()
  }, [showSystemOverview, supabase])

  const handleSeedTNData = async () => {
    setSeedingData(true)
    try {
      const response = await fetch("/api/admin/seed-200-predictions", {
        method: "POST",
      })
      const data = await response.json()
      if (response.ok) {
        alert(
          `✅ Tamil Nadu data seeded successfully!\n\nDoctors: ${data.doctors_created}\nPatients: ${data.patients_created}\nPredictions: ${data.predictions_created}`,
        )
        // Refresh stats if overview is open
        if (showSystemOverview) {
          setShowSystemOverview(false)
          setTimeout(() => setShowSystemOverview(true), 500)
        }
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert("Failed to seed data")
      console.error(error)
    } finally {
      setSeedingData(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Healthcare AI - Tamil Nadu</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin: {user?.email}</span>
            <Button onClick={() => router.push("/auth/logout")} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Healthcare AI Dashboard</h2>
              <p className="text-muted-foreground mt-2">Manage predictions, patients, doctors, and system data</p>
            </div>
            <Button
              onClick={() => setShowSystemOverview(!showSystemOverview)}
              variant={showSystemOverview ? "default" : "outline"}
            >
              {showSystemOverview ? "Hide System Overview" : "Show System Overview"}
            </Button>
          </div>

          {/* System Overview - Only show when toggled */}
          {showSystemOverview && (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalPatients}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Doctors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalDoctors}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">AI Predictions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalPredictions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalAppointments}</div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Doctor Filter Section */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Filter by Doctor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  >
                    <option value="all">All Doctors</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.name} - {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <Link href={selectedDoctor === "all" ? "/admin/doctors" : `/admin/doctors/${selectedDoctor}`}>
                  <Button className="gap-2">
                    <Stethoscope className="h-4 w-4" />
                    View Doctor Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Data Initialization */}
          <Card className="border-orange-500/50 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg">Data Initialization</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSeedTNData} disabled={seedingData} size="lg" className="gap-2">
                <Database className="h-4 w-4" />
                {seedingData ? "Seeding Data..." : "Seed 200 Tamil Nadu Predictions"}
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Creates 25 unique doctors, 200 unique patients across Tamil Nadu districts, and 200 AI predictions with
                real medical images from Supabase storage.
              </p>
            </CardContent>
          </Card>

          {/* Main Features Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <Link href={`/admin/predictions${selectedDoctor !== "all" ? `?doctor=${selectedDoctor}` : ""}`}>
              <Card className="h-full hover:border-primary cursor-pointer transition-colors">
                <CardHeader>
                  <BarChart3 className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>AI Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View all disease predictions with confidence scores, medical codes, X-ray availability markers, and
                    demographic factor analysis
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/doctors">
              <Card className="h-full hover:border-primary cursor-pointer transition-colors">
                <CardHeader>
                  <Stethoscope className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>View Doctors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Browse all healthcare professionals with their specializations, clinic details, and patient
                    assignments
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/patients">
              <Card className="h-full hover:border-primary cursor-pointer transition-colors">
                <CardHeader>
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>View Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Browse all unique patients with their demographics, medical history, and environmental exposure data
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Back to Dashboard */}
          <div className="flex justify-center pt-8">
            <Link href="/dashboard">
              <Button variant="outline">Back to User Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
