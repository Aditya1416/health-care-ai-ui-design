"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Send, Loader } from "lucide-react"

export default function AIAssistantPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [user, setUser] = useState<any>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [riskFactors, setRiskFactors] = useState<string[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [symptomInput, setSymptomInput] = useState("")
  const [riskInput, setRiskInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) router.push("/auth/login")
      else setUser(currentUser)
    }
    getUser()
  }, [supabase, router])

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms([...symptoms, symptomInput.trim()])
      setSymptomInput("")
    }
  }

  const addRiskFactor = () => {
    if (riskInput.trim()) {
      setRiskFactors([...riskFactors, riskInput.trim()])
      setRiskInput("")
    }
  }

  const handlePredict = async () => {
    if (symptoms.length === 0) {
      alert("Please add at least one symptom")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/predictions/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          risk_factors: riskFactors,
          environmental: { aqi: 100, temperature: 25 },
        }),
      })

      const data = await response.json()
      setPredictions(data.predictions || [])
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    } catch (error) {
      console.error("Prediction error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">AI Health Assistant</h1>
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
              <Button variant="default" className="w-full justify-start text-base">
                🤖 AI Assistant
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="ghost" className="w-full justify-start text-base">
                👤 Profile
              </Button>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Health Analysis</h2>
              <p className="text-muted-foreground mt-2">
                Describe your symptoms and risk factors for AI-powered health insights
              </p>
              <div className="bg-primary/10 text-primary p-4 rounded-lg mt-4 text-sm">
                ⚠️ This tool is for educational purposes only and not a substitute for professional medical advice.
              </div>
            </div>

            {/* Input Section */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Enter Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Symptoms */}
                <div>
                  <label className="text-sm font-semibold">Symptoms</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSymptom()}
                      placeholder="e.g., fever, cough, headache"
                      className="flex-1"
                    />
                    <Button onClick={addSymptom} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {symptoms.map((s, i) => (
                      <div
                        key={i}
                        className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {s}
                        <button onClick={() => setSymptoms(symptoms.filter((_, idx) => idx !== i))} className="ml-1">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <label className="text-sm font-semibold">Risk Factors</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={riskInput}
                      onChange={(e) => setRiskInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addRiskFactor()}
                      placeholder="e.g., obesity, stress, poor sleep"
                      className="flex-1"
                    />
                    <Button onClick={addRiskFactor} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {riskFactors.map((r, i) => (
                      <div
                        key={i}
                        className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {r}
                        <button
                          onClick={() => setRiskFactors(riskFactors.filter((_, idx) => idx !== i))}
                          className="ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handlePredict} className="w-full gap-2" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Loader className="animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Analyze Symptoms
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Predictions */}
            {predictions.length > 0 && (
              <div ref={scrollRef}>
                <h3 className="text-2xl font-bold text-foreground mb-4">AI Health Analysis Results</h3>
                <div className="space-y-4">
                  {predictions.map((pred, i) => (
                    <Card key={i} className="border-l-4 border-primary">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xl font-bold text-foreground">{pred.disease}</h4>
                              <p className="text-muted-foreground">Confidence Score</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-primary">{pred.confidence}%</div>
                              <div className="text-sm text-muted-foreground">Severity: {pred.severity}/5</div>
                            </div>
                          </div>

                          <div className="bg-muted p-4 rounded">
                            <p className="text-sm font-semibold text-foreground mb-2">Contributing Factors:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Symptom Match: {pred.contributing_factors?.symptoms?.toFixed(1)}%</li>
                              <li>• Risk Factors: {pred.contributing_factors?.risk_factors?.toFixed(1)}%</li>
                            </ul>
                          </div>

                          <div className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 p-3 rounded text-sm">
                            This is an AI analysis for informational purposes. Please consult a healthcare professional
                            for diagnosis.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
