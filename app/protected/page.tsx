"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email?: string
}

export default function ProtectedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Logged in as:</p>
              <p className="text-lg font-semibold text-foreground">{user?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
