"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    blood_type: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        setUser(currentUser)

        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", currentUser.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setEditData({
            full_name: profileData.full_name || "",
            date_of_birth: profileData.date_of_birth || "",
            gender: profileData.gender || "",
            blood_type: profileData.blood_type || "",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, router])

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      const { error } = await supabase.from("user_profiles").update(editData).eq("user_id", user.id)

      if (error) throw error

      setProfile({ ...profile, ...editData })
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">User Profile</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
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

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 border-r border-border bg-card min-h-screen p-6">
          <div className="space-y-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start text-base">
                📊 Overview
              </Button>
            </Link>
            <Link href="/dashboard/metrics">
              <Button variant="ghost" className="w-full justify-start text-base">
                📈 Health Metrics
              </Button>
            </Link>
            <Link href="/dashboard/appointments">
              <Button variant="ghost" className="w-full justify-start text-base">
                📅 Appointments
              </Button>
            </Link>
            <Link href="/dashboard/records">
              <Button variant="ghost" className="w-full justify-start text-base">
                📋 Medical Records
              </Button>
            </Link>
            <Link href="/dashboard/ai-assistant">
              <Button variant="ghost" className="w-full justify-start text-base">
                🤖 AI Assistant
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="default" className="w-full justify-start text-base">
                👤 Profile
              </Button>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto space-y-8">
            {!loading && (
              <>
                {/* Personal Information */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="fullname">Full Name</Label>
                          <Input
                            id="fullname"
                            value={editData.full_name}
                            onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                            placeholder="Enter your full name"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            id="dob"
                            type="date"
                            value={editData.date_of_birth}
                            onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <select
                            id="gender"
                            value={editData.gender}
                            onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                            className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-input text-foreground"
                          >
                            <option value="">Select gender...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="blood">Blood Type</Label>
                          <select
                            id="blood"
                            value={editData.blood_type}
                            onChange={(e) => setEditData({ ...editData, blood_type: e.target.value })}
                            className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-input text-foreground"
                          >
                            <option value="">Select blood type...</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button onClick={handleSaveProfile}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="text-lg font-medium text-foreground">{user?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="text-lg font-medium text-foreground">{editData.full_name || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="text-lg font-medium text-foreground">{editData.date_of_birth || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gender</p>
                          <p className="text-lg font-medium text-foreground capitalize">
                            {editData.gender || "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Blood Type</p>
                          <p className="text-lg font-medium text-foreground">{editData.blood_type || "Not set"}</p>
                        </div>
                        <Button onClick={() => setIsEditing(true)} className="w-full mt-4">
                          Edit Profile
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
