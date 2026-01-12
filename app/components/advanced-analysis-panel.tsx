"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react"
import type { AdvancedAnalysis } from "@/lib/services/advanced-ai-analysis"

interface AdvancedAnalysisPanelProps {
  analysis: AdvancedAnalysis
}

export default function AdvancedAnalysisPanel({ analysis }: AdvancedAnalysisPanelProps) {
  const riskColors = {
    low: "bg-green-100 text-green-800 border-green-300",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    critical: "bg-red-100 text-red-800 border-red-300",
  }

  return (
    <div className="space-y-4">
      {/* Risk Stratification */}
      <Card className={`border-2 ${riskColors[analysis.risk_stratification]}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Risk Stratification: {analysis.risk_stratification.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Based on confidence score ({(analysis.primary_diagnosis.probability * 100).toFixed(1)}%), severity level,
            and environmental risk factors, this patient is classified as{" "}
            <strong>{analysis.risk_stratification}</strong> risk.
          </p>
        </CardContent>
      </Card>

      {/* Confidence Intervals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Diagnostic Confidence Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Primary Diagnosis Probability</span>
              <span className="text-sm font-bold">{(analysis.primary_diagnosis.probability * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${analysis.primary_diagnosis.probability * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              95% Confidence Interval: {(analysis.primary_diagnosis.confidence_interval.lower * 100).toFixed(1)}% -{" "}
              {(analysis.primary_diagnosis.confidence_interval.upper * 100).toFixed(1)}%
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-slate-50 rounded p-3">
              <p className="text-xs text-muted-foreground font-semibold">Symptom Specificity</p>
              <p className="text-2xl font-bold mt-2">
                {(analysis.confidence_factors.symptom_specificity * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-slate-50 rounded p-3">
              <p className="text-xs text-muted-foreground font-semibold">Demographic Fit</p>
              <p className="text-2xl font-bold mt-2">
                {(analysis.confidence_factors.demographic_fit * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-slate-50 rounded p-3">
              <p className="text-xs text-muted-foreground font-semibold">Environmental Risk</p>
              <p className="text-2xl font-bold mt-2">
                {(analysis.confidence_factors.environmental_risk * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-slate-50 rounded p-3">
              <p className="text-xs text-muted-foreground font-semibold">Evidence Strength</p>
              <p className="text-2xl font-bold mt-2">
                {(analysis.confidence_factors.evidence_strength * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Differential Diagnoses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Differential Diagnoses (Ranked)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.differential_diagnoses.map((diff) => (
            <div
              key={diff.icd10_code}
              className="border border-border rounded-lg p-3 space-y-2 hover:bg-slate-50 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">
                    #{diff.rank} - {diff.disease_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{diff.icd10_code}</p>
                </div>
                <Badge>{(diff.probability * 100).toFixed(1)}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                CI: {(diff.confidence_interval.lower * 100).toFixed(1)}% -{" "}
                {(diff.confidence_interval.upper * 100).toFixed(1)}%
              </p>
              <div className="text-xs space-y-1">
                <p className="text-green-700">✓ Supporting: {diff.supporting_evidence.join(", ")}</p>
                <p className="text-orange-700">⊗ Against: {diff.against_evidence.join(", ")}</p>
              </div>
              <p className="text-xs font-semibold text-slate-700 pt-1">
                Next Tests: {diff.next_diagnostic_tests.slice(0, 2).join(", ")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Population Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Population Risk Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded p-3">
              <p className="text-xs text-blue-600 font-semibold">Relative Risk vs Population</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {analysis.population_comparison.patient_risk_vs_population.toFixed(1)}x
              </p>
            </div>
            <div className="bg-purple-50 rounded p-3">
              <p className="text-xs text-purple-600 font-semibold">Population Prevalence</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {analysis.population_comparison.prevalence_in_population.toFixed(2)}%
              </p>
            </div>
            <div className="bg-indigo-50 rounded p-3">
              <p className="text-xs text-indigo-600 font-semibold">Age-Adjusted Risk</p>
              <p className="text-2xl font-bold text-indigo-900 mt-2">
                {analysis.population_comparison.age_adjusted_risk.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uncertainty & Limitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Model Transparency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Uncertainty Factors:</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
              {analysis.uncertainty_factors.map((factor, i) => (
                <li key={i}>{factor}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Model Limitations:</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
              {analysis.model_limitations.map((limit, i) => (
                <li key={i}>{limit}</li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
            <p className="text-xs text-amber-900">
              <strong>Clinical Recommendation:</strong> This analysis is a decision-support tool. Always validate with
              clinical examination, laboratory tests, and specialist consultation for final diagnosis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
