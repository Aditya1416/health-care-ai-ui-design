"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Heart, Calendar, FileText, Zap, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Heart, label: "Health Metrics", href: "/dashboard/metrics" },
  { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
  { icon: FileText, label: "Medical Records", href: "/dashboard/records" },
  { icon: Zap, label: "AI Assistant", href: "/dashboard/ai" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar text-sidebar-foreground rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 fixed lg:relative z-40 w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sidebar-accent rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-sidebar-accent-foreground" />
            </div>
            <h1 className="text-xl font-bold">HealthAI</h1>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/20 bg-transparent"
          >
            <LogOut size={20} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
