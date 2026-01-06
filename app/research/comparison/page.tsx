"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { AlertCircle, Grid3x3, Layers } from "lucide-react"
import Link from "next/link"

interface ComparisonState {
  userImage: string | null
  showHeatmap: boolean
  showPixelGrid: boolean
}

export default function ComparisonPage() {
  const [state, setState] = useState<ComparisonState>({
    userImage: null,
    showHeatmap: false,
    showPixelGrid: false,
  })

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setState((prev) => ({
        ...prev,
        userImage: event.target?.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  const similarityScores = [
    { disease: "Pneumonia", score: 87 },
    { disease: "Cardiomegaly", score: 34 },
    { disease: "Effusion", score: 56 },
    { disease: "Nodule", score: 23 },
    { disease: "No Finding", score: 12 },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Image Comparison Tool</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Compare patient scans with reference images (Educational Demonstration)
              </p>
            </div>
            <Link href="/research" className="text-sm text-primary hover:underline">
              ← Back to Research
            </Link>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="border-b border-border bg-destructive/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-semibold">Simulated Analysis Only</p>
              <p className="text-muted-foreground mt-1">
                This comparison view demonstrates image analysis visualization only. Similarity scores and heatmaps are
                simulated. NOT for clinical diagnosis. Always consult qualified healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Section */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <div className="text-center">
              <div className="text-4xl mb-2">📤</div>
              <p className="font-semibold text-foreground mb-2">Upload X-ray Image</p>
              <p className="text-sm text-muted-foreground">for research demonstration</p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {/* Comparison Layout */}
        {state.userImage && (
          <div className="space-y-8">
            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={() => setState((prev) => ({ ...prev, showHeatmap: !prev.showHeatmap }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  state.showHeatmap
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <Layers className="w-4 h-4" />
                Heatmap Overlay
              </button>
              <button
                onClick={() => setState((prev) => ({ ...prev, showPixelGrid: !prev.showPixelGrid }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  state.showPixelGrid
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Pixel Grid
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* User Image */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-4">Your Image</h3>
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={state.userImage || "/placeholder.svg"}
                    alt="User uploaded"
                    fill
                    className="object-contain"
                  />
                  {state.showPixelGrid && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(0deg, transparent 24%, rgba(100, 150, 255, 0.05) 25%, rgba(100, 150, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(100, 150, 255, 0.05) 75%, rgba(100, 150, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(100, 150, 255, 0.05) 25%, rgba(100, 150, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(100, 150, 255, 0.05) 75%, rgba(100, 150, 255, 0.05) 76%, transparent 77%, transparent)",
                        backgroundSize: "50px 50px",
                      }}
                    />
                  )}
                  {state.showHeatmap && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
                  )}
                </div>
              </div>

              {/* Similarity Scores */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-4">Similarity Analysis (Simulated)</h3>
                <div className="space-y-3">
                  {similarityScores.map(({ disease, score }) => (
                    <div key={disease}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{disease}</span>
                        <span className="font-mono text-primary">{score}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-chart-1"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference Image */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-4">Top Reference Match</h3>
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Reference image would appear here
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Pneumonia (87% match)</p>
              </div>
            </div>

            {/* Feature Analysis */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Feature Importance (Simulated)</h3>
              <div className="space-y-3">
                {[
                  { feature: "Edge Density", importance: 92 },
                  { feature: "Texture Pattern", importance: 78 },
                  { feature: "Brightness Range", importance: 65 },
                  { feature: "Shape Characteristics", importance: 58 },
                  { feature: "Color Distribution", importance: 45 },
                ].map(({ feature, importance }) => (
                  <div key={feature}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{feature}</span>
                      <span className="font-mono text-primary">{importance}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${importance}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
