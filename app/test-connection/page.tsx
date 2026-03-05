"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL, getPatientPredictions, checkColabHealth, fetchFromColab } from "@/lib/backend/api"

type TestResult = {
  name: string
  status: "pending" | "success" | "error"
  message: string
  data?: unknown
}

export default function TestConnectionPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [patientId, setPatientId] = useState("")
  const [customEndpoint, setCustomEndpoint] = useState("")

  const updateResult = (name: string, status: TestResult["status"], message: string, data?: unknown) => {
    setResults((prev) => {
      const existing = prev.findIndex((r) => r.name === name)
      const newResult = { name, status, message, data }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = newResult
        return updated
      }
      return [...prev, newResult]
    })
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Check API Base URL
    updateResult("API Configuration", "pending", "Checking API base URL...")
    updateResult("API Configuration", "success", `Base URL: ${API_BASE_URL}`)

    // Test 2: Health Check
    updateResult("Backend Health", "pending", "Pinging Colab backend...")
    try {
      const isHealthy = await checkColabHealth()
      if (isHealthy) {
        updateResult("Backend Health", "success", "Colab backend is reachable")
      } else {
        updateResult("Backend Health", "error", "Backend returned non-OK status")
      }
    } catch (error) {
      updateResult("Backend Health", "error", `Failed to reach backend: ${error}`)
    }

    // Test 3: Fetch root endpoint
    updateResult("Root Endpoint", "pending", "Fetching root endpoint...")
    try {
      const response = await fetch(API_BASE_URL, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      const data = await response.json()
      updateResult("Root Endpoint", "success", "Root endpoint responded", data)
    } catch (error) {
      updateResult("Root Endpoint", "error", `Root endpoint failed: ${error}`)
    }

    // Test 4: Fetch /docs or /openapi.json
    updateResult("API Documentation", "pending", "Checking if API docs are available...")
    try {
      const response = await fetch(`${API_BASE_URL}/openapi.json`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      if (response.ok) {
        const data = await response.json()
        const endpoints = Object.keys(data.paths || {})
        updateResult("API Documentation", "success", `Found ${endpoints.length} endpoints`, endpoints.slice(0, 10))
      } else {
        updateResult("API Documentation", "error", "OpenAPI docs not available")
      }
    } catch (error) {
      updateResult("API Documentation", "error", `Could not fetch API docs: ${error}`)
    }

    setIsRunning(false)
  }

  const testPatientPredictions = async () => {
    if (!patientId.trim()) {
      updateResult("Patient Predictions", "error", "Please enter a patient ID")
      return
    }

    updateResult("Patient Predictions", "pending", `Fetching predictions for patient ${patientId}...`)
    try {
      const data = await getPatientPredictions(patientId)
      if (data) {
        updateResult("Patient Predictions", "success", "Successfully fetched predictions", data)
      } else {
        updateResult("Patient Predictions", "error", "No data returned")
      }
    } catch (error) {
      updateResult("Patient Predictions", "error", `Failed: ${error}`)
    }
  }

  const testCustomEndpoint = async () => {
    if (!customEndpoint.trim()) {
      updateResult("Custom Endpoint", "error", "Please enter an endpoint")
      return
    }

    const endpoint = customEndpoint.startsWith("/") ? customEndpoint : `/${customEndpoint}`
    updateResult("Custom Endpoint", "pending", `Fetching ${endpoint}...`)
    try {
      const data = await fetchFromColab(endpoint)
      if (data) {
        updateResult("Custom Endpoint", "success", `Successfully fetched ${endpoint}`, data)
      } else {
        updateResult("Custom Endpoint", "error", "No data returned or error occurred")
      }
    } catch (error) {
      updateResult("Custom Endpoint", "error", `Failed: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Backend Connection Test</h1>
          <p className="text-muted-foreground">
            Test the connection between this frontend and your Colab FastAPI backend
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Backend URL:</span>
            <code className="rounded bg-muted px-2 py-1 text-sm">{API_BASE_URL}</code>
          </div>
        </div>

        {/* Quick Test Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Connection Test</CardTitle>
            <CardDescription>Run basic connectivity tests to verify your Colab backend is reachable</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runAllTests} disabled={isRunning}>
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </Button>
          </CardContent>
        </Card>

        {/* Patient Predictions Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Patient Predictions Endpoint</CardTitle>
            <CardDescription>GET /patients/{"{patient_id}"}/predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={testPatientPredictions}>Test</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Endpoint Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Custom Endpoint</CardTitle>
            <CardDescription>Test any endpoint on your Colab backend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="customEndpoint">Endpoint Path</Label>
                <Input
                  id="customEndpoint"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="/your-endpoint"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={testCustomEndpoint}>Test</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.name}</span>
                    <Badge
                      variant={
                        result.status === "success"
                          ? "default"
                          : result.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
                  {result.data && (
                    <pre className="mt-2 max-h-60 overflow-auto rounded bg-muted p-2 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">If tests fail:</strong>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Make sure your Colab notebook is running</li>
                <li>Verify ngrok tunnel is active and the URL matches</li>
                <li>Check that CORS is enabled in your FastAPI backend</li>
                <li>Ensure the ngrok URL has not changed (free tier URLs change on restart)</li>
              </ul>
            </div>
            <div>
              <strong className="text-foreground">Required FastAPI CORS setup:</strong>
              <pre className="mt-2 rounded bg-muted p-3 text-xs">
{`from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
