"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [supabase, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Spinner />
      </div>
    )
  }

  return <>{children}</>
}
