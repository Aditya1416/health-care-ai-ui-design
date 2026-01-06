"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ImageUploadWidget() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const response = await fetch("/api/imaging/inference", {
        method: "POST",
        body: JSON.stringify({
          imageUrl: URL.createObjectURL(file),
          imageType: "chest_xray",
        }),
      })

      if (!response.ok) throw new Error("Inference failed")

      const inferenceResult = await response.json()
      setResult(inferenceResult)
    } catch (err) {
      setError("Failed to process image")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="text-sm" />
        <Button disabled={uploading} variant="outline">
          {uploading ? "Processing..." : "Upload & Analyze"}
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <strong>Disease:</strong>
              <span>{result.disease_name}</span>
            </div>
            <div className="flex justify-between">
              <strong>Confidence:</strong>
              <span>{(result.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <strong>Severity:</strong>
              <span>{result.severity}</span>
            </div>
            <p className="text-muted-foreground text-xs mt-2 italic">{result.explanation}</p>
            <div className="mt-3 pt-3 border-t border-primary/10">
              <p className="text-xs font-semibold mb-2">Recommendations:</p>
              <ul className="text-xs space-y-1 ml-4">
                {result.recommendations?.map((rec: string, i: number) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
