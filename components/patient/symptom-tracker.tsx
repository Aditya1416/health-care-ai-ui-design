"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Brain } from "lucide-react"

interface SymptomTrackerProps {
  userId: string
  onPredictionGenerated: (data: any) => void
}

export default function SymptomTracker({ userId, onPredictionGenerated }: SymptomTrackerProps) {
  const [symptoms, setSymptoms] = useState<
    Array<{ id: string; name: string; severity: "mild" | "moderate" | "severe"; duration: number }>
  >([
    { id: "1", name: "Cough", severity: "moderate", duration: 3 },
    { id: "2", name: "Sore throat", severity: "mild", duration: 2 },
  ])

  const [newSymptom, setNewSymptom] = useState("")
  const [newSeverity, setNewSeverity] = useState<"mild" | "moderate" | "severe">("moderate")

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setSymptoms([
        ...symptoms,
        {
          id: Date.now().toString(),
          name: newSymptom,
          severity: newSeverity,
          duration: 1,
        },
      ])
      setNewSymptom("")
    }
  }

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter((s) => s.id !== id))
  }

  const generatePrediction = () => {
    // Simulate prediction generation
    onPredictionGenerated({
      predictions: [
        {
          disease_name: "Upper Respiratory Infection",
          icd10_code: "J06.9",
          confidence_score: 0.78,
          reasoning:
            "Your symptoms of cough and sore throat are consistent with viral upper respiratory infection. Duration and severity match typical presentation.",
          contributing_factors: ["Symptom onset pattern", "Moderate severity", "Duration of symptoms"],
        },
        {
          disease_name: "Common Cold",
          icd10_code: "J00",
          confidence_score: 0.65,
          reasoning:
            "Mild to moderate symptoms over 2-3 days suggest possible viral cold. Environmental factors and seasonal patterns support this.",
          contributing_factors: ["Short duration", "Mild symptoms", "Seasonal prevalence"],
        },
      ],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Symptoms</CardTitle>
        <CardDescription>Log your symptoms to get AI health insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Symptoms List */}
        <div className="space-y-3">
          {symptoms.map((symptom) => (
            <div
              key={symptom.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{symptom.name}</p>
                <p className="text-sm text-muted-foreground">
                  {symptom.severity} • {symptom.duration} day{symptom.duration !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => removeSymptom(symptom.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Symptom */}
        <div className="space-y-3 pt-4 border-t">
          <p className="font-semibold text-foreground">Add New Symptom</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Headache, Fever, Nausea..."
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value as "mild" | "moderate" | "severe")}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
            <Button onClick={addSymptom} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Generate Prediction */}
        <Button onClick={generatePrediction} className="w-full" size="lg">
          <Brain className="w-4 h-4 mr-2" />
          Generate AI Health Analysis
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Click above to get preliminary health insights based on your symptoms and environmental data
        </p>
      </CardContent>
    </Card>
  )
}
