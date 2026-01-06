"use client"

import type React from "react"
import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <Link href="/" className="mb-8">
        <div className="text-3xl font-bold text-primary">HealthcareAI</div>
      </Link>

      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <p className="text-center text-muted-foreground text-sm mt-2">Sign in to your healthcare dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">{error}</div>}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="bg-input"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="bg-input"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/sign-up" className="text-primary font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground text-center">Demo: aditya161499@gmail.com / your-password</p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
