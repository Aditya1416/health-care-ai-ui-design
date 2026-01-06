"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Scan } from "lucide-react"

interface PredictionListItemProps {
  prediction: {
    id: string
    predicted_disease: string
    confidence_score: number
    risk_level: string
    hasXray: boolean
    created_at: string
  }
}

export function PredictionListItem({ prediction }: PredictionListItemProps) {
  const confidencePercent = Math.round((prediction.confidence_score || 0) * 100)
  const riskColors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }

  return (
    <Link href={`/admin/predictions/${prediction.id}`}>
      <Card className="p-4 hover:border-primary/50 cursor-pointer transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{prediction.predicted_disease}</h3>
              {prediction.hasXray && (
                <Badge className="bg-blue-600 text-white text-xs whitespace-nowrap flex items-center gap-1">
                  <Scan className="h-3 w-3" />
                  X-Ray
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Created: {new Date(prediction.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-teal-600">{confidencePercent}%</div>
              <Badge className={`${riskColors[prediction.risk_level] || riskColors.low} text-xs mt-1`}>
                {prediction.risk_level}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
