"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/diagnostics/image-access")
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Diagnostic check failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Image Access & RLS Policy Check</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostics} disabled={loading} className="mb-6">
            {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Run Diagnostics"}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">User Status</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    <strong>User ID:</strong> {results.userStatus.userId}
                  </li>
                  <li>
                    <strong>Email:</strong> {results.userStatus.email}
                  </li>
                  <li>
                    <strong>Is Admin:</strong>{" "}
                    {results.userStatus.isAdmin ? (
                      <span className="text-green-600 font-semibold">✓ Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ No</span>
                    )}
                  </li>
                </ul>
              </div>

              <div
                className={`border rounded-lg p-4 ${
                  results.imageAccess.canFetchAll ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  {results.imageAccess.canFetchAll ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3
                      className={`font-semibold ${results.imageAccess.canFetchAll ? "text-green-900" : "text-red-900"}`}
                    >
                      Image Access
                    </h3>
                    <ul
                      className={`text-sm space-y-1 ${results.imageAccess.canFetchAll ? "text-green-700" : "text-red-700"}`}
                    >
                      <li>
                        <strong>Can Fetch All:</strong> {results.imageAccess.canFetchAll ? "✓ Yes" : "✗ No"}
                      </li>
                      <li>
                        <strong>Total Images:</strong> {results.imageAccess.allImagesCount}
                      </li>
                      {results.imageAccess.allImagesError && (
                        <li>
                          <strong>Error:</strong> {results.imageAccess.allImagesError}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div
                className={`border rounded-lg p-4 ${
                  results.diseaseSearch.canFetchAsthma ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  {results.diseaseSearch.canFetchAsthma ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3
                      className={`font-semibold ${results.diseaseSearch.canFetchAsthma ? "text-green-900" : "text-red-900"}`}
                    >
                      Disease-Specific Search (Asthma)
                    </h3>
                    <ul
                      className={`text-sm space-y-1 ${results.diseaseSearch.canFetchAsthma ? "text-green-700" : "text-red-700"}`}
                    >
                      <li>
                        <strong>Can Fetch:</strong> {results.diseaseSearch.canFetchAsthma ? "✓ Yes" : "✗ No"}
                      </li>
                      <li>
                        <strong>Image Count:</strong> {results.diseaseSearch.asthmaImagesCount}
                      </li>
                      {results.diseaseSearch.asthmaError && (
                        <li>
                          <strong>Error:</strong> {results.diseaseSearch.asthmaError}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {results.recommendations && results.recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Recommendations</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {results.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
