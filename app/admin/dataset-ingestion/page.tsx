"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"

export default function DatasetIngestionPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const uploadCSV = async (e: React.ChangeEvent<HTMLInputElement>, datasetType: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("datasetType", datasetType)

      const response = await fetch("/api/data/csv-ingest", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setResults({ error: "Upload failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Dataset Ingestion</h1>
      <p className="text-muted-foreground">
        Upload CSV datasets for health metrics, environmental data, and patient records
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Health Metrics (EHR)</h2>
          <p className="mb-4 text-sm text-muted-foreground">50K+ tabular health records</p>
          <label className="cursor-pointer">
            <span className="inline-block rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              Upload CSV
            </span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => uploadCSV(e, "health-metrics")}
              disabled={loading}
            />
          </label>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Environmental Data (AQI)</h2>
          <p className="mb-4 text-sm text-muted-foreground">Chennai air quality + temperature</p>
          <label className="cursor-pointer">
            <span className="inline-block rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              Upload CSV
            </span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => uploadCSV(e, "environmental-data")}
              disabled={loading}
            />
          </label>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Patient Data (EHR)</h2>
          <p className="mb-4 text-sm text-muted-foreground">Synthetic patient demographics</p>
          <label className="cursor-pointer">
            <span className="inline-block rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              Upload CSV
            </span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => uploadCSV(e, "patient-data")}
              disabled={loading}
            />
          </label>
        </Card>
      </div>

      {results && (
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Ingestion Results</h3>
          <pre className="overflow-auto rounded bg-muted p-4 text-sm">{JSON.stringify(results, null, 2)}</pre>
        </Card>
      )}
    </div>
  )
}
