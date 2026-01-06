"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { useState } from "react"

interface PredictionViewerProps {
  userId: string
  predictionData: any
}

export default function PredictionViewer({ userId, predictionData }: PredictionViewerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!predictionData || !predictionData.predictions) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            <Info className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No predictions yet. Log your symptoms and click "Generate AI Health Analysis" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="pt-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            These are preliminary health insights to help you prepare for your doctor visit. They are not a diagnosis or
            treatment recommendation. Always consult with a licensed healthcare provider.
          </p>
        </CardContent>
      </Card>

      {predictionData.predictions.map((pred: any, idx: number) => (
        <Card
          key={idx}
          className="cursor-pointer hover:border-primary transition"
          onClick={() => setExpandedId(expandedId === idx.toString() ? null : idx.toString())}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  {pred.disease_name}
                </CardTitle>
                <CardDescription className="mt-1">{pred.reasoning}</CardDescription>
              </div>
              <div className="text-right ml-4">
                <div className="text-3xl font-bold text-primary">{Math.round(pred.confidence_score * 100)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Confidence</p>
              </div>
            </div>
          </CardHeader>

          {expandedId === idx.toString() && (
            <CardContent className="space-y-4 border-t pt-4">
              <div>
                <p className="font-semibold text-sm mb-2">Contributing Factors:</p>
                <ul className="space-y-1">
                  {pred.contributing_factors.map((factor: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Next Steps:</span> Schedule an appointment with your healthcare
                  provider to discuss these findings. Bring this analysis along with your symptom log.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
