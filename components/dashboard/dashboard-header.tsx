"use client"

import { useEffect, useState } from "react"
import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [supabase])

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">{user?.email}</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2">
          <Bell size={20} />
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings size={20} />
        </Button>
      </div>
    </header>
  )
}
