"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function CaseDetailPage() {
  const params = useParams()
  const caseId = params.caseId as string
  const supabase = createBrowserClient()

  const [caseData, setCaseData] = useState<any>(null)
  const [artifacts, setArtifacts] = useState<any[]>([])
  const [comparisonResults, setComparisonResults] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchCaseDetails()
  }, [caseId])

  const fetchCaseDetails = async () => {
    try {
      // Fetch case
      const { data: caseItem } = await supabase.from("clinical_cases").select("*").eq("id", caseId).single()

      setCaseData(caseItem)

      // Fetch artifacts
      const { data: artifactsList } = await supabase
        .from("case_artifacts")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false })

      setArtifacts(artifactsList || [])

      // Fetch comparison results
      const { data: results } = await supabase
        .from("image_comparison_results")
        .select("*")
        .in(
          "case_artifact_id",
          (artifactsList || []).map((a) => a.id),
        )
        .order("similarity_score", { ascending: false })

      setComparisonResults(results || [])

      // Fetch analysis
      const { data: analysisData } = await supabase
        .from("case_ai_analysis")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      setAnalysis(analysisData)

      // Fetch audit log
      const { data: logs } = await supabase
        .from("case_audit_log")
        .select("*")
        .eq("case_id", caseId)
        .order("action_timestamp", { ascending: false })

      setAuditLog(logs || [])
    } catch (error) {
      console.error("Error fetching case details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/analyze`, { method: "POST" })
      if (!response.ok) throw new Error("Analysis failed")
      await fetchCaseDetails()
    } catch (error) {
      console.error("Error analyzing case:", error)
      alert("Analysis failed. Try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDownloadReport = async () => {
    try {
      // Generate mock PDF
      const reportContent = `
CLINICAL CASE REPORT
Case Number: ${caseData?.case_number}
Title: ${caseData?.case_title}
Status: ${caseData?.status}

CASE DESCRIPTION:
${caseData?.case_description}

AI ANALYSIS:
${analysis?.explanation_text || "No analysis available"}

COMPARISON RESULTS (Top Matches):
${comparisonResults
  .slice(0, 5)
  .map((r, i) => `${i + 1}. Similarity: ${r.similarity_score}% | Confidence: ${r.confidence_score}%`)
  .join("\n")}

MODEL VERSION: ${analysis?.model_version}
ANALYZED: ${analysis?.analyzed_at}

Report Generated: ${new Date().toISOString()}
      `

      const blob = new Blob([reportContent], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${caseData?.case_number}-report.txt`
      a.click()
    } catch (error) {
      console.error("Error downloading report:", error)
    }
  }

  if (loading) return <div className="p-6">Loading case details...</div>
  if (!caseData) return <div className="p-6">Case not found</div>

  // Prepare chart data
  const similarityChartData = comparisonResults.slice(0, 10).map((r, i) => ({
    match: `Match ${i + 1}`,
    similarity: r.similarity_score,
    confidence: r.confidence_score,
  }))

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{caseData.case_title}</h1>
        <p className="text-muted-foreground">
          Case #{caseData.case_number} • {caseData.status.toUpperCase()}
        </p>
      </div>

      {/* Case Info */}
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Description</p>
            <p>{caseData.case_description}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(caseData.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Priority</p>
              <p className="text-sm capitalize">{caseData.priority}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Artifacts</p>
              <p className="text-sm">{artifacts.length} files</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artifacts */}
      {artifacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Case Artifacts ({artifacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {artifacts.map((artifact) => (
                <div key={artifact.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-semibold">{artifact.artifact_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {artifact.artifact_type.toUpperCase()} • {(artifact.file_size_bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <a href={artifact.file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Actions */}
      <div className="flex gap-3">
        <Button onClick={handleAnalyze} disabled={analyzing || artifacts.length === 0} className="flex-1">
          {analyzing ? "Analyzing..." : "Run AI Analysis"}
        </Button>
        <Button onClick={handleDownloadReport} variant="outline" className="flex-1 bg-transparent">
          Download Report
        </Button>
      </div>

      {/* Comparison Results */}
      {comparisonResults.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Similarity Scores (Top 10 Matches)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={similarityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="match" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="similarity" fill="#10b981" name="Similarity %" />
                  <Bar dataKey="confidence" fill="#3b82f6" name="Confidence %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Distance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="similarity_score" name="Similarity %" />
                  <YAxis dataKey="feature_distance" name="Feature Distance" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={comparisonResults.slice(0, 20)} fill="#8b5cf6" name="Comparison Results" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Side-by-Side Image Comparison with Heatmap Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Side-by-Side Image Comparison (Top Match)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comparisonResults.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Patient Scan */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Patient Scan</p>
                      <div className="bg-muted p-4 rounded-lg aspect-square flex items-center justify-center">
                        <img
                          src={`/placeholder.svg?height=400&width=400&query=patient-medical-scan`}
                          alt="Patient scan"
                          className="max-w-full max-h-full rounded"
                        />
                      </div>
                    </div>

                    {/* Reference Scan with Heatmap Overlay */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Reference Scan (Top Match)</p>
                      <div className="bg-muted p-4 rounded-lg aspect-square flex items-center justify-center relative">
                        <img
                          src={`/placeholder.svg?height=400&width=400&query=reference-medical-scan`}
                          alt="Reference scan"
                          className="max-w-full max-h-full rounded"
                        />
                        <div className="absolute inset-4 bg-gradient-to-r from-blue-500/30 to-red-500/30 rounded opacity-60"></div>
                        <div className="absolute bottom-2 left-2 text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded">
                          Similarity: {comparisonResults[0].similarity_score.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground">Similarity Score</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {comparisonResults[0].similarity_score.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(comparisonResults[0].confidence_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground">Feature Distance</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {comparisonResults[0].feature_distance.toFixed(3)}
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground">Match Rank</p>
                      <p className="text-2xl font-bold text-orange-600">#{comparisonResults[0].top_k_match_rank}</p>
                    </div>
                  </div>

                  {/* Influential Regions */}
                  {comparisonResults[0].influential_regions && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="font-semibold mb-2 text-sm">Influential Regions</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {JSON.parse(comparisonResults[0].influential_regions).explanation}
                      </p>
                      <div className="space-y-2">
                        {JSON.parse(comparisonResults[0].influential_regions).regions.map(
                          (region: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${region.influence * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold min-w-fit">
                                {(region.influence * 100).toFixed(0)}%
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* AI Analysis */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Explanation</p>
              <p>{analysis.explanation_text}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Model Version</p>
                <p className="text-sm">{analysis.model_version}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Analyzed</p>
                <p className="text-sm">{new Date(analysis.analyzed_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Explainability Section with Disclaimer */}
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-xs font-bold">
              ⚠
            </div>
            AI-Assisted Analysis & Medical Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-800 dark:text-yellow-200">
            This analysis is <strong>AI-assisted and not a medical diagnosis</strong>. All findings must be reviewed and
            validated by qualified medical professionals. This system is designed to support clinical decision-making,
            not replace it.
          </div>

          {analysis && (
            <>
              <div>
                <p className="text-sm font-semibold mb-2">Clinical Findings & Reasoning:</p>
                <p className="text-sm text-muted-foreground">{analysis.explanation_text}</p>
              </div>

              {analysis.predicted_findings && (
                <div>
                  <p className="text-sm font-semibold mb-2">Observed Patterns:</p>
                  <ul className="space-y-1 text-sm">
                    {Array.isArray(analysis.predicted_findings) &&
                      analysis.predicted_findings.slice(0, 5).map((finding: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {analysis.feature_importance && (
                <div>
                  <p className="text-sm font-semibold mb-2">Feature Importance (Model Reasoning):</p>
                  <div className="space-y-2">
                    {Object.entries(JSON.parse(analysis.feature_importance)).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-32 text-xs capitalize">{key}</div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${value * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold">{(value * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Audit Trail */}
      {auditLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {auditLog.map((log) => (
                <div key={log.id} className="flex justify-between text-muted-foreground border-b pb-2">
                  <span className="font-semibold capitalize">{log.action.replace(/_/g, " ")}</span>
                  <span>{new Date(log.action_timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
