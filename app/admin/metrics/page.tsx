"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Metric {
  id: string
  patient_id: string
  metric_type: string
  value: number
  unit: string
  recorded_at: string
}

export default function MetricsPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMetrics()
  }, [page])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/metrics?page=${page}&limit=20`)
      const data = await response.json()
      setMetrics(data.metrics)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error fetching metrics:", error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Metrics</h1>
          <p className="text-muted-foreground mt-2">All recorded health metrics in the system</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metrics List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Unit</th>
                  <th className="text-left p-2">Recorded At</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 capitalize">{metric.metric_type.replace(/_/g, " ")}</td>
                    <td className="p-2">{metric.value.toFixed(2)}</td>
                    <td className="p-2">{metric.unit}</td>
                    <td className="p-2">{new Date(metric.recorded_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading} variant="outline">
                Previous
              </Button>
              <Button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
