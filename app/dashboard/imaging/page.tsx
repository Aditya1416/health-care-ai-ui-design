"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function MedicalImagingPage() {
  const [uploading, setUploading] = useState(false)
  const [inference, setInference] = useState<any>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // In production: upload to Vercel Blob
      const formData = new FormData()
      formData.append("file", file)

      // Simulated inference call
      const res = await fetch("/api/imaging/inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: URL.createObjectURL(file),
          imageType: file.type,
        }),
      })

      const result = await res.json()
      setInference(result)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Medical Imaging Analysis</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upload X-ray or Medical Image</h2>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="mb-4" />
        <Button disabled={uploading}>{uploading ? "Processing..." : "Upload & Analyze"}</Button>
      </Card>

      {inference && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
          <div className="space-y-3">
            <p>
              <strong>Predicted Finding:</strong> {inference.predicted_disease}
            </p>
            <p>
              <strong>Confidence:</strong> {(inference.confidence_score * 100).toFixed(1)}%
            </p>
            <p>
              <strong>Model:</strong> {inference.model_version}
            </p>
            <p>
              <strong>Inference Time:</strong> {inference.inference_time_ms.toFixed(0)}ms
            </p>
            {inference.abnormalities_detected.length > 0 && (
              <div>
                <strong>Abnormalities Detected:</strong>
                <ul className="list-disc pl-5">
                  {inference.abnormalities_detected.map((abn: string, i: number) => (
                    <li key={i}>{abn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
